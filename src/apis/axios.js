import axios from 'axios';

// 공통 설정 상수
const PUBLIC_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOCAL_API_BASE_URL = import.meta.env.VITE_API_LOCAL_URL || PUBLIC_API_BASE_URL;
const PRIVATE_API_BASE_URL = import.meta.env.VITE_APP_API_URL || PUBLIC_API_BASE_URL;
const REQUEST_TIMEOUT = 30000;
const REFRESH_ENDPOINT = '/auths/refresh';

/**
 * 백엔드 라우트가 모두 `/api` 아래일 때 상대 경로를 한 번만 보정합니다.
 * 이미 `/api` 또는 `http(s)://` 로 시작하면 그대로 둡니다.
 */
const ensureApiPath = (url) => {
  if (url == null || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (path === '/api' || path.startsWith('/api/')) return path;
  return `/api${path}`;
};

const attachApiPrefixInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    if (config.url != null) {
      config.url = ensureApiPath(config.url);
    }
    return config;
  });
};

// Axios 인스턴스 생성 유틸
const createApiInstance = (baseURL, options = {}) =>
  axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

/** 토큰이 필요 없는 기본 API 인스턴스 */
const publicApi = createApiInstance(PUBLIC_API_BASE_URL);

/** 로컬 API 인스턴스 */
const localApi = createApiInstance(LOCAL_API_BASE_URL);

/** 토큰이 필요한 인증 API 인스턴스 */
const privateApi = createApiInstance(PRIVATE_API_BASE_URL);

attachApiPrefixInterceptor(publicApi);
attachApiPrefixInterceptor(localApi);
attachApiPrefixInterceptor(privateApi);

/**
 * 요청 인터셉터: private 요청마다 토큰 추가
 */
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 동시 401 처리용 플래그 및 대기열
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/admin/login';
};

/**
 * 응답 인터셉터: 토큰 만료(401) 시 재발급 시도
 */
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // 네트워크 오류 또는 응답 없음
    if (!response) {
      return Promise.reject(error);
    }

    // 401 이 아니거나 이미 재시도한 요청이면 그대로 반환
    if (response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    // 이미 리프레시 요청 중이면, 새 토큰을 기다렸다가 재요청
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!config.headers) config.headers = {};
          config.headers.Authorization = `Bearer ${newToken}`;
          privateApi(config).then(resolve).catch(reject);
        });
      });
    }

    // 리프레시 최초 진입
    isRefreshing = true;

    try {
      const res = await publicApi.post(
        REFRESH_ENDPOINT,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );
      // 서버 응답: { success, code, message, data: "<newAccessToken>" }
      const newToken = res?.data;

      if (!newToken) {
        throw new Error('리프레시 응답에 토큰이 없습니다.');
      }

      localStorage.setItem('accessToken', newToken);
      isRefreshing = false;
      onRefreshed(newToken);

      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${newToken}`;

      return privateApi(config);
    } catch (refreshError) {
      isRefreshing = false;
      forceLogout();
      return Promise.reject(refreshError);
    }
  },
);

// 공통 data 언래핑 유틸
const unwrap = (promise) => promise.then((res) => res.data);

/**
 * 통합 서비스 객체
 * - 호출부에서는 리소스 경로만 넘깁니다 (예: `/payments`). 요청 시 `/api` 접두사가 자동으로 붙습니다.
 * - 항상 data만 반환하도록 래핑
 */
export const APIService = {
  public: {
    get: (url, config = {}) => unwrap(publicApi.get(url, config)),
    post: (url, data = {}, config = {}) => unwrap(publicApi.post(url, data, config)),
    put: (url, data = {}, config = {}) => unwrap(publicApi.put(url, data, config)),
    patch: (url, data = {}, config = {}) => unwrap(publicApi.patch(url, data, config)),
    delete: (url, config = {}) => unwrap(publicApi.delete(url, config)),
  },
  local: {
    get: (url, config = {}) => unwrap(localApi.get(url, config)),
    post: (url, data = {}, config = {}) => unwrap(localApi.post(url, data, config)),
    put: (url, data = {}, config = {}) => unwrap(localApi.put(url, data, config)),
    patch: (url, data = {}, config = {}) => unwrap(localApi.patch(url, data, config)),
    delete: (url, config = {}) => unwrap(localApi.delete(url, config)),
  },
  private: {
    get: (url, config = {}) => unwrap(privateApi.get(url, config)),
    post: (url, data = {}, config = {}) => unwrap(privateApi.post(url, data, config)),
    put: (url, data = {}, config = {}) => unwrap(privateApi.put(url, data, config)),
    patch: (url, data = {}, config = {}) => unwrap(privateApi.patch(url, data, config)),
    delete: (url, config = {}) => unwrap(privateApi.delete(url, config)),
  },
};

// 인스턴스를 직접 써야 할 경우 대비 export
export default { public: publicApi, local: localApi, private: privateApi };

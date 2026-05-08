/**
 * 서버 공통 본문 `{ success?, code?, message?, data }` 에서 `data`만 꺼냅니다.
 * `success` 없이 `code`만 있는 페이로드도 처리합니다.
 * 레거시처럼 배열·객체 본문만 오는 경우는 그대로 반환합니다.
 * @param {unknown} payload
 * @returns {unknown}
 */
export function extractApiData(payload) {
  let p = payload;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      return payload;
    }
  }
  if (p == null || typeof p !== 'object') return p;
  if (Array.isArray(p)) return p;

  const hasData = 'data' in p && p.data !== undefined;
  const looksWrapped =
    hasData && ('success' in p || typeof p.code === 'number');

  if (looksWrapped) return p.data;
  return p;
}

/** 목록 API: 배열 / `{ content: [] }` / 단일 객체를 배열로 맞춤 */
export function normalizeToArray(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object' && Array.isArray(raw.content)) return raw.content;
  return [];
}

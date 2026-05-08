/**
 * 서버 공통 본문 `{ success, code, message, data }` 에서 `data`만 꺼냅니다.
 * 레거시처럼 배열·객체 본문만 오는 경우는 그대로 반환합니다.
 * @param {unknown} payload
 * @returns {unknown}
 */
export function extractApiData(payload) {
  if (payload == null || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload;
  if ('success' in payload && 'data' in payload) return payload.data;
  return payload;
}

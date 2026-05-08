/**
 * Mobile flow: unwrap API body and normalize delivery lists.
 * APIService returns axios `data` (BaseResponse-shaped for public APIs).
 */

export function extractListPayload(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

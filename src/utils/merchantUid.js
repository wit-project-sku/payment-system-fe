/**
 * Client-generated merchant order id for idempotent payment requests.
 */
export function generateMerchantUid() {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.randomUUID) {
    return `WIT_ORD_${cryptoObj.randomUUID().replace(/-/g, '')}`;
  }
  return `WIT_ORD_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

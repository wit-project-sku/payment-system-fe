import { APIService } from './axios';

/** Nest payment-agent: POST /api/payments (ApproveRequestDto). */
const PAYMENTS_APPROVE_PATH = '/api/payments';

/**
 * @param {object} input
 * @param {string} input.merchantUid
 * @param {{ productId: number, quantity: number }[]} input.items
 * @param {string|number} input.totalAmount — normalized to digits-only string (1–10 chars)
 * @param {string} input.phoneNumber — normalized to 10–11 digits
 * @returns {object} body JSON-safe for ApproveRequestDto
 */
export function buildApproveRequestBody(input) {
  const merchantUid = String(input.merchantUid ?? '').trim();
  if (!merchantUid) {
    throw new Error('merchantUid is required');
  }

  const items = Array.isArray(input.items) ? input.items : [];
  const normalizedItems = items.map((row) => {
    const productId = Math.floor(Number(row.productId));
    const quantity = Math.max(1, Math.floor(Number(row.quantity)));
    if (!Number.isFinite(productId) || productId < 1) {
      throw new Error('each item needs a valid productId');
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error('each item needs quantity >= 1');
    }
    return { productId, quantity };
  });

  if (normalizedItems.length === 0) {
    throw new Error('items must be non-empty');
  }

  const totalDigits = String(input.totalAmount ?? '').replace(/\D/g, '');
  if (totalDigits.length < 1 || totalDigits.length > 10) {
    throw new Error('totalAmount must be 1–10 digits');
  }

  const phoneDigits = String(input.phoneNumber ?? '').replace(/\D/g, '');
  if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
    throw new Error('phoneNumber must be 10 or 11 digits');
  }

  return {
    merchantUid,
    items: normalizedItems,
    totalAmount: totalDigits,
    phoneNumber: phoneDigits,
  };
}

/**
 * @param {object} payload — same fields as {@link buildApproveRequestBody}
 */
export const approvePayment = (payload) => {
  const body = buildApproveRequestBody(payload);
  return APIService.local.post(PAYMENTS_APPROVE_PATH, body);
};

export const fetchOrderByPhone = async (phoneNumber) => {
  try {
    const res = await APIService.public.get('/payments/search', {
      params: { phoneNumber },
    });
    return res;
  } catch (err) {
    console.error('주문 조회 실패:', err);
    throw err;
  }
};

// 승인 번호로 특정 결제 내역 조회
export const getPaymentByApprovalNumber = async (approvalNumber) => {
  try {
    const res = await APIService.public.get(`/payments/${approvalNumber}`);
    return res;
  } catch (err) {
    console.error('결제 내역 조회 실패:', err);
    throw err;
  }
};

import { APIService } from './axios';

/**
 * `GET /api/deliveries/search` (public). Optional `keyword` filters by delivery status enum name (e.g. `ORDERED` for mobile order completion).
 * @param {string} phoneNumber
 * @param {{ keyword?: string }} [query]
 */
export const fetchDeliveryByPhone = async (phoneNumber, query = {}) => {
  try {
    const params = { phoneNumber };
    if (query.keyword != null && String(query.keyword).trim() !== '') {
      params.keyword = String(query.keyword).trim();
    }
    const res = await APIService.public.get('/deliveries/search', { params });
    return res;
  } catch (err) {
    console.error('주문 조회 실패:', err);
    throw err;
  }
};

export const saveDeliveryOptions = async (deliveryId, payload) => {
  try {
    const res = await APIService.public.put(`/deliveries/${deliveryId}`, payload);
    return res;
  } catch (err) {
    console.error('배송 옵션 저장 실패:', err);
    throw err;
  }
};

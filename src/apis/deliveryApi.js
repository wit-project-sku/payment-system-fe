import { APIService } from './axios';

/**
 * `GET /api/deliveries/search` (public). Optional `order` filters by delivery status (e.g. `ORDERED` for mobile order completion).
 * @param {string} phoneNumber
 * @param {{ order?: string }} [query]
 */
export const fetchDeliveryByPhone = async (phoneNumber, query = {}) => {
  try {
    const params = { phoneNumber };
    if (query.order != null && String(query.order).trim() !== '') {
      params.order = String(query.order).trim();
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

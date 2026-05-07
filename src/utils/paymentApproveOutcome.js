/**
 * Helpers for interpreting POST /api/payments responses and axios errors.
 */

function extractServerMessage(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const m = obj.message;
  if (m == null) return '';
  if (Array.isArray(m)) return m.filter(Boolean).join(', ');
  return String(m).trim();
}

/**
 * @param {unknown} body — JSON body after APIService unwrap (axios response.data)
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function interpretApproveResponse(body) {
  if (body == null || typeof body !== 'object') {
    return { ok: false, message: '올바르지 않은 응답입니다.' };
  }

  if (body.success === false) {
    const msg = extractServerMessage(body) || '결제가 완료되지 않았습니다.';
    return { ok: false, message: msg };
  }

  if (body.success === true) {
    return { ok: true };
  }

  const nested = body.data != null && typeof body.data === 'object' ? body.data : null;

  if (nested?.success === false) {
    const msg = extractServerMessage(nested) || extractServerMessage(body) || '결제가 완료되지 않았습니다.';
    return { ok: false, message: msg };
  }

  if (nested?.success === true) {
    return { ok: true };
  }

  const hasImplicitOk =
    body.approvalNumber != null ||
    body.transactionId != null ||
    body.paymentId != null ||
    body.orderId != null ||
    body.status === 'APPROVED' ||
    body.status === 'SUCCESS' ||
    body.status === 'approved' ||
    (nested &&
      (nested.approvalNumber != null ||
        nested.transactionId != null ||
        nested.paymentId != null ||
        nested.orderId != null));

  if (hasImplicitOk) {
    return { ok: true };
  }

  const tentativeMsg = extractServerMessage(body);
  if (tentativeMsg) {
    return { ok: false, message: tentativeMsg };
  }

  return { ok: false, message: '결제 결과를 확인할 수 없습니다.' };
}

/**
 * @returns {{ kind: 'payment' | 'network', message: string }}
 */
export function interpretApproveAxiosError(err) {
  const status = err?.response?.status;
  const hasResponse = err?.response != null;
  const data = err?.response?.data;

  let message = '';
  if (typeof data === 'string') message = data.trim();
  else if (data && typeof data === 'object') {
    message = extractServerMessage(data);
    if (!message && data.error != null) message = String(data.error).trim();
  }

  if (!message && err?.code === 'ECONNABORTED') {
    message = '요청 시간이 초과되었습니다.';
  }
  if (!message && err?.message === 'Network Error') {
    message = '네트워크 연결을 확인해 주세요.';
  }
  if (!message) {
    message = '결제 처리 중 오류가 발생했습니다.';
  }

  const kind =
    !hasResponse || status == null || status >= 500
      ? 'network'
      : status >= 400 && status < 500
        ? 'payment'
        : 'network';

  return { kind, message };
}

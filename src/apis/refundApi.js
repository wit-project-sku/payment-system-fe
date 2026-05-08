import { APIService } from './axios';

const REQUEST_PART_NAME = 'request';

/**
 * @typedef {object} RefundRequestPayload
 * @property {string} transactionId
 * @property {string} phoneNumber
 * @property {string} refundReason
 * @property {string} description
 */

/**
 * @typedef {object} RefundImageItem
 * @property {number} id
 * @property {string} imageUrl
 */

/**
 * @typedef {object} RefundResponseData
 * @property {number} id
 * @property {string} transactionId
 * @property {string} phoneNumber
 * @property {string} [receiverName]
 * @property {string} refundReason
 * @property {string} description
 * @property {RefundImageItem[]} images
 * @property {string} refundStatus
 */

/**
 * POST /api/refunds 성공 시 본문 (`BaseResponse<RefundResponseData>`)
 * @typedef {object} CreateRefundSuccessBody
 * @property {true} success
 * @property {number} code
 * @property {string} message
 * @property {RefundResponseData} data
 */

const buildRefundMultipart = (request, images = []) => {
  const formData = new FormData();

  formData.append(REQUEST_PART_NAME, new Blob([JSON.stringify(request)], { type: 'application/json' }));

  if (Array.isArray(images)) {
    images.filter(Boolean).forEach((file) => {
      formData.append('images', file);
    });
  }

  return formData;
};

const multipartConfig = {
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData && headers) {
        if (typeof headers.delete === 'function') {
          headers.delete('Content-Type');
        } else {
          delete headers['Content-Type'];
        }
      }
      return data;
    },
  ],
};

/**
 * 환불 신청 생성 — `POST /api/refunds` (multipart: `request` JSON + `images` files)
 * @param {RefundRequestPayload} refundRequest
 * @param {File[]} images
 * @returns {Promise<CreateRefundSuccessBody>}
 */
export const createRefund = async (refundRequest, images = []) => {
  try {
    const formData = buildRefundMultipart(refundRequest, images);
    /** @type {unknown} */
    const body = await APIService.public.post('/refunds', formData, multipartConfig);

    if (body == null || typeof body !== 'object' || body.success !== true) {
      const msg =
        typeof body === 'object' && body != null && 'message' in body && typeof body.message === 'string'
          ? body.message
          : '환불 신청에 실패했습니다.';
      const err = new Error(msg);
      err.cause = body;
      throw err;
    }

    return /** @type {CreateRefundSuccessBody} */ (body);
  } catch (err) {
    console.error('환불 신청 실패:', err);
    throw err;
  }
};

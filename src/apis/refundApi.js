import { APIService } from './axios';

const REQUEST_PART_NAME = 'request';

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

// 환불 신청 생성 (POST …/api/refunds; 경로는 axios 인터셉터에서 /api 접두사)
export const createRefund = async (refundRequest, images = []) => {
  try {
    const formData = buildRefundMultipart(refundRequest, images);
    const res = await APIService.public.post('/refunds', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (err) {
    console.error('환불 신청 실패:', err);
    throw err;
  }
};

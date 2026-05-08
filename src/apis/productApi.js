import { APIService } from './axios';
import { extractApiData, normalizeToArray } from '@/utils/extractApiData';

/**
 * GET `/api/products/categories/:categoryId?kioskId=`
 * 응답: `{ success, code, message, data: ProductSummary[] }`
 * ProductSummary: id, categoryName, name, subTitle, price, stock, status, thumbnailImageUrl, …
 */
export const getProductsByCategory = async (categoryId, kioskId = 3) => {
  try {
    const res = await APIService.public.get(`/products/categories/${categoryId}`, {
      params: {
        kioskId,
      },
    });
    const data = extractApiData(res);
    return normalizeToArray(data);
  } catch (err) {
    console.error('상품 조회 실패:', err);
    throw err;
  }
};

export const getProductDetail = async (productId) => {
  try {
    const res = await APIService.public.get(`/products/${productId}`);
    return extractApiData(res);
  } catch (err) {
    console.error('상품 상세 조회 실패:', err);
    throw err;
  }
};

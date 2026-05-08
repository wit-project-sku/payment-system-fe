import { APIService } from './axios';
import { extractApiData } from '@/utils/extractApiData';

export const getCategories = async () => {
  try {
    const res = await APIService.public.get('/categories/products');
    const data = extractApiData(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('카테고리 조회 실패:', err);
    throw err;
  }
};

import GoodsItem from '@components/goods/GoodsItem';
import styles from './StorePage.module.css';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';

import { useState, useEffect, useRef } from 'react';
import ProductDetailModal from '@components/modal/kiosk/ProductDetailModal';
import { getProductsByCategory } from '@api/productApi';

export default function StorePage() {
  const { activeTab, addToCart, categories } = useOutletContext();

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const justNormalizedRef = useRef(false);

  /** URL 정규화 이후 localStorage 기준 — 렌더 시점 값과 어긋나 빈 목록이 나오지 않게 요청 직전에 읽습니다. */
  const readEffectiveKioskId = () => {
    const storedKioskId = localStorage.getItem('kiosk-id');
    const sanitizedStored =
      storedKioskId && storedKioskId !== 'null' ? storedKioskId.match(/\d+/)?.[0] : null;
    const kioskId = sanitizedStored ? Number(sanitizedStored) : 3;
    return Number.isFinite(kioskId) && kioskId > 0 ? kioskId : 3;
  };

  useEffect(() => {
    const rawSearch = window.location.search ?? '';

    if (!rawSearch) {
      if (justNormalizedRef.current) {
        justNormalizedRef.current = false;
        return;
      }

      const normalizedFlag = sessionStorage.getItem('kiosk-normalized');
      if (normalizedFlag === '1') {
        sessionStorage.removeItem('kiosk-normalized');
        return;
      }

      // kiosk-id를 지우면 기본 kioskId=3으로만 조회되어, 스테이지에서 해당 키오스크에 상품이 없으면 항상 빈 목록이 됩니다.
      localStorage.setItem('image-url', 'null');

      return;
    }

    const fixedSearch = rawSearch.replace(/\?/g, (m, offset) => (offset === 0 ? '?' : '&'));
    const fixedParams = new URLSearchParams(fixedSearch);
    const imageUrl = fixedParams.get('imageUrl');
    const rawFromQuery = fixedParams.get('kioskId') ?? fixedParams.get('kiosk-id');
    const path = window.location.pathname ?? '';
    const rawFromPath = path.match(/kiosk-id(\d+)/)?.[1] ?? path.match(/kioskId(\d+)/)?.[1] ?? null;
    const raw = rawFromQuery ?? rawFromPath;
    const digits = raw ? String(raw).match(/\d+/)?.[0] : null;

    localStorage.setItem('kiosk-id', digits ?? 'null');
    localStorage.setItem('image-url', imageUrl ?? 'null');

    justNormalizedRef.current = true;
    sessionStorage.setItem('kiosk-normalized', '1');
    navigate('/kiosk/store', { replace: true });
  }, [searchParams, navigate]);

  useEffect(() => {
    if (!categories || !categories.length) return;
    const activeCategory = categories[activeTab];
    if (!activeCategory) return;

    const fetchProducts = async () => {
      try {
        const kioskIdForApi = readEffectiveKioskId();
        const categoryId = Number(activeCategory.id);
        const list = await getProductsByCategory(
          Number.isFinite(categoryId) ? categoryId : activeCategory.id,
          kioskIdForApi,
        );
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('상품 조회 실패:', err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [activeTab, categories]);

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedItem(null);
  };

  const handleAddFromModal = (item) => {
    addToCart(item);
    handleCloseDetail();
  };


  console.log(products,'products');
  

  const detailModal = openDetail && (
    <ProductDetailModal item={selectedItem} onClose={handleCloseDetail} onAdd={handleAddFromModal} />
  );

  return (
    <div className={styles.grid}>
      {products.length === 0 ? (
        <div className={styles.emptyMessage}>상품이 준비중입니다</div>
      ) : (
        products.map((item) => (
          <GoodsItem
            key={item.id}
            name={item.name}
            desc={item.subTitle}
            price={item.price}
            image={item.thumbnailImageUrl}
            onClick={() => handleOpenDetail(item)}
          />
        ))
      )}
      {detailModal}
    </div>
  );
}

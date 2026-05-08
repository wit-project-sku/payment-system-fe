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
  const storedKioskId = localStorage.getItem('kiosk-id');
  const sanitizedStored = storedKioskId && storedKioskId !== 'null' ? storedKioskId.match(/\d+/)?.[0] : null;
  const kioskId = sanitizedStored ? Number(sanitizedStored) : 3;
  const effectiveKioskId = Number.isFinite(kioskId) && kioskId > 0 ? kioskId : 3;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const justNormalizedRef = useRef(false);

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

      localStorage.setItem('kiosk-id', 'null');
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
        const list = await getProductsByCategory(activeCategory.id, effectiveKioskId);
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('상품 조회 실패:', err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [activeTab, categories, effectiveKioskId]);

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

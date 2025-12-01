import GoodsItem from '@components/goods/GoodsItem';
import styles from './StorePage.module.css';
import { useOutletContext } from 'react-router-dom';

import { useState, useEffect } from 'react';
import ProductDetailModal from '@components/modal/ProductDetailModal';
import { getProductsByCategory } from '@api/productApi';

export default function StorePage() {
  const { activeTab, addToCart, categories } = useOutletContext();

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const kioskId = 1;

  useEffect(() => {
    if (!categories || !categories.length) return;
    const activeCategory = categories[activeTab];
    if (!activeCategory) return;

    const fetchProducts = async () => {
      try {
        const res = await getProductsByCategory(activeCategory.id, kioskId);
        if (res?.data) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
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

  const detailModal = openDetail && (
    <ProductDetailModal item={selectedItem} onClose={handleCloseDetail} onAdd={handleAddFromModal} />
  );

  return (
    <div className={styles.grid}>
      {products.map((item) => (
        <GoodsItem
          key={item.id}
          name={item.name}
          desc={item.subTitle}
          price={item.price}
          image={item.thumbnailImageUrl}
          onClick={() => handleOpenDetail(item)}
        />
      ))}
      {detailModal}
    </div>
  );
}

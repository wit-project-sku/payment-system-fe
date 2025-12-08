import { useState, useEffect } from 'react';
import { getProductDetail } from '@api/productApi';
import styles from './ProductDetailModal.module.css';
import WarningModal from '@modals/WarningModal';

export default function ProductDetailModal({ item, onClose, onAdd }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [detail, setDetail] = useState(null);

  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    getProductDetail(item.id)
      .then((res) => setDetail({ ...res.data, count: 1 }))
      .catch((err) => console.error(err));
  }, [item]);

  if (!item) return null;

  const images =
    Array.isArray(detail?.images) && detail.images.length > 0
      ? detail.images.map((img) => img.imageUrl)
      : detail?.image
      ? [detail.image]
      : [];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.headerSection}>
          <h2 className={styles.modalTitle}>상품 상세보기</h2>
          <div className={styles.modalSubtitle}>
            {detail?.categoryName} &gt; {detail?.name}
          </div>
          <div className={styles.closeButton} onClick={onClose}>
            ×
          </div>
        </div>

        <div className={styles.imageWrapper}>
          <div className={styles.carouselContainer}>
            <button
              className={styles.carouselPrev}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
            >
              ‹
            </button>

            <img src={images[currentIndex]} alt={detail?.name} className={styles.mainImage} />

            <button
              className={styles.carouselNext}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
            >
              ›
            </button>
          </div>
          <div className={styles.carouselDots}>
            {images.map((_, idx) => (
              <span key={idx} className={`${styles.dot} ${currentIndex === idx ? styles.activeDot : ''}`}></span>
            ))}
          </div>
        </div>

        <div className={styles.subDescriptionTitle}>{detail?.subTitle}</div>
        <p className={styles.description}>{detail?.description}</p>

        <div className={styles.priceQuantityBox}>
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>가격</span>
            <span className={styles.priceValue}>{detail?.price?.toLocaleString()}원</span>
          </div>

          <div className={styles.quantityRow}>
            <span className={styles.quantityLabel}>수량</span>

            <div className={styles.quantityControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => setDetail((prev) => ({ ...prev, count: Math.max((prev?.count || 1) - 1, 1) }))}
              >
                –
              </button>

              <span className={styles.qtyNumber}>{detail?.count || 1}</span>

              <button
                className={styles.qtyBtn}
                onClick={() => setDetail((prev) => ({ ...prev, count: (prev?.count || 1) + 1 }))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button
            className={styles.addBtn}
            onClick={() => {
              setShowWarning(true);
            }}
          >
            담기
          </button>
        </div>
        {showWarning && (
          <WarningModal
            title='본 제품은 개인화된 맞춤 제작 상품으로'
            subtitle='제작 후 반품이 불가합니다.'
            description='단, 불량품의 경우 환불 또는 교환이 가능합니다.'
            onConfirm={() => {
              onAdd({ ...detail, quantity: detail?.count || 1 });
              setShowWarning(false);
              onClose();
            }}
            onCancel={() => setShowWarning(false)}
          />
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProductDetail } from '@api/productApi';
import styles from './OptionPage.module.css';
import left from '@assets/images/left.png';

/** 배송 검색 응답 줄에는 category/url 이 비는 경우가 있어 이름으로 보완 */
function rowIsPhoneCase(product) {
  const c = (product?.category ?? '').trim();
  if (c === '폰케이스') return true;
  const name = product?.productName ?? '';
  return typeof name === 'string' && name.includes('폰케이스');
}

function thumbnailFromPayload(product, fallbackByProductId) {
  const direct = (product?.productImageUrl ?? product?.customImageUrl ?? '').trim();
  if (direct) return direct;
  const pid = product?.productId;
  if (pid != null && fallbackByProductId?.[pid]) return fallbackByProductId[pid];
  return '';
}

function firstDetailImageUrl(detail) {
  const images = detail?.images;
  if (!Array.isArray(images) || images.length === 0) return '';
  const sorted = [...images].sort((a, b) => (a?.orderNum ?? 0) - (b?.orderNum ?? 0));
  return (sorted[0]?.imageUrl ?? '').trim();
}

const PHONE_CASE_OPTIONS = [
  'iPhone 17',
  'iPhone 17 Air',
  'iPhone 17 Pro',
  'iPhone 17 Pro Max',
  'iPhone 16',
  'iPhone 16 Plus',
  'iPhone 16 Pro',
  'iPhone 16 Pro Max',
  'iPhone 15',
  'iPhone 15 Plus',
  'iPhone 15 Pro',
  'iPhone 15 Pro Max',
  'iPhone 14',
  'iPhone 14 Plus',
  'iPhone 14 Pro',
  'iPhone 14 Pro Max',
  'iPhone 13',
  'iPhone 13 Pro',
  'iPhone 13 Pro Max',
  'iPhone 12',
  'iPhone 12 Pro',
  'iPhone 12 Pro Max',
  '[SAMSUNG] S25',
  '[SAMSUNG] S25+',
  '[SAMSUNG] S25 ULTRA',
  '[SAMSUNG] S24',
  '[SAMSUNG] S24+',
  '[SAMSUNG] S24+ ULTRA',
  '[SAMSUNG] S23',
  '[SAMSUNG] S23+',
  '[SAMSUNG] S23+ ULTRA',
  '[SAMSUNG] Z FLIP 7',
  '[SAMSUNG] Z FLIP 6',
  '[SAMSUNG] Z FLIP 5',
  '[SAMSUNG] Z FLIP 4',
  '[SAMSUNG] Z FLIP 3',
];

export default function OptionPage() {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [thumbnailByProductId, setThumbnailByProductId] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const orders = useMemo(() => {
    const raw = location.state?.orders;
    return Array.isArray(raw) ? raw : [];
  }, [location.state]);

  const items = useMemo(
    () =>
      orders.flatMap((order) =>
        (order.productListResponses ?? []).flatMap((product, index) => {
          const orderScopeId = order.deliveryId ?? order.paymentId ?? 'order';
          const phoneCaseRow = rowIsPhoneCase(product);

          const baseItem = {
            id: `${orderScopeId}-${product.productId}-${index}`,
            deliveryId: order.deliveryId,
            productId: product.productId,
            product,
            name: product.productName || '상품명 없음',
            options: phoneCaseRow ? PHONE_CASE_OPTIONS : [],
          };

          const isHandheldCategory =
            ((product.category || '').trim() || '') === '핸드폰' ||
            (typeof product.productName === 'string' && product.productName.includes('핸드폰'));

          if (isHandheldCategory && product.productQuantity > 1) {
            return Array.from({ length: product.productQuantity }, (_, i) => ({
              ...baseItem,
              id: `${baseItem.id}-${i}`,
              qty: 1,
            }));
          }

          return [
            {
              ...baseItem,
              qty: product.productQuantity,
            },
          ];
        }),
      ),
    [orders],
  );

  useEffect(() => {
    const needIds = new Set();
    for (const order of orders) {
      for (const p of order.productListResponses ?? []) {
        const hasDirect = `${p.productImageUrl || p.customImageUrl || ''}`.trim() !== '';
        if (!hasDirect && p.productId != null) needIds.add(p.productId);
      }
    }
    if (needIds.size === 0) return undefined;

    let cancelled = false;
    (async () => {
      const next = {};
      await Promise.all(
        [...needIds].map(async (pid) => {
          try {
            const detail = await getProductDetail(pid);
            const url = firstDetailImageUrl(detail);
            if (url) next[pid] = url;
          } catch {
            /* ignore individual failures */
          }
        }),
      );
      if (!cancelled && Object.keys(next).length > 0) {
        setThumbnailByProductId((prev) => ({ ...prev, ...next }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orders]);

  const requiresOption = items.some((item) => rowIsPhoneCase(item.product));

  const isNextEnabled = requiresOption
    ? items.filter((item) => rowIsPhoneCase(item.product)).every((item) => Boolean(selectedOptions[item.id]))
    : true;

  const handleNext = () => {
    if (!isNextEnabled) return;

    navigate('/mobile/address', {
      state: {
        ...(location.state ?? {}),
        fromOption: true,
        selectedOptions,
      },
    });
  };

  return (
    <div className={styles.container}>
      <img src={left} alt='back' className={styles.backButton} onClick={() => navigate(-1)} />
      <h1 className={styles.title}>주문 내역 확인</h1>
      <p className={styles.subtitle}>아래의 주문 내역을 확인해주세요</p>

      {items.map((item) => {
        const src = thumbnailFromPayload(item.product, thumbnailByProductId);
        const showSelect = rowIsPhoneCase(item.product) && item.options?.length > 0;

        return (
          <div className={styles.card} key={item.id}>
            <div className={styles.row}>
              {src ? (
                <img src={src} alt={item.name} className={styles.thumbnail} />
              ) : (
                <div className={`${styles.thumbnail} ${styles.thumbnailMissing}`} aria-hidden />
              )}
              <div className={styles.info}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.qty}>수량: {item.qty}개</div>
              </div>
            </div>

            {showSelect && (
              <select
                className={styles.select}
                value={selectedOptions[item.id] ?? ''}
                onChange={(e) =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [item.id]: e.target.value,
                  }))
                }
              >
                <option value=''>기종을 선택하세요</option>
                {item.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}

      <button
        className={`${styles.nextButton} ${isNextEnabled ? styles.active : ''}`}
        disabled={!isNextEnabled}
        onClick={handleNext}
      >
        다음
      </button>
    </div>
  );
}

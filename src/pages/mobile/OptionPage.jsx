import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './OptionPage.module.css';
import left from '@assets/images/left.png';

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
  const navigate = useNavigate();
  const location = useLocation();
  const orders = useMemo(() => {
    const raw = location.state?.orders;
    return Array.isArray(raw) ? raw : [];
  }, [location.state]);

  useEffect(() => {
    if (!orders.length) {
      navigate('/mobile/search?type=order', { replace: true });
    }
  }, [orders, navigate]);

  const items = useMemo(
    () =>
      orders.flatMap((order) =>
        (order.productListResponses || []).flatMap((product, index) => {
          const deliveryId = order.deliveryId;
          const baseItem = {
            id: `${deliveryId}-${product.productId}-${index}`,
            deliveryId,
            productId: product.productId,
            name: product.productName || '상품명 없음',
            image: product.productImageUrl || '',
            category: product.category,
            options: product.category === '폰케이스' ? PHONE_CASE_OPTIONS : [],
          };

          if (product.category === '핸드폰' && product.productQuantity > 1) {
            return Array.from({ length: product.productQuantity }, (_, i) => ({
              ...baseItem,
              id: `${baseItem.id}-u${i}`,
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

  const requiresOption = items.some((item) => item.category === '폰케이스');

  const isNextEnabled = requiresOption
    ? items.filter((item) => item.category === '폰케이스').every((item) => Boolean(selectedOptions[item.id]))
    : true;

  const handleNext = () => {
    if (!isNextEnabled) return;

    const optionLineRows = items.map((item) => ({
      id: item.id,
      deliveryId: item.deliveryId,
      productId: item.productId,
      category: item.category,
    }));

    navigate('/mobile/address', {
      state: {
        ...(location.state ?? {}),
        fromOption: true,
        selectedOptions,
        optionLineRows,
      },
    });
  };

  return (
    <div className={styles.container}>
      <img src={left} alt='back' className={styles.backButton} onClick={() => navigate(-1)} />
      <h1 className={styles.title}>주문 내역 확인</h1>
      <p className={styles.subtitle}>아래의 주문 내역을 확인해주세요</p>

      {items.map((item) => (
        <div className={styles.card} key={item.id}>
          <div className={styles.row}>
            <img src={item.image} alt={item.name} className={styles.thumbnail} />
            <div className={styles.info}>
              <div className={styles.name}>{item.name}</div>
              <div className={styles.qty}>수량: {item.qty}개</div>
            </div>
          </div>

          {item.category === '폰케이스' && item.options?.length > 0 && (
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
      ))}

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

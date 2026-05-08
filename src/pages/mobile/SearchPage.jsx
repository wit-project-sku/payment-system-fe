import { useState } from 'react';
import { fetchDeliveryByPhone } from '@api/deliveryApi';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SearchPage.module.css';
import left from '@assets/images/left.png';
import telImg from '@assets/images/tel.png';
import NotFoundModal from '@modals/mobile/NotFoundModal';

export default function SearchPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [showNotFound, setShowNotFound] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('type');

  function formatPhone(num) {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }

  const cleanedPhone = phone.replace(/[^0-9]/g, '');
  const isValid = cleanedPhone.length === 11;

  return (
    <div className={styles.container}>
      <img src={left} alt='back' className={styles.backButton} onClick={() => navigate(-1)} />
      <h1 className={styles.title}>{mode === 'order' ? '주문 정보 입력' : '배송 내역 조회'}</h1>
      <p className={styles.subtitle}>
        {mode === 'order'
          ? '결제 시 입력한 전화번호를 입력해주세요'
          : '결제 시 입력한 전화번호를 입력하시면 배송 내역을 확인할 수 있습니다.'}
      </p>

      <div className={styles.telLabelWrapper}>
        <img src={telImg} alt='tel' className={styles.telIcon} />
        <span className={styles.telLabel}>전화번호</span>
      </div>

      <div className={styles.inputWrapper}>
        <input
          type='tel'
          placeholder='전화번호를 입력해주세요'
          className={styles.input}
          value={formatPhone(phone)}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          maxLength={13}
        />
      </div>

      <div className={styles.noticeBox}>
        <div className={styles.noticeTitle}>안내</div>
        <div className={styles.noticeText}>
          결제 시 입력하신 전화번호를 입력하시면 주문 내역을 확인하실 수 있습니다.
        </div>
      </div>

      {orders.length > 0 && (
        <div className={styles.resultBox}>
          {orders.map((order) => (
            <div key={order.deliveryId} className={styles.resultItem}>
              <>
                <div className={styles.resultAddress}>주문번호: {order.transactionId}</div>
                {(order.productListResponses || []).map((it, idx) => (
                  <div key={idx} className={styles.resultProduct}>
                    상품명: {it.productName} / 수량: {it.productQuantity}
                  </div>
                ))}
              </>
            </div>
          ))}
        </div>
      )}

      <button
        className={`${styles.nextButton} ${isValid ? styles.active : ''}`}
        disabled={!isValid}
        onClick={async () => {
          if (!isValid) return;

          localStorage.setItem(
            'user-phone',
            JSON.stringify({
              state: { phone: cleanedPhone },
              version: 0,
            }),
          );

          try {
            const res =
              mode === 'order'
                ? await fetchDeliveryByPhone(cleanedPhone, { keyword: 'ORDERED' })
                : await fetchDeliveryByPhone(cleanedPhone);
            const data = res?.data ?? [];

            setOrders(data);

            if (Array.isArray(data) && data.length > 0) {
              const target = mode === 'order' ? '/mobile/option' : '/mobile/delivery';
              
              navigate(target, {
                state: {
                  orders: data,
                  phoneNumber: cleanedPhone,
                  fromOption: true,
                  deliveryId: data?.[0]?.deliveryId,
                },
              });
            } else {
              setShowNotFound(true);
            }
          } catch (e) {
            console.error('조회 실패:', e);
            const status = e?.response?.status;
            if (status === 404) {
              setShowNotFound(true);
            }
          }
        }}
      >
        다음
      </button>
      {showNotFound && <NotFoundModal onClose={() => setShowNotFound(false)} />}
    </div>
  );
}

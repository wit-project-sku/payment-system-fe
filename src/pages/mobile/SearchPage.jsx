import { useEffect, useMemo, useState } from 'react';
import { fetchDeliveryByPhone } from '@api/deliveryApi';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SearchPage.module.css';
import left from '@assets/images/left.png';
import telImg from '@assets/images/tel.png';
import NotFoundModal from '@modals/mobile/NotFoundModal';
import { extractListPayload } from '@/utils/mobileDelivery';

export default function SearchPage() {
  const [phone, setPhone] = useState('');
  const [showNotFound, setShowNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const mode = searchParams.get('type');

  useEffect(() => {
    if (mode !== 'order' && mode !== 'delivery') {
      navigate('/mobile', { replace: true });
    }
  }, [mode, navigate]);

  function formatPhone(num) {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }

  const cleanedPhone = phone.replace(/[^0-9]/g, '');
  const isValid = cleanedPhone.length === 11;

  const fetchByPhone = async () => {
    const query = mode === 'order' ? { order: 'ORDERED' } : {};
    const res = await fetchDeliveryByPhone(cleanedPhone, query);
    return extractListPayload(res);
  };

  const handleNext = async () => {
    if (!isValid || mode === null) return;

    setSubmitting(true);
    setShowNotFound(false);

    try {
      /** `GET /api/deliveries/search` — order flow sends `order=ORDERED` so the server returns only actionable rows */
      const rawList = await fetchByPhone();

      if (mode === 'order') {
        if (!rawList.length) {
          setShowNotFound(true);
          return;
        }
        localStorage.setItem(
          'user-phone',
          JSON.stringify({
            state: { phone: cleanedPhone },
            version: 0,
          }),
        );
        navigate('/mobile/option', {
          state: {
            orders: rawList,
            phoneNumber: cleanedPhone,
            fromOption: true,
            deliveryId: rawList[0].deliveryId,
          },
        });
        return;
      }

      if (!rawList.length) {
        setShowNotFound(true);
        return;
      }

      localStorage.setItem(
        'user-phone',
        JSON.stringify({
          state: { phone: cleanedPhone },
          version: 0,
        }),
      );

      navigate('/mobile/delivery', {
        state: {
          orders: rawList,
          phoneNumber: cleanedPhone,
        },
      });
    } catch (e) {
      console.error('조회 실패:', e);
      const status = e?.response?.status;
      if (status === 404) {
        setShowNotFound(true);
      } else {
        alert('조회에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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

      <button
        className={`${styles.nextButton} ${isValid && !submitting ? styles.active : ''}`}
        disabled={!isValid || submitting || mode === null}
        onClick={handleNext}
      >
        {submitting ? '조회 중...' : '다음'}
      </button>
      {showNotFound && <NotFoundModal onClose={() => setShowNotFound(false)} />}
    </div>
  );
}

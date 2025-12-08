import Modal from '@commons/Modal';
import styles from './PaymentModal.module.css';
import { useEffect, useState, useRef } from 'react';
import { approvePayment } from '@api/payment';

export default function PaymentModal({ items, onBack, onTimeout, onComplete, onFail }) {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + 3000;

  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const phoneStored = localStorage.getItem('user-phone');
    const imageStored = localStorage.getItem('image-url');

    let phoneNumber = '';
    let imageUrl = '';

    if (phoneStored) {
      try {
        const parsed = JSON.parse(phoneStored).state || {};
        phoneNumber = parsed.phone || '';
      } catch (err) {
        console.error('전화번호 파싱 실패:', err);
      }
    }

    if (imageStored) {
      imageUrl = imageStored;
    }

    const payload = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      totalAmount: totalPrice + 3000,
      phoneNumber,
      inst: '00',
      imageUrl,
      delivery: true,
    };

    approvePayment(payload)
      .then((res) => {
        const success = res?.success === true;

        if (success) {
          if (typeof onComplete === 'function') onComplete();
        } else {
          if (typeof onFail === 'function') onFail('network');
        }
      })
      .catch((err) => {
        console.error('결제 승인 API 호출 실패:', err);
        if (typeof onFail === 'function') onFail('network');
      });
  }, []);

  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((sec) => {
        const next = sec - 1;
        const elapsed = 60 - next;
        const progressValue = (elapsed / 60) * 100;
        setProgress(progressValue);

        if (next <= 0) {
          clearInterval(interval);
          if (typeof onTimeout === 'function') onTimeout();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Modal onClose={onBack}>
      <div className={styles.timerBadge}>{secondsLeft}초</div>
      <h2 className={styles.paymentTitle}>카드를 넣어주세요.</h2>

      <p className={styles.paymentSubtitle}>기기 하단에 있는 카드 리더기에 신용카드를 넣어주세요.</p>

      <div className={styles.amountBox}>
        <span className={styles.amountLabel}>결제 금액</span>
        <span className={styles.amountValue}>{totalPrice.toLocaleString()}원</span>
      </div>

      <div className={styles.paymentImage}></div>

      <div className={styles.paymentBar}>
        <div className={styles.paymentBarFill} style={{ width: `${progress}%` }}></div>
      </div>

      <button className={styles.paymentCancel} onClick={onBack}>
        취소
      </button>
      {/* 테스트용 다음 모달 이동 버튼 — 개발 중에만 사용 */}
      <button
        className={styles.paymentCancel}
        style={{ marginTop: '40px', background: '#4a90e2', color: '#fff' }}
        onClick={() => {
          if (typeof onComplete === 'function') onComplete();
        }}
      >
        테스트용 다음 단계로 이동
      </button>
    </Modal>
  );
}

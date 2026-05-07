import Modal from '@commons/KioskModal';
import styles from './PaymentModal.module.css';
import { useEffect, useState, useRef } from 'react';
import { approvePayment } from '@api/paymentApi';
import { useUserStore } from '@hooks/useUserStore';
import { interpretApproveResponse, interpretApproveAxiosError } from '@/utils/paymentApproveOutcome';

const PAYMENT_SUBMIT_PREFIX = 'payment-fe:submit:';

export default function PaymentModal({ merchantUid, items, onBack, onTimeout, onComplete, onFail }) {
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + 3000;

  const onCompleteRef = useRef(onComplete);
  const onFailRef = useRef(onFail);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onFailRef.current = onFail;
  }, [onFail]);

  useEffect(() => {
    if (!merchantUid?.trim()) {
      onFailRef.current?.('validation', '주문 번호가 없습니다. 처음부터 다시 시도해 주세요.');
      return;
    }

    const dedupeKey = `${PAYMENT_SUBMIT_PREFIX}${merchantUid}`;
    if (sessionStorage.getItem(dedupeKey)) {
      return;
    }
    sessionStorage.setItem(dedupeKey, '1');

    const phoneNumber = useUserStore.getState().phone ?? '';
    if (!phoneNumber.trim()) {
      sessionStorage.removeItem(dedupeKey);
      onFailRef.current?.('validation', '전화번호가 필요합니다.');
      return;
    }

    const snapshotItems = itemsRef.current;

    const lineItems = snapshotItems
      .filter((item) => item.id != null)
      .map((item) => ({
        productId: Number(item.id),
        quantity: item.quantity,
      }));

    if (lineItems.length === 0) {
      sessionStorage.removeItem(dedupeKey);
      onFailRef.current?.('validation', '결제할 상품 정보가 없습니다.');
      return;
    }

    const computedTotal =
      snapshotItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 3000;

    const payload = {
      merchantUid,
      items: lineItems,
      totalAmount: computedTotal,
      phoneNumber,
    };

    let paymentPromise;
    try {
      paymentPromise = approvePayment(payload);
    } catch (err) {
      sessionStorage.removeItem(dedupeKey);
      console.error('결제 요청 본문 검증 실패:', err);
      const msg = err instanceof Error ? err.message : String(err);
      onFailRef.current?.('validation', msg || '요청 정보가 올바르지 않습니다.');
      return;
    }

    paymentPromise
      .then((res) => {
        const outcome = interpretApproveResponse(res);
        if (outcome.ok) {
          onCompleteRef.current?.();
        } else {
          onFailRef.current?.('payment', outcome.message);
        }
      })
      .catch((err) => {
        console.error('결제 승인 API 호출 실패:', err);
        const { kind, message } = interpretApproveAxiosError(err);
        onFailRef.current?.(kind, message);
      });
  }, [merchantUid]);

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
    </Modal>
  );
}

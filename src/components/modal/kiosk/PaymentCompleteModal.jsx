import styles from './PaymentCompleteModal.module.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@commons/KioskModal';
import QRCode from 'react-qr-code';
import { useUserStore } from '@hooks/useUserStore';

export default function PaymentCompleteModal({ onClose, summary = null }) {
  const [countdown, setCountdown] = useState(60);
  const phone = useUserStore((state) => state.phone);

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const clearCartLikeStorage = useCallback(() => {
    // 프로젝트마다 cart 저장 키가 다를 수 있어, 안전하게 여러 후보 키를 정리합니다.
    // (키가 없으면 removeItem은 무해합니다.)
    const keysToRemove = [
      'cart',
      'cartItems',
      'kioskCart',
      'orders',
      'orderItems',
      'paymentCart',
      'persist:cart',
      'persist:kioskCart',
    ];

    try {
      keysToRemove.forEach((k) => window.localStorage?.removeItem?.(k));
    } catch {
      // storage 접근이 막힌 환경에서도 앱이 죽지 않도록 무시
    }

    // 전역 상태/스토어가 따로 있다면, 해당 영역에서 이 이벤트를 구독해 cart를 비우도록 확장할 수 있습니다.
    try {
      window.dispatchEvent(new CustomEvent('cart:clear'));
    } catch {
      // 구형 환경 대비
    }
  }, []);

  const handleClose = useCallback(() => {
    clearCartLikeStorage();
    onCloseRef.current?.();
  }, [clearCartLikeStorage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      handleClose();
    }
  }, [countdown, handleClose]);

  return (
    <Modal onClose={handleClose}>
      <div className={styles.successHero} aria-hidden='true'>
        <div className={styles.successCircle}>
          <svg className={styles.successCheck} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M20 6L9 17l-5-5'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      </div>

      <h2 className={styles.title}>결제 완료</h2>

      <div className={styles.apiBanner}>
        <span className={styles.apiBannerLabel}>승인 결과</span>
        <p className={styles.apiBannerMessage}>{summary?.message ?? '결제가 정상적으로 처리되었습니다.'}</p>
        {summary?.code != null ? <p className={styles.apiBannerMeta}>응답 코드 {summary.code}</p> : null}
      </div>

      <p className={styles.subtitleFollow}>문자 메시지가 발송되었습니다.</p>

      <div className={styles.noticeBox}>
        📱 <b>{phone}</b> 로 링크가 전송되었습니다.
      </div>

      <div className={styles.qrContainer}>
        <QRCode value='https://witteria.com/mobile' size={500} />
      </div>

      <div className={styles.linkBox}>
        QR 코드를 스캔하거나 문자 메시지의 링크를 눌러 배송지 정보와 상세 옵션을 선택해주세요.
      </div>

      <p className={styles.autoClose}>{countdown}초 후 자동으로 닫힙니다</p>

      <button className={styles.closeBtn} onClick={handleClose}>
        확인
      </button>
    </Modal>
  );
}

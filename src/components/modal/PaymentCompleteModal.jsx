import styles from './PaymentCompleteModal.module.css';
import { useState, useEffect } from 'react';
import Modal from '@commons/Modal';
import QRCode from 'react-qr-code';
import { useUserStore } from '@hooks/useUserStore';

export default function PaymentCompleteModal({ onClose }) {
  const [countdown, setCountdown] = useState(60);
  const phone = useUserStore((state) => state.phone);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>결제 완료</h2>
      <p className={styles.subtitle}>문자 메시지가 발송되었습니다.</p>

      <div className={styles.noticeBox}>
        📱 <b>{phone}</b> 로 링크가 전송되었습니다.
      </div>

      <div className={styles.qrContainer}>
        <QRCode value='https://unijuni.store/mobile' size={500} />
      </div>

      <div className={styles.linkBox}>
        QR 코드를 스캔하거나 문자 메시지의 링크를 눌러 배송지 정보와 상세 옵션을 선택해주세요.
      </div>

      <p className={styles.autoClose}>{countdown}초 후 자동으로 닫힙니다</p>

      <button className={styles.closeBtn} onClick={onClose}>
        확인
      </button>
    </Modal>
  );
}

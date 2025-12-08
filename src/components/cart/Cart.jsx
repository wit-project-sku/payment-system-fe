import CartItem from './CartItem';
import styles from './Cart.module.css';
import { useState } from 'react';
import OrderModal from '@modals/OrderModal';
import PaymentModal from '@modals/PaymentModal';
import PreOrderNoticeModal from '@modals/PreOrderNoticeModal';
import PhoneInputModal from '@modals/PhoneInputModal';
import ReturnWarningModal from '@modals/WarningModal';
import PaymentCompleteModal from '@modals/PaymentCompleteModal';
import FailModal from '@modals/FailModal';

export default function Cart({ items, onRemove, onIncrease, onDecrease }) {
  const [showNotice, setShowNotice] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showReturnWarning, setShowReturnWarning] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);

  // ★ 추가: network/lack 실패 모달 표시용
  const [failType, setFailType] = useState(null);

  const [phone, setPhone] = useState(null);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.itemsBoxContainer}>
            <div className={styles.itemsBox}>
              {items.length === 0 ? (
                <div className={styles.emptyMessage}>장바구니가 비어있습니다</div>
              ) : (
                items.map((item) => (
                  <CartItem
                    key={item.name}
                    item={item}
                    onRemove={() => onRemove(item.name)}
                    onIncrease={() => onIncrease(item.name)}
                    onDecrease={() => onDecrease(item.name)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.summaryTitle}>
            선택한 상품 <span className={styles.red}>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>개
          </div>

          <div className={styles.totalLabel}>총 결제 금액</div>

          <div className={styles.totalPrice}>{totalPrice.toLocaleString()}원</div>

          <button
            className={styles.payButton}
            onClick={() => setShowNotice(true)}
            disabled={items.length === 0}
            style={items.length === 0 ? { backgroundColor: '#8B7355', cursor: 'not-allowed' } : {}}
          >
            결제하기
          </button>
        </div>
      </div>

      {showNotice && (
        <PreOrderNoticeModal
          onClose={() => setShowNotice(false)}
          onNext={() => {
            setShowNotice(false);
            setShowOrder(true);
          }}
        />
      )}

      {showOrder && (
        <OrderModal
          items={items}
          onBack={() => {
            setShowOrder(false);
            setShowNotice(true);
          }}
          onProceed={() => {
            setShowOrder(false);
            setShowPhone(true);
          }}
        />
      )}

      {showPhone && (
        <PhoneInputModal
          onBack={() => {
            setShowPhone(false);
            setShowOrder(true);
          }}
          onNext={(formattedPhone) => {
            setPhone(formattedPhone);
            setShowReturnWarning(true);
          }}
        />
      )}

      {showReturnWarning && (
        <ReturnWarningModal
          formattedPhone={phone}
          onBack={() => {
            setShowReturnWarning(false);
          }}
          onCancel={() => {
            setShowReturnWarning(false);
          }}
          onConfirm={() => {
            setShowReturnWarning(false);
            setShowPhone(false);
            setShowPayment(true);
          }}
        />
      )}

      {showPayment && (
        <PaymentModal
          items={items}
          onBack={() => {
            setShowPayment(false);
            setShowPhone(true);
          }}
          onTimeout={() => {
            setShowPayment(false);
            setShowTimeout(true);
          }}
          onComplete={() => {
            setShowPayment(false);
            setShowComplete(true);
          }}
          onFail={(type) => {
            setShowPayment(false);
            setFailType(type);
          }}
        />
      )}

      {showComplete && <PaymentCompleteModal onClose={() => setShowComplete(false)} />}

      {showTimeout && (
        <FailModal
          type='timeout'
          amount={totalPrice + 3000}
          onClose={() => setShowTimeout(false)}
          onRetry={() => {
            setShowTimeout(false);
            setShowPayment(true);
          }}
        />
      )}

      {failType && (
        <FailModal
          type={failType}
          amount={totalPrice + 3000}
          onClose={() => setFailType(null)}
          onRetry={() => {
            setFailType(null);
            setShowPayment(true);
          }}
        />
      )}
    </>
  );
}

import { useNavigate } from 'react-router-dom';
import styles from './DeliveryPage.module.css';
import leftArrow from '@assets/images/leftArrow.png';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchDeliveryByPhone } from '@api/deliveryApi';

export default function DeliveryPage() {
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  const [deliveries, setDeliveries] = useState([]);

  const navigate = useNavigate();

  const formatPhoneNumber = (value) => {
    if (!value) return '';
    return value.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
  };

  const statusToKorean = (status) => {
    switch (status) {
      case 'ORDERED':
        return '주문 완료';
      case 'READY':
        return '배송 준비';
      case 'DELIVERING':
        return '배송 중';
      case 'COMPLETED':
        return '배송 완료';
      case 'CANCELED':
        return '주문 취소';
      default:
        return status;
    }
  };

  useEffect(() => {
    if (!phoneNumber) return;

    fetchDeliveryByPhone(phoneNumber)
      .then((res) => {
        setDeliveries(res.data);
        console.log(res);
      })
      .catch(() => {
        setDeliveries([]);
      });
  }, [phoneNumber]);

  return (
    <div className={styles.container}>
      <img src={leftArrow} alt='back' className={styles.backButton} onClick={() => navigate(-1)} />

      <h1 className={styles.title}>주문 내역</h1>
      <p className={styles.subtitle}>휴대폰 번호 : {formatPhoneNumber(phoneNumber)}</p>

      {deliveries.map((delivery) => (
        <div className={styles.card} key={delivery.deliveryId}>
          <div className={styles.rowBetween}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>주문번호: {delivery.transactionId}</div>
              <div className={styles.orderDate}>
                {delivery.orderDate ? delivery.orderDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3') : ''}
              </div>
            </div>
            <div
              className={`${styles.status} ${
                delivery.deliveryStatus === 'ORDERED'
                  ? styles.ordered
                  : delivery.deliveryStatus === 'READY'
                    ? styles.ready
                    : delivery.deliveryStatus === 'DELIVERING'
                      ? styles.delivering
                      : delivery.deliveryStatus === 'COMPLETED'
                        ? styles.completed
                        : delivery.deliveryStatus === 'CANCELED'
                          ? styles.canceled
                          : ''
              }`}
            >
              {statusToKorean(delivery.deliveryStatus)}
            </div>
          </div>

          {delivery.productListResponses.map((product) => (
            <div className={styles.itemRow} key={product.productId}>
              <span className={styles.itemName}>
                {product.productName} x {product.productQuantity}
              </span>
              <span className={styles.itemPrice}>
                {(product.productQuantity * Number(product.productPrice || 0)).toLocaleString()}원
              </span>
            </div>
          ))}

          <div className={styles.shippingRow}>
            <span className={styles.shippingLabel}>배송비</span>
            <span className={styles.shippingPrice}>+3,000원</span>
          </div>

          <div className={styles.totalRow}>
            총 결제금액
            <span className={styles.totalPrice}>{Number(delivery.totalAmount).toLocaleString()}원</span>
          </div>

          {delivery.trackingNumber && (
            <div className={styles.trackingBox}>
              <div className={styles.trackingLabel}>송장번호</div>
              <div className={styles.trackingNumber}>{delivery.trackingNumber}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

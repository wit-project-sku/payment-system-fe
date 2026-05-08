import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AddressPage.module.css';
import boxIcon from '@/assets/images/box.png';
import left from '@assets/images/left.png';
import profileImg from '@assets/images/profile.png';
import locationImg from '@assets/images/location.png';
import { saveDeliveryOptions } from '@api/deliveryApi';

export default function AddressPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const deliveryId = state?.deliveryId ?? state?.orders?.[0]?.deliveryId;
  console.log('AddressPage state:', state);
  console.log('deliveryId:', deliveryId);

  const [form, setForm] = useState({
    name: '',
    zipcode: '',
    address: '',
    detail: '',
    agree1: false,
    agree2: false,
  });

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsType, setTermsType] = useState('purchase');

  const allAgreed =
    form.name.trim() !== '' &&
    form.zipcode.trim() !== '' &&
    form.address.trim() !== '' &&
    form.detail.trim() !== '' &&
    form.agree1 &&
    form.agree2;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (type === 'checkbox') {
        // 체크를 시도(true)하는 경우 → 허용 X (약관에서만 체크 가능)
        if (checked === true) {
          return prev;
        }
        // 체크 해제(false)는 허용
        return { ...prev, [name]: false };
      }

      return { ...prev, [name]: value };
    });
  };

  const openTermsModal = (type) => {
    setTermsType(type);
    setShowTermsModal(true);
  };
  const closeTermsModal = () => {
    setShowTermsModal(false);
    setForm((prev) => {
      if (termsType === 'purchase') {
        return { ...prev, agree1: true };
      }
      if (termsType === 'refund') {
        return { ...prev, agree2: true };
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (!allAgreed) return;

    if (!deliveryId) {
      alert('배송 정보가 없습니다.');
      return;
    }

    try {
      await saveDeliveryOptions(deliveryId, {
        productOptionRequests: [],
        receiverName: form.name,
        zipCode: form.zipcode,
        address: form.address,
        detailAddress: form.detail,
      });

      alert('주문이 완료되었습니다.');
      navigate('/mobile');
    } catch (error) {
      alert('주문 처리 중 오류가 발생했습니다.', error);
    }
  };

  return (
    <div className={styles.container}>
      <img src={left} alt='back' className={styles.backButton} onClick={() => navigate(-1)} />
      <div className={styles.iconBox}>
        <img src={boxIcon} alt='box' />
      </div>

      <h1 className={styles.title}>배송지 정보</h1>
      <p className={styles.subTitle}>배송받을 주소를 입력해주세요</p>

      <div className={styles.fieldRow}>
        <img src={profileImg} alt='person' className={styles.icon} />
        <div className={styles.fieldLabel}>받는 분 이름</div>
      </div>
      <input
        name='name'
        value={form.name}
        onChange={handleChange}
        placeholder='이름 입력'
        className={styles.inputField}
      />

      <div className={styles.fieldRow}>
        <img src={locationImg} alt='location' className={styles.icon} />
        <div className={styles.fieldLabel}>우편번호</div>
      </div>
      <input
        name='zipcode'
        value={form.zipcode}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
          setForm((prev) => ({ ...prev, zipcode: v }));
        }}
        placeholder='12345'
        className={styles.inputField}
      />
      {form.zipcode.length > 0 && form.zipcode.length !== 5 && (
        <div className={styles.errorText}>우편번호가 올바르지 않습니다</div>
      )}

      <div className={styles.fieldRow}>
        <img src={locationImg} alt='location' className={styles.icon} />
        <div className={styles.fieldLabel}>도로명 주소</div>
      </div>
      <input
        name='address'
        value={form.address}
        onChange={handleChange}
        placeholder='서울시 강남구 테헤란로 123'
        className={styles.inputField}
      />

      <div className={styles.fieldRow}>
        <img src={locationImg} alt='location' className={styles.icon} />
        <div className={styles.fieldLabel}>상세 주소</div>
      </div>
      <input
        name='detail'
        value={form.detail}
        onChange={handleChange}
        placeholder='101동 202호'
        className={styles.inputField}
      />

      <div className={styles.agreeBox}>
        <div className={styles.agreeTitle}>약관 동의</div>

        <label className={styles.agreeItem}>
          <input
            type='checkbox'
            name='agree1'
            checked={form.agree1}
            onChange={() => {
              if (form.agree1) {
                setForm((prev) => ({ ...prev, agree1: false }));
              } else {
                openTermsModal('purchase');
              }
            }}
          />
          <span className={styles.agreeText}>[필수] 구매 약관에 동의합니다.</span>
          <button type='button' className={styles.viewLink} onClick={() => openTermsModal('purchase')}>
            [전체보기]
          </button>
        </label>

        <label className={styles.agreeItem}>
          <input
            type='checkbox'
            name='agree2'
            checked={form.agree2}
            onChange={() => {
              if (form.agree2) {
                setForm((prev) => ({ ...prev, agree2: false }));
              } else {
                openTermsModal('refund');
              }
            }}
          />
          <span className={styles.agreeText}>[필수] 불량품 교환/환불 정책에 동의합니다.</span>
          <button type='button' className={styles.viewLink} onClick={() => openTermsModal('refund')}>
            [전체보기]
          </button>
        </label>

        <p className={styles.warningText}>
          본 제품은 개인 맞춤 제작 상품으로 <span className={styles.redText}>제작 후 반품이 불가능</span>
          합니다.
          <br />
          단, 불량품의 경우에만 교환/환불 가능합니다.
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className={styles.buttonWrapper}>
        <button className={styles.prevButton} onClick={() => navigate(-1)}>
          이전
        </button>

        <button className={styles.submitButton} disabled={!allAgreed} onClick={handleSubmit}>
          주문 완료
        </button>
      </div>

      {showTermsModal && (
        <div className={styles.termsOverlay}>
          <div className={styles.termsModal}>
            <div className={styles.termsBar}></div>
            <h2 className={styles.termsTitle}>{termsType === 'purchase' ? '이용 약관' : '불량품 교환 및 환불 정책'}</h2>
            <p className={styles.termsContent}>
              {termsType === 'purchase' ? (
                <>
                  <strong>제1조(목적)</strong>
                  <br />
                  이 약관은 (주)위트글로벌 회사(전자상거래 사업자)가 운영하는 인사랑 사이버 몰(이하 "몰"이라 한다)에서
                  제공하는 인터넷 관련 서비스 (이하 "서비스"라 한다)를 이용함에 있어 사이버 몰과 이용자의 권리, 의무 및
                  책임사항을 규정함을 목적으로 합니다.
                  <br />
                  <br />
                  <strong>제9조(구매신청 및 개인정보 제공 동의 등)</strong>
                  <br />
                  ① "몰" 이용자는 "몰"상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며, "몰"은 이용자가
                  구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.
                  <br />
                  • 재화 등의 검색 및 선택
                  <br />
                  • 받는 사람의 성명, 주소, 전화번호, 전자우편주소(또는 이동전화번호) 등의 입력
                  <br />
                  • 약관내용, 청약철회권이 제한되는 서비스, 배송료·설치비 등의 비용 부담과 관련한 내용의 대한 확인
                  <br />
                  • 이 약관에 동의하고 위 3호의 사항을 확인하거나 거부하는 표시
                  <br />
                  <br />
                  <strong>제13조(재화 등의 공급)</strong>
                  <br />
                  ① "몰"은 이용자가 재화 등의 공급시기에 관하여 별도의 약정이 없는 이상, 이용자가 청약한 날부터 7일
                  이내에 재화 등을 배송할 수 있도록 주문제작, 포장 등 기타의 필요한 조치를 취합니다.
                  <br />
                  <br />
                  <strong>제15조(청약철회 등)</strong>
                  <br />
                  ① "몰"과 재화 등의 구매에 관한 계약을 체결한 이용자는 『전자상거래 등에서의 소비자보호에 관한 법률』
                  제13조 제2항에 따른 계약내용에 관한 서면을 받은 날부터 7일 이내에는 청약의 철회를 할 수 있습니다.
                  <br />
                  ② 이용자는 재화 등을 배송 받은 경우 다음 각 호의 1에 해당하는 경우에는 반품 및 교환을 할 수 없습니다.
                  <br />
                  • 이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우
                  <br />
                  • 이용자의 사용 또는 일부 소비로 인하여 재화 등의 가치가 현저히 감소한 경우
                  <br />
                  • 이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우
                  <br />
                  <br />
                  <strong>5. 주의사항</strong>
                  <br />
                  본 제품은 개인화된 맞춤 제작 상품입니다. 제작 후에는 반품이 불가능하오니 신중하게 주문해 주시기
                  바랍니다. 단, 불량품의 경우에는 교환 또는 환불이 가능합니다.
                  <br />
                  <br />
                  • 제품 수령 후 7일 이내에만 불량 신고 가능
                  <br />
                  • 고객 단순 변심에 의한 파손은 교환/환불 불가
                  <br />• 단순 변심에 의한 반품은 불가 (맞춤 제작 상품)
                </>
              ) : (
                <>
                  <strong>1. 불량품 기준</strong>
                  <br />
                  • 제품 인쇄 불량(흐림, 번짐, 이미지 누락 등)
                  <br />
                  • 제품 파손 또는 깨짐
                  <br />
                  • 주문 내용과 다른 제품 배송
                  <br />
                  • 기타 제품의 하자로 인한 사용 불가
                  <br />
                  <br />
                  <strong>2. 신고 방법</strong>
                  <br />
                  불량품 발생 시 아래의 방법으로 즉시 신고해 주시기 바랍니다:
                  <br />
                  • 고객센터: 02-1234-5678 (평일 09:00~18:00)
                  <br />
                  • 이메일: support@witglobal.com
                  <br />
                  • 카카오톡: @@인사랑 (채널 추가 후 문의)
                  <br />
                  <br />
                  신고 시 필요 정보
                  <br />
                  • 주문번호
                  <br />
                  • 불량 상태를 확인할 수 있는 사진 2~3장
                  <br />
                  • 연락 가능한 연락처
                  <br />
                  • 수령인 정보
                  <br />
                  <br />
                  <strong>3. 처리 절차</strong>
                  <br />
                  ① 불량품 신고 접수 (고객센터 또는 이메일)
                  <br />
                  ② 불량 확인 (영업일 기준 1~2일 소요)
                  <br />
                  ③ 교환 또는 환불 진행
                  <br />
                  ④ 교환 제품 재출고 또는 환불 처리
                  <br />
                  <br />
                  <strong>4. 교환 및 환불</strong>
                  <br />
                  • 교환: 동일 제품으로 교환 (배송비 무료)
                  <br />
                  • 환불: 결제 수단에 따라 3~7일 내 환불 처리
                  <br />
                  • 불량품 회수 시: 택배 수거 진행 (고객 부담 없음)
                  <br />
                  <br />
                  <strong>5. 주의사항</strong>
                  <br />
                  본 제품은 개인의 맞춤 제작 상품입니다. 제작 후에는 반품이 불가능하오니 신중하게 주문해 주시기
                  바랍니다. 단, 불량품의 경우에는 교환 또는 환불이 가능합니다.
                  <br />
                  <br />
                  • 제품 수령 후 7일 이내에만 불량 신고 가능
                  <br />
                  • 고객 과실로 인한 파손은 교환/환불 불가
                  <br />
                  • 단순 변심에 의한 반품은 불가 (맞춤 제작 상품)
                  <br />
                  <br />
                  문의사항이 있으시면 언제든지 고객센터로 연락 주시기 바랍니다.
                </>
              )}
            </p>
            <button className={styles.termsClose} onClick={closeTermsModal}>
              동의
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

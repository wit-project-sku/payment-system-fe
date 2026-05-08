import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRefund } from '@api/refundApi';
import styles from './RefundPage.module.css';
import noticeImg from '@assets/images/notice.png';
import leftImg from '@assets/images/left.png';
import boxImg from '@assets/images/box.png';

/** 백엔드 RefundReason enum과 동일 */
const REASON_TO_API = {
  print: 'PRINT',
  damage: 'SCRATCH',
  color: 'COLOR',
  etc: 'ETC',
};

function refundStatusLabel(status) {
  if (status === 'WAITING') return '접수 대기';
  if (status === 'COMPLETE') return '처리 완료';
  return status ?? '—';
}

export default function RefundPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    orderNo: '',
    phone: '',
    reason: '',
    detail: '',
  });

  const [images, setImages] = useState([]);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const onlyNumber = value.replace(/[^0-9]/g, '');
      setForm((prev) => ({ ...prev, [name]: onlyNumber }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
  };

  const isValid =
    form.orderNo.trim() &&
    form.phone.trim() &&
    form.reason.trim() &&
    form.detail.trim() &&
    images.length >= 1 &&
    images.length <= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    const refundReason = REASON_TO_API[form.reason];
    if (!refundReason) return;

    setSubmitting(true);
    try {
      const res = await createRefund(
        {
          transactionId: form.orderNo.trim(),
          phoneNumber: form.phone.trim(),
          refundReason,
          description: form.detail.trim(),
        },
        images,
      );
      setSuccessResult({ message: res.message, data: res.data });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '신청 처리 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <img src={leftImg} alt='back' className={styles.backButton} onClick={() => navigate(-1)} />
        <header className={styles.header}>
          <h1 className={styles.title}>환불 / 교환 신청</h1>
          <p className={styles.subtitle}>불량품에 대한 교환 및 환불을 신청해주세요</p>
        </header>

        <section className={styles.importantBox}>
          <div className={styles.importantTitle}>
            <img src={noticeImg} alt='notice' className={styles.noticeIcon} />
            중요
          </div>
          <p className={styles.importantText}>
            본 제품은 개인 맞춤 제작 상품으로{' '}
            <span className={styles.importantEmphasis}>단순 변심에 의한 반품은 불가</span>합니다. 불량품 (제작 하자,
            배송 파손 등)의 경우에만 교환 또는 환불이 가능합니다.
          </p>
        </section>

        <button
          type='button'
          className={styles.policyButton}
          onClick={() => {
            setShowTermsModal(true);
          }}
        >
          교환 및 환불 정책 전문 보기
        </button>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              주문번호 <span className={styles.required}>*</span>
            </label>
            <input
              name='orderNo'
              value={form.orderNo}
              onChange={handleChange}
              placeholder='260101000001'
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              연락 가능한 전화번호 <span className={styles.required}>*</span>
            </label>
            <input
              name='phone'
              value={form.phone}
              onChange={handleChange}
              placeholder='숫자만 입력해주세요'
              className={styles.input}
              maxLength={11}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              불량 사유 선택 <span className={styles.required}>*</span>
            </label>
            <select name='reason' value={form.reason} onChange={handleChange} className={styles.select}>
              <option value=''>클릭하여 선택하기</option>
              <option value='print'>인쇄 불량</option>
              <option value='damage'>파손 / 스크래치</option>
              <option value='color'>색상 차이</option>
              <option value='etc'>기타</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              상세 설명 <span className={styles.required}>*</span>
            </label>
            <textarea
              name='detail'
              value={form.detail}
              onChange={handleChange}
              className={styles.textarea}
              placeholder='불량 내용을 자세히 설명해주세요.'
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              불량 상태 사진 첨부 (1~3장) <span className={styles.required}>*</span>
            </label>
            <div className={styles.uploadBox} onClick={handleUploadClick}>
              {images.length === 0 ? (
                <>
                  <img src={boxImg} alt='box' className={styles.uploadIcon} />
                  <div className={styles.uploadText}>불량 부분 사진을 첨부해주세요</div>
                  <div className={styles.uploadSubText}>(최대 3장)</div>
                </>
              ) : (
                <div className={styles.uploadPreviewGrid}>
                  {images.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      className={styles.previewImage}
                    />
                  ))}
                </div>
              )}
              <input
                type='file'
                accept='image/*'
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                onClick={(e) => (e.target.value = null)}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <section className={styles.infoBox}>
            <div className={styles.infoTitle}>처리 절차</div>
            <ul className={styles.infoList}>
              <li>① 불량품 신고 접수 (고객센터 또는 이메일)</li>
              <li>② 불량 확인 (영업일 기준 1~2일 소요)</li>
              <li>③ 교환 또는 환불 진행</li>
              <li>④ 교환 제품 재발송 또는 환불 처리</li>
            </ul>
          </section>

          <section className={styles.infoBox}>
            <div className={styles.infoTitle}>유의사항</div>
            <ul className={styles.infoList}>
              <li>· 제품 수령 후 7일 이내에만 불량 신고 가능</li>
              <li>· 고객 부주의로 인한 파손은 교환/환불 불가</li>
            </ul>
          </section>

          <button
            type='submit'
            className={`${styles.submitButton} ${isValid ? styles.active : ''}`}
            disabled={!isValid || submitting}
          >
            {submitting ? '처리 중…' : '신청하기'}
          </button>
        </form>

        <footer className={styles.footer}>
          <p className={styles.footerQuestion}>문의사항이 있으신가요?</p>
          <p className={styles.footerLine}>고객센터: 010-8792-2028 (평일 09:00-18:00)</p>
          <p className={styles.footerLine}>이메일: unijun0109@gmail.com</p>
        </footer>
      </div>
      {showTermsModal && (
        <div className={styles.termsOverlay}>
          <div className={styles.termsModal}>
            <div className={styles.termsBar}></div>
            <h2 className={styles.termsTitle}>불량품 교환 및 환불 정책</h2>
            <p className={styles.termsContent}>
              <strong>1. 불량품 기준</strong>
              <br />
              • 제품 인쇄 불량 (흐림, 번짐, 이미지 누락 등)
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
              불량품 발견 시 아래의 방법으로 즉시 신고해 주시기 바랍니다.
              <br />
              <br />
              • 고객센터: 02-1234-5678 (평일 09:00~18:00)
              <br />
              • 이메일: support@witglobal.com
              <br />
              • 카카오톡: @인사랑 (채널 추가 후 문의)
              <br />
              <br />
              <strong>신고 시 필요 정보</strong>
              <br />
              • 주문번호
              <br />
              • 불량 상태를 확인할 수 있는 사진 2~3장
              <br />
              • 연락 가능한 전화번호
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
              ④ 교환 제품 재발송 또는 환불 처리
              <br />
              <br />
              <strong>4. 교환 및 환불</strong>
              <br />
              • 교환: 동일 제품으로 교환 (배송비 무료)
              <br />
              • 환불: 결제 수단에 따라 3~7일 내 환불 처리
              <br />
              • 불량품 회수 시 택배 수거 진행 (고객 부담 없음)
              <br />
              <br />
              <strong>5. 주의사항</strong>
              <br />
              본 제품은 개인화된 맞춤 제작 상품입니다.
              <br />
              제작 후에는 단순 변심에 의한 반품이 불가능합니다.
              <br />
              단, 불량품의 경우에는 교환 또는 환불이 가능합니다.
              <br />
              <br />
              • 제품 수령 후 7일 이내에만 불량 신고 가능
              <br />
              • 고객 부주의로 인한 파손은 교환/환불 불가
              <br />
              • 단순 변심에 의한 반품 불가 (맞춤 제작 상품)
              <br />
              <br />
              문의사항이 있으시면 언제든지 고객센터로 연락 주시기 바랍니다.
            </p>
            <button className={styles.termsClose} onClick={() => setShowTermsModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
      {successResult && (
        <div className={styles.successOverlay} role='dialog' aria-modal='true' aria-labelledby='refund-success-title'>
          <div className={styles.successCard}>
            <div className={styles.successIcon} aria-hidden='true'>
              <svg className={styles.successCheckSvg} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M20 6L9 17l-5-5'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <h2 id='refund-success-title' className={styles.successTitle}>
              신청이 완료되었습니다
            </h2>
            <p className={styles.successMessage}>{successResult.message}</p>
            {successResult.data && (
              <div className={styles.successDetails}>
                <div className={styles.successDetailRow}>
                  <span className={styles.successDetailKey}>주문번호</span>
                  <span className={styles.successDetailVal}>{successResult.data.transactionId}</span>
                </div>
                <div className={styles.successDetailRow}>
                  <span className={styles.successDetailKey}>접수번호</span>
                  <span className={styles.successDetailVal}>#{successResult.data.id}</span>
                </div>
                <div className={styles.successDetailRow}>
                  <span className={styles.successDetailKey}>처리 상태</span>
                  <span className={styles.successDetailVal}>{refundStatusLabel(successResult.data.refundStatus)}</span>
                </div>
              </div>
            )}
            <p className={styles.successHint}>영업일 기준 1~2일 내 확인 후 안내드립니다.</p>
            <button
              type='button'
              className={styles.successHomeBtn}
              onClick={() => {
                setSuccessResult(null);
                navigate('/mobile');
              }}
            >
              홈으로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import styles from './GoodsItem.module.css';

export default function GoodsItem({ image, name, desc, price, onClick }) {
  const amount = Number(price);
  const safePrice = Number.isFinite(amount) ? amount : 0;

  return (
    <div className={styles.card}>
      <img src={image} alt={name} className={styles.thumbnail} onClick={onClick} />

      <div className={styles.name}>{name}</div>
      <div className={styles.desc}>{desc}</div>
      <div className={styles.price}>{safePrice.toLocaleString()}원</div>
    </div>
  );
}

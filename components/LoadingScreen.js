import Head from "next/head";
import styles from "../styles/components/LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.progress}>
      <div className={styles.color}></div>
    </div>
  );
}

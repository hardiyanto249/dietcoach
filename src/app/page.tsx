import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Activity, Zap, Heart } from "lucide-react";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.backgroundGlow}>
        <div className={`${styles.glowBlob} ${styles.blob1}`} />
        <div className={`${styles.glowBlob} ${styles.blob2}`} />
      </div>

      <div className={`glass-panel ${styles.heroStatus}`}>
        <div className={styles.statusIcon}>
          <Activity className="text-white" size={24} />
        </div>
        <div className={styles.statusText}>
          <p className={styles.statusLabel}>Status</p>
          <p className={styles.statusValue}>Metabolism Active</p>
        </div>
      </div>

      <h1 className={`${styles.title} fade-in`}>
        DIET <span className={styles.highlight}>COACH</span>
      </h1>

      <p className={`${styles.subtitle} fade-in`}>
        Your AI-powered personal health companion. Track calories, get real-time feedback, and achieve your goals 24/7.
      </p>

      <Link href="/register" className="glass-button fade-in">
        Start Your Journey
        <ArrowRight size={20} />
      </Link>

      <div className={`${styles.features} fade-in`}>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Zap size={24} className="text-yellow-400" />
          </div>
          <span className={styles.featureLabel}>Fast</span>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Activity size={24} className="text-emerald-400" />
          </div>
          <span className={styles.featureLabel}>Smart</span>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIcon}>
            <Heart size={24} className="text-rose-400" />
          </div>
          <span className={styles.featureLabel}>Personal</span>
        </div>
      </div>
    </main>
  );
}

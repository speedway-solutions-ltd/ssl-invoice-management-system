import TopBar from './TopBar';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

type Props = { children: React.ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className={styles.layoutRoot}>
      <TopBar />
      <div className={styles.layoutContent}>
        <Sidebar />
        <main className={styles.layoutMain}>{children}</main>
      </div>
    </div>
  );
}

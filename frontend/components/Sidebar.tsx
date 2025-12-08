import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Navigation</div>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link
            href="/admin/dashboard"
            className={`${styles.navItemLink} ${
              router.pathname === '/admin/dashboard' ? styles.active : ''
            }`}
          >
            📈 Dashboard
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link
            href="/admin/invoices"
            className={`${styles.navItemLink} ${
              router.pathname.includes('/invoices') ? styles.active : ''
            }`}
          >
            📄 Invoices
          </Link>
        </li>
      </ul>
    </aside>
  );
}

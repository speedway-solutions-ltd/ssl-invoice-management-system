import Link from 'next/link';
import { useState } from 'react';
import styles from './TopBar.module.css';

export default function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className={styles.topbar}>
      <div className={styles.container}>
        <Link href="/admin/dashboard" className={styles.logo}>
          📊 Invoice Admin
        </Link>
        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/admin/invoices" className={styles.navLink}>
            Invoices
          </Link>
        </nav>
      </div>
      <div className={styles.rightSection}>
        <div style={{ position: 'relative' }}>
          <button
            className={styles.userMenu}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Admin ▼
          </button>
          {dropdownOpen && (
            <div className={styles.dropdownContent} style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8 }}>
              <button className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Profile</button>
              <button className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Settings</button>
              <div className={styles.separator}></div>
              <button className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

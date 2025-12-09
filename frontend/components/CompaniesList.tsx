import Link from 'next/link';
import { useEffect, useState } from 'react';
import { companiesApi } from '../lib/api-client';
import styles from './InvoiceList.module.css';

export default function CompaniesList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await companiesApi.list();
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: number) {
    if (!confirm('Delete company?')) return;
    await companiesApi.remove(id);
    load();
  }

  if (loading) return <div className={styles.loadingState}>Loading companies...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Companies</h2>
        <Link href="/admin/companies/new" className={styles.createBtn}>
          + Create Company
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>No companies found</div>
          <Link href="/admin/companies/new" className={styles.createBtn}>
            Create your first company
          </Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Name</th>
                <th className={styles.tableHeader}>Type</th>
                <th className={styles.tableHeader}>Phone / Email</th>
                <th className={styles.tableHeader} style={{ textAlign: 'right', width: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className={styles.tableRow}>
                  <td className={styles.tableCell} style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className={styles.tableCell}>{c.type}</td>
                  <td className={styles.tableCell}>{c.phone || '-'} {c.email ? ` / ${c.email}` : ''}</td>
                  <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/admin/companies/${c.id}/edit`} className={styles.btn}>
                        Edit
                      </Link>
                      <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => remove(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

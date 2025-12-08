import Link from 'next/link';
import { useEffect, useState } from 'react';
import { invoicesApi } from '../lib/api-client';
import styles from './InvoiceList.module.css';

export default function InvoiceList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await invoicesApi.list();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: number) {
    if (!confirm('Delete invoice?')) return;
    await invoicesApi.remove(id);
    load();
  }

  if (loading) {
    return <div className={styles.loadingState}>Loading invoices...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Invoices</h2>
        <Link href="/admin/invoices/new" className={styles.createBtn}>
          + Create Invoice
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>No invoices found</div>
          <Link href="/admin/invoices/new" className={styles.createBtn}>
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Invoice #</th>
                <th className={styles.tableHeader}>Bill To</th>
                <th className={styles.tableHeader}>Date</th>
                <th className={styles.tableHeader} style={{ textAlign: 'right' }}>
                  Total
                </th>
                <th className={styles.tableHeader} style={{ textAlign: 'right', width: '150px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <Link
                      href={`/admin/invoices/${inv.id}/edit`}
                      className={styles.invoiceNumber}
                    >
                      #{inv.invoice_number || inv.id}
                    </Link>
                  </td>
                  <td className={styles.tableCell}>{inv.bill_to || '—'}</td>
                  <td className={styles.tableCell}>{inv.date || '—'}</td>
                  <td className={styles.tableCell} style={{ textAlign: 'right', fontWeight: 500 }}>
                    ${Number(inv.total || 0).toFixed(2)}
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionCell}>
                      <button
                        className={`${styles.btn} ${styles.deleteBtn}`}
                        onClick={() => remove(inv.id)}
                      >
                        Delete
                      </button>
                      <a
                        href={invoicesApi.pdfUrl(inv.id)}
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.btn} ${styles.pdfBtn}`}
                        style={{ textDecoration: 'none' }}
                      >
                        PDF
                      </a>
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

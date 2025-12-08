import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { invoicesApi } from '../lib/api-client';
import styles from './InvoiceForm.module.css';

export default function InvoiceForm({ id }: { id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>({
    invoice_number: '',
    date: new Date().toISOString().slice(0, 10),
    bill_to: '',
    subtotal: 0,
    tax: 0,
    other: 0,
    total: 0,
    notes: '',
    items: [],
  });

  useEffect(() => {
    if (id) {
      (async () => {
        const data = await invoicesApi.get(id);
        setInvoice(data);
      })();
    }
  }, [id]);

  function setField(field: string, value: any) {
    setInvoice((prev: any) => ({ ...prev, [field]: value }));
  }

  function addItem() {
    setInvoice((prev: any) => ({
      ...prev,
      items: [...(prev.items || []), { item_code: '', description: '', qty: 1, unit_price: 0, total: 0 }],
    }));
  }

  function updateItem(idx: number, field: string, value: any) {
    const items = [...invoice.items];
    items[idx] = { ...items[idx], [field]: value };
    setInvoice((prev: any) => ({ ...prev, items }));
  }

  function removeItem(idx: number) {
    setInvoice((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== idx),
    }));
  }

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await invoicesApi.update(id, invoice);
      } else {
        await invoicesApi.create(invoice);
      }
      router.push('/admin/invoices');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>{id ? 'Edit Invoice' : 'Create Invoice'}</h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Invoice Number</label>
          <input
            type="text"
            className={styles.formInput}
            value={invoice.invoice_number || ''}
            onChange={(e) => setField('invoice_number', e.target.value)}
            placeholder="INV-001"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Date</label>
          <input
            type="date"
            className={styles.formInput}
            value={invoice.date || ''}
            onChange={(e) => setField('date', e.target.value)}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.formGridFull}`}>
          <label className={styles.formLabel}>Bill To</label>
          <textarea
            className={styles.formTextarea}
            value={invoice.bill_to || ''}
            onChange={(e) => setField('bill_to', e.target.value)}
            placeholder="Customer name and address"
          />
        </div>

        <div className={`${styles.formGroup} ${styles.formGridFull}`}>
          <label className={styles.formLabel}>Notes</label>
          <textarea
            className={styles.formTextarea}
            value={invoice.notes || ''}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Additional notes"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className={styles.itemsSection}>
        <h3 className={styles.itemsSectionTitle}>Line Items</h3>
        {invoice.items && invoice.items.length > 0 && (
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.itemsTableHeader}>Item Code</th>
                <th className={styles.itemsTableHeader}>Description</th>
                <th className={styles.itemsTableHeader}>Qty</th>
                <th className={styles.itemsTableHeader}>Unit Price</th>
                <th className={styles.itemsTableHeader}>Total</th>
                <th className={styles.itemsTableHeader}></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className={styles.itemsTableCell}>
                    <input
                      type="text"
                      className={styles.itemInput}
                      value={item.item_code || ''}
                      onChange={(e) => updateItem(idx, 'item_code', e.target.value)}
                      placeholder="CODE"
                    />
                  </td>
                  <td className={styles.itemsTableCell}>
                    <input
                      type="text"
                      className={styles.itemInput}
                      value={item.description || ''}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td className={styles.itemsTableCell}>
                    <input
                      type="number"
                      className={styles.itemInput}
                      value={item.qty || 0}
                      onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                      min="1"
                    />
                  </td>
                  <td className={styles.itemsTableCell}>
                    <input
                      type="number"
                      className={styles.itemInput}
                      value={item.unit_price || 0}
                      onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className={styles.itemsTableCell}>
                    <input
                      type="number"
                      className={styles.itemInput}
                      value={item.total || 0}
                      onChange={(e) => updateItem(idx, 'total', Number(e.target.value))}
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className={styles.itemsTableCell}>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeItem(idx)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button type="button" className={styles.addItemBtn} onClick={addItem}>
          + Add Item
        </button>
      </div>

      {/* Form Summary Fields */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Subtotal</label>
          <input
            type="number"
            className={styles.formInput}
            value={invoice.subtotal || 0}
            onChange={(e) => setField('subtotal', Number(e.target.value))}
            step="0.01"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tax</label>
          <input
            type="number"
            className={styles.formInput}
            value={invoice.tax || 0}
            onChange={(e) => setField('tax', Number(e.target.value))}
            step="0.01"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Other</label>
          <input
            type="number"
            className={styles.formInput}
            value={invoice.other || 0}
            onChange={(e) => setField('other', Number(e.target.value))}
            step="0.01"
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Total</label>
          <input
            type="number"
            className={styles.formInput}
            value={invoice.total || 0}
            onChange={(e) => setField('total', Number(e.target.value))}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Summary Section */}
      <div className={styles.summarySection}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Subtotal:</span>
          <span className={styles.summaryValue}>${Number(invoice.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tax:</span>
          <span className={styles.summaryValue}>${Number(invoice.tax || 0).toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Other:</span>
          <span className={styles.summaryValue}>${Number(invoice.other || 0).toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem} style={{ borderLeft: '1px solid var(--slate-300)', paddingLeft: 40 }}>
          <span className={styles.summaryLabel}>Total:</span>
          <span className={styles.summaryValue} style={{ fontSize: 22 }}>
            ${Number(invoice.total || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Form Actions */}
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.back()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

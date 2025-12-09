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
    tax_percent: 0,
    discount_type: 'percent',
    discount_value: 0,
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
    // clamp/validate percent fields
    if (field === 'tax_percent') {
      const v = Number(value || 0);
      const clamped = Math.max(0, Math.min(100, v));
      setInvoice((prev: any) => ({ ...prev, [field]: clamped }));
      return;
    }
    if (field === 'discount_value' && (invoice.discount_type || 'percent') === 'percent') {
      const v = Number(value || 0);
      const clamped = Math.max(0, Math.min(100, v));
      setInvoice((prev: any) => ({ ...prev, [field]: clamped }));
      return;
    }
    setInvoice((prev: any) => ({ ...prev, [field]: value }));
  }

  function addItem() {
    setInvoice((prev: any) => ({
      ...prev,
      items: [...(prev.items || []), { item_code: '', description: '', qty: 1, unit_price: 0, discount_type: 'percent', discount_value: 0, total: 0 }],
    }));
  }

  function updateItem(idx: number, field: string, value: any) {
    const items = [...invoice.items];
    items[idx] = { ...items[idx], [field]: value };
    // auto compute line total when qty or unit_price change
    const qty = Number(items[idx].qty || 0);
    const unit = Number(items[idx].unit_price || 0);
    const discType = items[idx].discount_type || 'percent';
    let discValue = Number(items[idx].discount_value || 0);
    // clamp percent-type discounts to 0-100
    if (field === 'discount_value' && discType === 'percent') {
      discValue = Math.max(0, Math.min(100, discValue));
      items[idx].discount_value = discValue;
    }
    // if discount_type changed from fixed->percent and value >100, clamp
    if (field === 'discount_type') {
      if (items[idx].discount_type === 'percent') {
        const v = Number(items[idx].discount_value || 0);
        items[idx].discount_value = Math.max(0, Math.min(100, v));
      }
    }
    // if any of qty/unit/discount changed, recompute item total
    if (['qty', 'unit_price', 'discount_value', 'discount_type'].includes(field)) {
      const gross = qty * unit;
      let disc = 0;
      if (discType === 'percent') disc = gross * (discValue / 100);
      else disc = discValue;
      const lineTotal = Math.max(0, gross - disc);
      items[idx].total = Number(lineTotal.toFixed(2));
    }
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

  // Recompute invoice totals whenever items, discount, tax_percent or other change
  useEffect(() => {
    const items = invoice.items || [];
    const subtotal = items.reduce((s: number, it: any) => s + Number(it.total || 0), 0);
    const discountValue = Number(invoice.discount_value || 0);
    const discountType = invoice.discount_type || 'percent';
    const discountAmount = discountType === 'percent' ? (subtotal * (discountValue / 100)) : discountValue;
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxPercent = Number(invoice.tax_percent || 0);
    const taxAmount = Number(((taxableBase * taxPercent) / 100).toFixed(2));
    const other = Number(invoice.other || 0);
    const total = Number((taxableBase + taxAmount + other).toFixed(2));
    // update only if changed to avoid re-render loop
    setInvoice((prev: any) => {
      const changed = prev.subtotal !== subtotal || Number(prev.tax) !== taxAmount || Number(prev.total) !== total;
      if (changed) {
        return { ...prev, subtotal, tax: taxAmount, total };
      }
      return prev;
    });
  }, [invoice.items, invoice.discount_value, invoice.discount_type, invoice.tax_percent, invoice.other]);

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
                <th className={styles.itemsTableHeader}>Discount</th>
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
                  <td className={styles.itemsTableCell} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={item.discount_type || 'percent'} onChange={(e) => updateItem(idx, 'discount_type', e.target.value)}>
                      <option value="percent">% Off</option>
                      <option value="fixed">$ Off</option>
                    </select>
                    <input
                      type="number"
                      className={styles.itemInput}
                      value={item.discount_value || 0}
                      onChange={(e) => updateItem(idx, 'discount_value', Number(e.target.value))}
                      step="0.01"
                      min="0"
                      style={{ width: 80 }}
                    />
                  </td>
                  <td className={styles.itemsTableCell}>
                    <div style={{ fontWeight: 600 }}>${Number(item.total || 0).toFixed(2)}</div>
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

      {/* Form Summary Fields (ordered & right-aligned): Subtotal, Discount, Tax, Other, Total */}
      <div className={styles.formGrid}>
        {/* <div className={styles.summarySection}> */}
        <div className={styles.formGroup}>
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
        <div className={styles.formGroup}>

          {/* Subtotal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <label className={styles.formLabel} style={{ textAlign: 'left' }}>Subtotal</label>
            <input
              type="number"
              className={styles.formInput}
              value={invoice.subtotal || 0}
              onChange={(e) => setField('subtotal', Number(e.target.value))}
              step="0.01"
              min="0"
              style={{ textAlign: 'right' }}
            />
          </div>

          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <label className={styles.formLabel} style={{ textAlign: 'left' }}>Discount</label>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={invoice.discount_type || 'percent'}
                onChange={(e) => setField('discount_type', e.target.value)}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>

              <input
                type="number"
                className={styles.formInput}
                value={invoice.discount_value || 0}
                onChange={(e) => setField('discount_value', Number(e.target.value))}
                step="0.01"
                min="0"
                style={{ textAlign: 'right' }}
              />
            </div>
          </div>

          {/* Tax */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <label className={styles.formLabel} style={{ textAlign: 'left' }}>Tax %</label>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                className={styles.formInput}
                value={invoice.tax_percent || 0}
                onChange={(e) => setField('tax_percent', Number(e.target.value))}
                step="0.01"
                min="0"
                placeholder="Tax %"
                style={{ textAlign: 'right' }}
              />
              {/* <div style={{ color: 'var(--slate-600)', minWidth: 80, textAlign: 'right' }}>
                ${Number(invoice.tax || 0).toFixed(2)}
              </div> */}
            </div>
          </div>

          {/* Other */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <label className={styles.formLabel} style={{ textAlign: 'left' }}>Other</label>
            <input
              type="number"
              className={styles.formInput}
              value={invoice.other || 0}
              onChange={(e) => setField('other', Number(e.target.value))}
              step="0.01"
              min="0"
              style={{ textAlign: 'right' }}
            />
          </div>

          {/* Total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <label className={styles.formLabel} style={{ textAlign: 'left', fontWeight: 600 }}>Total</label>
            <input
              type="number"
              className={styles.formInput}
              value={invoice.total || 0}
              readOnly
              step="0.01"
              min="0"
              style={{ textAlign: 'right' }}
            />
          </div>

        </div>

      </div>

      {/* --------------------------- */}

      {/* --------------------------- */}

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

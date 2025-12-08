import InvoiceList from '../../../components/InvoiceList';

export default function InvoicesPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 8 }}>Invoice Management</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>Manage and track all your invoices</p>
      </div>
      <InvoiceList />
    </div>
  );
}

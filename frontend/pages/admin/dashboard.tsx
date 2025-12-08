import InvoiceList from '../../components/InvoiceList';

export default function Dashboard() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>Welcome to the invoice management system</p>
      </div>
      <section>
        <InvoiceList />
      </section>
    </div>
  );
}

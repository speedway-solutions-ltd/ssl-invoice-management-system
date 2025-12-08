import InvoiceForm from '../../../components/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 8 }}>Create New Invoice</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>Create a new invoice by filling out the form below</p>
      </div>
      <InvoiceForm />
    </div>
  );
}

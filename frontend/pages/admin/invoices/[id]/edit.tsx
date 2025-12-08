import { useRouter } from 'next/router';
import InvoiceForm from '../../../../components/InvoiceForm';

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  if (!id) return <div>Loading...</div>;
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 8 }}>Edit Invoice</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: 14 }}>Update invoice information below</p>
      </div>
      <InvoiceForm id={String(id)} />
    </div>
  );
}

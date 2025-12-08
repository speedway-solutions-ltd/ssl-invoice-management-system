import { useRouter } from 'next/router';
import { useState } from 'react';
import axios from 'axios';
export default function Create() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const router = useRouter();
  async function submit(e: any) {
    e.preventDefault();
    const res = await axios.post(
      '/api/proxy/invoices', {
      invoice_number: invoiceNumber,
      date: new Date().toISOString().slice(0, 10),
      subtotal: 0,
      total: 0,
      items: []
    });
    router.push('/');
  }
  return (
    <div style={{ padding: 20 }}>
      <h1>Create invoice</h1>
      <form onSubmit={submit}>
        <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Invoice #" />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

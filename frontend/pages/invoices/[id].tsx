import axios from 'axios';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { baseUrl } from '../../config/base-url';
const fetcher = (url: string) => axios.get(url).then(r=>r.data);
export default function InvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data, mutate } = useSWR(id ? `${baseUrl}/api/v1/invoices/${id}` : null, fetcher);
  if (!data) return <div>Loading...</div>;
  return (
    <div style={{ padding: 20 }}>
      <h1>Invoice #{data.invoice_number || data.id}</h1>
      <div>
        <strong>Bill To:</strong>
        <div>{data.bill_to}</div>
      </div>
      <div>
        <strong>Items:</strong>
        <ul>
          {data.items?.map((it: any) => <li key={it.id}>{it.item_code} — {it.description} — {it.total}</li>)}
        </ul>
      </div>
      <div><strong>Total:</strong> {data.total}</div>
      <div style={{ marginTop: 10 }}>
        <Link href={`${baseUrl}/api/v1/invoices/${data.id}/pdf`} target="_blank" rel="noreferrer"><button>Download PDF</button></Link>
      </div>
    </div>
  );
}

import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
const fetcher = (url: string) => axios.get(url).then(r => r.data);
export default function Home() {
  const { data, mutate } = useSWR('/api/proxy/invoices', fetcher);
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Invoices</h1>
      <Link href="/create"><button>Create invoice</button></Link>
      <ul>
        {data?.map((inv: any) => (
          <li key={inv.id}>
            <Link href={`/invoices/${inv.id}`}>#{inv.invoice_number || inv.id} — {inv.total}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

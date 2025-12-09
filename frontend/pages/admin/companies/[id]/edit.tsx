import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import CompanyForm from '../../../../components/CompanyForm';

export default function EditCompanyPage() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Layout>
      <div style={{ padding: 24 }}>
        {id ? <CompanyForm id={String(id)} /> : <div>Loading...</div>}
      </div>
    </Layout>
  );
}

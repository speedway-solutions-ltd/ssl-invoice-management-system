import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { companiesApi } from '../lib/api-client';
import styles from './InvoiceForm.module.css';

export default function CompanyForm({ id }: { id?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    type: 'client',
  });

  useEffect(() => {
    if (id) {
      (async () => {
        const data = await companiesApi.get(id);
        setCompany(data);
      })();
    }
  }, [id]);

  function setField(field: string, value: any) {
    setCompany((p: any) => ({ ...p, [field]: value }));
  }

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) await companiesApi.update(id, company);
      else await companiesApi.create(company);
      router.push('/admin/companies');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>{id ? 'Edit Company' : 'Create Company'}</h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Name</label>
          <input className={styles.formInput} value={company.name || ''} onChange={(e) => setField('name', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Type</label>
          <select className={styles.formInput} value={company.type || 'client'} onChange={(e) => setField('type', e.target.value)}>
            <option value="own">Own</option>
            <option value="client">Client</option>
          </select>
        </div>

        <div className={`${styles.formGroup} ${styles.formGridFull}`}>
          <label className={styles.formLabel}>Address</label>
          <textarea className={styles.formTextarea} value={company.address || ''} onChange={(e) => setField('address', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Phone</label>
          <input className={styles.formInput} value={company.phone || ''} onChange={(e) => setField('phone', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email</label>
          <input className={styles.formInput} value={company.email || ''} onChange={(e) => setField('email', e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Website</label>
          <input className={styles.formInput} value={company.website || ''} onChange={(e) => setField('website', e.target.value)} />
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}

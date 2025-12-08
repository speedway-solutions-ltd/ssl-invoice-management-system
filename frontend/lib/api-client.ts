import axios from 'axios';

const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

export const invoicesApi = {
    list: () => client.get('/invoices').then(r => r.data),
    get: (id: number | string) => client.get(`/invoices/${id}`).then(r => r.data),
    create: (payload: any) => client.post('/invoices', payload).then(r => r.data),
    update: (id: number | string, payload: any) => client.put(`/invoices/${id}`, payload).then(r => r.data),
    remove: (id: number | string) => client.delete(`/invoices/${id}`).then(r => r.data),
    pdfUrl: (id: number | string) => `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/pdf`,
};

export default client;

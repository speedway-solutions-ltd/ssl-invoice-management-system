import axios from 'axios';
import { baseUrl } from '../config/base-url';

const client = axios.create({ baseURL: baseUrl });

export const invoicesApi = {
    list: () => client.get('/invoices').then(r => r.data),
    get: (id: number | string) => client.get(`/invoices/${id}`).then(r => r.data),
    create: (payload: any) => client.post('/invoices', payload).then(r => r.data),
    update: (id: number | string, payload: any) => client.put(`/invoices/${id}`, payload).then(r => r.data),
    remove: (id: number | string) => client.delete(`/invoices/${id}`).then(r => r.data),
    pdfUrl: (id: number | string) => `${baseUrl}/invoices/${id}/pdf`,
};

export const companiesApi = {
    list: () => client.get('/companies').then(r => r.data),
    get: (id: number | string) => client.get(`/companies/${id}`).then(r => r.data),
    create: (payload: any) => client.post('/companies', payload).then(r => r.data),
    update: (id: number | string, payload: any) => client.put(`/companies/${id}`, payload).then(r => r.data),
    remove: (id: number | string) => client.delete(`/companies/${id}`).then(r => r.data),
};

export default client;

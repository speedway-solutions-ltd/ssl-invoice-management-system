// Simple proxy to backend (avoid CORS during local dev)
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const urlPath = Array.isArray(path) ? path.join('/') : path;
  const backend = process.env.BACKEND_URL || 'http://localhost:3001';
  const url = backend + '/api/' + urlPath;
  const options: any = { method: req.method, headers: {} };
  if (req.body && Object.keys(req.body).length) {
    options.body = JSON.stringify(req.body);
    options.headers['Content-Type'] = 'application/json';
  }
  const resp = await fetch(url, options);
  const contentType = resp.headers.get('content-type') || '';
  res.status(resp.status);
  if (contentType.includes('application/json')) {
    const json = await resp.json();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } else {
    const buffer = await resp.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  }
}

import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/protected');
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load protected data');
      }
    })();
  }, []);

  return (
    <div>
      <h3>Dashboard (protected)</h3>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {err && <p style={{color:'crimson'}}>{err}</p>}
    </div>
  );
}
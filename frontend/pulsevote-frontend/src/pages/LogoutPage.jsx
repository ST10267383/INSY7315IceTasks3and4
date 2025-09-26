import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const nav = useNavigate();
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/login', { replace: true });
  }, [nav]);
  return <p>Logging out…</p>;
}
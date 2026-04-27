// src/pages/admin/AdminSignup.tsx
// Registration is now inline on the AdminLogin page.
// This file redirects any direct visits to /admin/signup → /admin/login
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSignup() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/admin/login', { replace: true }); }, [navigate]);
  return null;
}

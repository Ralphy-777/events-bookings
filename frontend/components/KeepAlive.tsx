'use client';
import { useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => fetch(`${API_BASE.replace('/api/user', '')}/health/`).catch(() => {});
    ping();
    const id = setInterval(ping, 4 * 60 * 1000); // every 4 minutes
    return () => clearInterval(id);
  }, []);
  return null;
}

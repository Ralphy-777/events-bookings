'use client';
import { useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export default function KeepAlive() {
  useEffect(() => {
    // Ping immediately on load
    fetch(`${API_BASE.replace('/api/user', '')}/health/`).catch(() => {});
    // Then every 10 minutes
    const id = setInterval(() => {
      fetch(`${API_BASE.replace('/api/user', '')}/health/`).catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return null;
}

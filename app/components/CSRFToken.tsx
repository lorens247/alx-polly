'use client';

import { useEffect, useState } from 'react';

export default function CSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Fetch CSRF token from server
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        // Fallback to client-side generation if server fails
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        setToken(Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(''));
      }
    };
    
    fetchCSRFToken();
  }, []);

  return <input type="hidden" name="csrf-token" value={token} />;
}

'use client';

import { useEffect, useState } from 'react';

interface CSRFTokenProviderProps {
  children: React.ReactNode;
}

export default function CSRFTokenProvider({ children }: CSRFTokenProviderProps) {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const generateToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to generate CSRF token:', error);
      }
    };

    generateToken();
  }, []);

  return (
    <>
      {token && (
        <input type="hidden" name="csrf-token" value={token} />
      )}
      {children}
    </>
  );
}

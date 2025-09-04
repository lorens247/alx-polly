'use client';

import { useEffect, useState } from 'react';

export default function CSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Generate a simple CSRF token for client-side forms
    // In a real application, this should come from the server
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
    
    setToken(generateToken());
  }, []);

  return <input type="hidden" name="csrf-token" value={token} />;
}

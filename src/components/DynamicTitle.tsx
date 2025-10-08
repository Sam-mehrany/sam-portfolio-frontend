"use client";

import { useEffect } from 'react';

export default function DynamicTitle() {
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_title) {
          document.title = data.site_title;
        }
      })
      .catch(err => {
        console.error('Failed to load site title:', err);
      });
  }, []);

  return null;
}

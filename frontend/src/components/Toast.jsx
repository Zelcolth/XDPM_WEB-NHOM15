import React, { useEffect } from 'react';

export default function Toast({ visible, message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const bg = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-orange-500';

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className={`${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        <div className="text-xl">{type === 'error' ? '✖' : '✓'}</div>
        <div className="font-medium">{message}</div>
      </div>
    </div>
  );
}

import React from 'react';

export default function FlyingCartOverlay({ flyingItems }) {
  if (!flyingItems || flyingItems.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {flyingItems.map(item => (
        <div
          key={item.id}
          className="absolute w-12 h-12 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-500 bg-white dark:bg-slate-900 transition-all"
          style={{
            left: `${item.startX}px`,
            top: `${item.startY}px`,
            animation: 'flyParabola 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            '--delta-x': `${item.targetX - item.startX}px`,
            '--delta-y': `${item.targetY - item.startY}px`,
          }}
        >
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

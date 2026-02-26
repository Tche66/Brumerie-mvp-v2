// src/components/VerifiedTag.tsx — Badge VÉRIFIÉ texte vert unifié
import React from 'react';

interface VerifiedTagProps {
  size?: 'sm' | 'md' | 'lg';   // sm = fiche produit, md = profil, lg = hero
  style?: 'tag' | 'inline';    // tag = fond vert, inline = texte seul
}

export function VerifiedTag({ size = 'md', style = 'tag' }: VerifiedTagProps) {
  const sizes = {
    sm: 'text-[7px] px-1.5 py-0.5 gap-1',
    md: 'text-[8px] px-2.5 py-1 gap-1',
    lg: 'text-[10px] px-3 py-1.5 gap-1.5',
  };
  const iconSizes = { sm: 7, md: 9, lg: 11 };

  if (style === 'inline') return (
    <span className={`inline-flex items-center gap-1 font-black text-green-600 uppercase tracking-widest ${sizes[size]}`}>
      <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Vérifié
    </span>
  );

  return (
    <span className={`inline-flex items-center font-black uppercase tracking-wider text-white rounded-full ${sizes[size]}`}
      style={{ background: '#16A34A' }}>
      <svg width={iconSizes[size]} height={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      VÉRIFIÉ
    </span>
  );
}

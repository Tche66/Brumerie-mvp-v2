// src/pages/DashboardPage.tsx — Sprint 8 : Tableau de bord vendeur
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSellerProducts } from '@/services/productService';
import { subscribeSellerReviews } from '@/services/reviewService';
import { Product, PLAN_LIMITS } from '@/types';

interface DashboardPageProps { onBack: () => void; onUpgrade?: () => void; onEditProduct?: (product: Product) => void; }

export function DashboardPage({ onBack, onUpgrade, onEditProduct }: DashboardPageProps) {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const tier = userProfile?.isPremium ? 'premium' : userProfile?.isVerified ? 'verified' : 'simple';
  const limits = PLAN_LIMITS[tier];

  useEffect(() => {
    if (!userProfile?.id) return;
    getSellerProducts(userProfile.id).then(p => { setProducts(p); setLoading(false); }).catch(() => setLoading(false));
    const unsub = subscribeSellerReviews(userProfile.id, (_r, avg, cnt) => { setAvgRating(avg); setReviewCount(cnt); });
    return unsub;
  }, [userProfile?.id]);

  const activeProducts = products.filter(p => p.status !== 'sold');
  const soldProducts = products.filter(p => p.status === 'sold');
  const totalViews = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalContacts = products.reduce((sum, p) => sum + (p.whatsappClickCount || 0), 0);
  const dailyChatsUsed = userProfile?.dailyChatCount || 0;
  const dailyChatsLimit = limits.dailyChats >= 999 ? '∞' : limits.dailyChats;
  const productLimit = limits.products >= 999 ? '∞' : limits.products;

  const tierColor = tier === 'premium' ? '#F59E0B' : tier === 'verified' ? '#1D9BF0' : '#94A3B8';

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans">

      {/* Header */}
      <div className="bg-white px-5 py-5 flex items-center gap-4 border-b border-slate-100 sticky top-0 z-10">
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 active:scale-90 transition-all">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="#0F0F0F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div>
          <h1 className="font-black text-sm uppercase tracking-widest text-slate-900">Tableau de bord</h1>
          <p className="text-[9px] text-slate-400 font-bold mt-0.5">Performance de ta boutique</p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* Plan actuel */}
        <div className="rounded-3xl p-5 text-white" style={{ background: tier === 'premium' ? '#0F0F0F' : tier === 'verified' ? '#1D9BF0' : '#64748B' }}>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Plan actuel</p>
          <div className="flex items-center justify-between">
            <p className="font-black text-2xl uppercase">{tier}</p>
            {tier === 'simple' && (
              <button onClick={onUpgrade}
                className="bg-white text-slate-900 font-black text-[10px] uppercase px-4 py-2 rounded-xl active:scale-95 transition-all">
                Passer Vérifié →
              </button>
            )}
            {tier === 'verified' && (
              <button onClick={onUpgrade}
                className="bg-white/20 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl">
                Voir Premium
              </button>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <p className="font-black text-lg">{activeProducts.length}<span className="text-white/60 text-sm">/{productLimit}</span></p>
              <p className="text-[9px] uppercase font-bold opacity-60">Produits actifs</p>
            </div>
            <div className="w-px bg-white/20"/>
            <div>
              <p className="font-black text-lg">{dailyChatsUsed}<span className="text-white/60 text-sm">/{dailyChatsLimit}</span></p>
              <p className="text-[9px] uppercase font-bold opacity-60">Chats aujourd'hui</p>
            </div>
          </div>
        </div>

        {/* Stats grille */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Vues totales', value: totalViews, icon: '👁️', color: 'bg-blue-50', text: 'text-blue-700' },
            { label: 'Contacts reçus', value: totalContacts, icon: '💬', color: 'bg-green-50', text: 'text-green-700' },
            { label: 'Articles vendus', value: soldProducts.length, icon: '✅', color: 'bg-purple-50', text: 'text-purple-700' },
            { label: 'Note moyenne', value: avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : '—', icon: '⭐', color: 'bg-amber-50', text: 'text-amber-700' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-3xl p-5 border border-slate-100`}>
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className={`font-black text-2xl ${stat.text}`}>{loading ? '...' : stat.value}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Avis summary */}
        {reviewCount > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100">
            <p className="font-black text-slate-900 text-[11px] uppercase tracking-widest mb-3">Réputation</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-black text-slate-900">{avgRating.toFixed(1)}</p>
              <div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={avgRating >= s ? '#FBBF24' : '#E2E8F0'} stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{reviewCount} avis reçus</p>
              </div>
            </div>
          </div>
        )}

        {/* Top produits */}
        {products.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100">
            <p className="font-black text-slate-900 text-[11px] uppercase tracking-widest mb-3">Tes articles</p>
            <div className="space-y-3">
              {products.sort((a,b) => (b.whatsappClickCount||0) - (a.whatsappClickCount||0)).slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-[11px] truncate">{p.title}</p>
                    <p className="text-[9px] text-slate-400">{p.whatsappClickCount || 0} contacts · {p.viewCount || 0} vues</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${p.status === 'sold' ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-700'}`}>
                    {p.status === 'sold' ? 'Vendu' : 'Actif'}
                  </span>
                  {onEditProduct && p.status !== 'sold' && (
                    <button onClick={() => onEditProduct(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 active:scale-90 transition-all flex-shrink-0" title="Modifier">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique des prix */}
        {products.some(p => p.priceHistory && p.priceHistory.length > 1) && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100">
            <p className="font-black text-slate-900 text-[11px] uppercase tracking-widest mb-3">Historique des prix</p>
            {products.filter(p => p.priceHistory && p.priceHistory.length > 1).map(p => (
              <div key={p.id} className="mb-4 last:mb-0">
                <p className="text-[10px] font-black text-slate-700 mb-2">{p.title}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {p.priceHistory!.map((h, i) => (
                    <div key={i} className="flex-shrink-0 bg-slate-50 rounded-xl px-3 py-2 text-center">
                      <p className="text-[11px] font-black text-slate-900">{h.price.toLocaleString('fr-FR')}</p>
                      <p className="text-[8px] text-slate-400">{new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

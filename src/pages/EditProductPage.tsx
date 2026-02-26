// src/pages/EditProductPage.tsx — Sprint 8 : Modifier un article
import React, { useState } from 'react';
import { Product, CATEGORIES, NEIGHBORHOODS } from '@/types';
import { updateProduct } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';

interface EditProductPageProps {
  product: Product;
  onBack: () => void;
  onSuccess: () => void;
}

export function EditProductPage({ product, onBack, onSuccess }: EditProductPageProps) {
  const { userProfile } = useAuth();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(String(product.price));
  const [originalPrice, setOriginalPrice] = useState(String(product.originalPrice || ''));
  const [category, setCategory] = useState(product.category);
  const [neighborhood, setNeighborhood] = useState(product.neighborhood);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const discountPct = originalPrice && price && Number(originalPrice) > Number(price)
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  const handleSave = async () => {
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Prix invalide.'); return; }
    if (product.sellerId !== userProfile?.id) { setError('Non autorisé.'); return; }

    setLoading(true); setError('');
    try {
      await updateProduct(product.id, {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice && Number(originalPrice) > Number(price)
          ? parseFloat(originalPrice) : undefined,
        category,
        neighborhood,
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1200);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la modification.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-10">
        <p className="text-5xl mb-4">✅</p>
        <p className="font-black text-slate-900 text-xl uppercase">Article mis à jour !</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 z-50 px-5 py-5 flex items-center gap-4">
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 active:scale-90 transition-all">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="#0F0F0F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div>
          <h1 className="font-black text-sm uppercase tracking-widest text-slate-900">Modifier l'article</h1>
          <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[200px]">{product.title}</p>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">

        {/* Aperçu photos (non modifiables pour MVP) */}
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Photos actuelles</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-slate-100">
                <img src={img} alt="" className="w-full h-full object-cover"/>
                {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-green-600 text-white text-[7px] text-center font-bold py-0.5">PRINCIPALE</div>}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Pour changer les photos, supprime et recrée l'article.</p>
        </div>

        {/* Titre */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Titre</label>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-base font-black text-slate-900 focus:outline-none focus:border-slate-300"/>
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={500}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-300 resize-none"/>
        </div>

        {/* Prix */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Prix actuel (FCFA)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            inputMode="numeric" placeholder="Ex: 15000"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 focus:outline-none focus:border-slate-300"/>
        </div>

        {/* Ancien prix */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
            Ancien prix — réduction (optionnel)
          </label>
          <div className="relative">
            <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
              inputMode="numeric" placeholder="Ex: 20000"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xl font-black text-slate-900 focus:outline-none focus:border-slate-300"/>
            {discountPct > 0 && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="bg-red-500 text-white font-black text-[11px] px-2.5 py-1 rounded-xl">-{discountPct}%</span>
              </div>
            )}
          </div>
          {discountPct > 0 && (
            <p className="text-[10px] text-green-600 font-bold mt-2">
              ✓ Réduction de {discountPct}% affichée sur l'article
            </p>
          )}
        </div>

        {/* Catégorie */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Catégorie</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`py-3 px-4 rounded-2xl text-[11px] font-bold flex items-center gap-2 transition-all border ${
                  category === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                <span>{cat.icon}</span><span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quartier */}
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Quartier</label>
          <div className="flex flex-wrap gap-2">
            {NEIGHBORHOODS.slice(0, 20).map(n => (
              <button key={n} onClick={() => setNeighborhood(n)}
                className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${
                  neighborhood === n ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-600 text-[12px] font-bold">{error}</p>
          </div>
        )}
      </div>

      {/* Footer fixe */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 z-50">
        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">
            Annuler
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-[2] py-4 rounded-2xl text-white font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#16A34A,#115E2E)' }}>
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : '✓ Enregistrer les modifications'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

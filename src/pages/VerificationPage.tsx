// src/pages/VerificationPage.tsx — Sprint 7 : Pricing 3 niveaux
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestVerificationViaWhatsApp } from '@/services/productService';
import { VERIFICATION_PRICE, PLAN_LIMITS } from '@/types';

interface VerificationPageProps { onBack: () => void; }

// ── Composants badges inline pour la table ────────────────
function BadgeSimple() {
  return (
    <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 rounded-full px-2 py-1">
      📸 Photo Réelle
    </span>
  );
}
function BadgeVerified() {
  return (
    <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-wider text-white rounded-full px-2 py-1"
      style={{ background: '#1D9BF0', boxShadow: '0 3px 8px rgba(29,155,240,0.4)' }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      Vérifié
    </span>
  );
}
function BadgePremium() {
  return (
    <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-wider rounded-full px-2 py-1"
      style={{ background: '#0F0F0F', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)', boxShadow: '0 3px 8px rgba(245,158,11,0.2)' }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Premium
    </span>
  );
}

// ── Icône check/cross ─────────────────────────────────────
function Check({ color = '#16A34A' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}
function Cross() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

const FEATURES = [
  { label: 'Badge confiance',    simple: <BadgeSimple/>,   verified: <BadgeVerified/>, premium: <BadgePremium/> },
  { label: 'Produits max',       simple: '5',               verified: '20',             premium: '∞' },
  { label: 'Chats / jour',       simple: '5 ⚠️',            verified: '∞',              premium: '∞' },
  { label: 'Visibilité',         simple: 'Normale',         verified: '+20% 🚀',        premium: 'Top page 🏆' },
  { label: 'Boutique perso',     simple: <Cross/>,          verified: <Check/>,         premium: <Check color="#F59E0B"/> },
  { label: 'Bio & réseaux',      simple: <Cross/>,          verified: <Check/>,         premium: <Check color="#F59E0B"/> },
  { label: 'Statistiques',       simple: <Cross/>,          verified: 'Basiques',       premium: 'Avancées 📊' },
  { label: 'Auto-réponse',       simple: <Cross/>,          verified: <Cross/>,         premium: <Check color="#F59E0B"/> },
];

export function VerificationPage({ onBack }: VerificationPageProps) {
  const { userProfile } = useAuth();
  const [sent, setSent] = useState(false);
  const [activeCard, setActiveCard] = useState<'simple' | 'verified' | 'premium'>('verified');

  const tier = userProfile?.isPremium ? 'premium' : userProfile?.isVerified ? 'verified' : 'simple';

  const handleRequest = () => {
    if (!userProfile) return;
    const msg = `Bonjour Brumerie ! 👋\n\nJe souhaite activer le *Badge Vérifié* avec l'offre 1er mois gratuit.\n\n👤 Nom : ${userProfile.name}\n📧 Email : ${userProfile.email}\n📱 Tel : ${userProfile.phone || 'non renseigné'}`;
    window.open(`https://wa.me/2250586867693?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  return (
    <div className="min-h-screen pb-20 font-sans" style={{ background: '#F8FAFC' }}>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 px-5 py-5 flex items-center gap-4 border-b border-slate-100">
        <button onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 active:scale-90 transition-all">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="#0F0F0F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div>
          <h1 className="font-black text-sm uppercase tracking-widest text-slate-900">Booster mon profil</h1>
          {tier !== 'simple' && (
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
              Plan actuel : {tier === 'verified' ? '🔵 Vérifié' : '⭐ Premium'}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">

        {/* Hero tagline */}
        <div className="text-center pb-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
            Vends plus,<br/>
            <span style={{ color: '#1D9BF0' }}>Gagne la confiance.</span>
          </h2>
          <p className="text-slate-400 text-[11px] font-bold mt-2">
            Les vendeurs vérifiés reçoivent <strong className="text-slate-700">3× plus de contacts</strong> en moyenne.
          </p>
        </div>

        {/* Déjà vérifié / premium */}
        {tier !== 'simple' && (
          <div className="rounded-3xl p-6 flex items-center gap-4"
            style={tier === 'premium'
              ? { background: 'linear-gradient(135deg, #0F0F0F, #1a1a1a)', border: '1px solid rgba(245,158,11,0.3)' }
              : { background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #BFDBFE' }
            }>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: tier === 'premium' ? 'rgba(245,158,11,0.15)' : 'rgba(29,155,240,0.15)' }}>
              {tier === 'premium'
                ? <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              }
            </div>
            <div>
              <p className="font-black text-[13px]" style={{ color: tier === 'premium' ? '#F59E0B' : '#1D9BF0' }}>
                {tier === 'premium' ? 'Vendeur Premium ⭐' : 'Vendeur Vérifié ✓'}
              </p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: tier === 'premium' ? '#78716C' : '#3B82F6' }}>
                Ton badge est actif et visible sur tous tes articles.
              </p>
            </div>
          </div>
        )}

        {/* ── TABLEAU DE PRICING ── */}
        <div>
          {/* En-têtes des 3 plans */}
          <div className="grid grid-cols-3 gap-2 mb-3">

            {/* SIMPLE */}
            <div className="bg-slate-100 rounded-2xl p-3 text-center relative"
              style={{ opacity: activeCard === 'simple' ? 1 : 0.7 }}>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Simple</p>
              <p className="text-lg font-black text-slate-400">0</p>
              <p className="text-[7px] text-slate-400 font-bold">FCFA/mois</p>
            </div>

            {/* VÉRIFIÉ — centre mis en avant */}
            <div className="rounded-2xl p-3 text-center relative shadow-xl -mt-2"
              style={{
                background: 'linear-gradient(135deg, #1D9BF0, #0F87DE)',
                boxShadow: '0 12px 30px rgba(29,155,240,0.4)',
              }}>
              {/* Badge RECOMMANDÉ */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[6px] font-black uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
                ⭐ Recommandé
              </div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-wider mb-2 mt-1">Vérifié</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <p className="text-xl font-black text-white">{VERIFICATION_PRICE.toLocaleString('fr-FR')}</p>
              </div>
              <p className="text-[7px] text-white/70 font-bold">FCFA/mois</p>
              <div className="mt-2 bg-white/20 rounded-full px-2 py-0.5">
                <p className="text-[7px] font-black text-white">1er mois GRATUIT</p>
              </div>
            </div>

            {/* PREMIUM */}
            <div className="rounded-2xl p-3 text-center relative"
              style={{ background: '#0F0F0F', opacity: activeCard === 'premium' ? 1 : 0.85 }}>
              <div className="absolute -top-2 right-2 bg-amber-400/20 text-amber-400 text-[6px] font-black uppercase px-1.5 py-0.5 rounded-full border border-amber-400/30">
                Bientôt
              </div>
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider mb-2">Premium</p>
              <p className="text-xl font-black text-amber-400">5 000</p>
              <p className="text-[7px] text-amber-400/50 font-bold">FCFA/mois</p>
            </div>
          </div>

          {/* Lignes de fonctionnalités */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {FEATURES.map((f, i) => (
              <div key={i}
                className={`grid grid-cols-[1fr_1.1fr_1fr] items-center gap-1 px-3 py-3 ${i !== FEATURES.length - 1 ? 'border-b border-slate-50' : ''}`}>
                {/* Label */}
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wide leading-tight">{f.label}</p>
                {/* Simple */}
                <div className="text-slate-400 text-[9px] font-bold text-center flex justify-center">
                  {typeof f.simple === 'string' ? <span>{f.simple}</span> : f.simple}
                </div>
                {/* Vérifié */}
                <div className="text-[9px] font-bold text-center flex justify-center"
                  style={{ color: '#1D9BF0' }}>
                  {typeof f.verified === 'string' ? <span>{f.verified}</span> : f.verified}
                </div>
              </div>
            ))}
          </div>

          {/* Note Premium colonne */}
          <div className="mt-2 flex items-center gap-2 px-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}/>
            <p className="text-[9px] text-slate-400 font-bold">
              La colonne Premium (5 000 FCFA/mois) arrive bientôt avec produits illimités, vidéos & analyse avancée.
            </p>
          </div>
        </div>

        {/* ── CTA principal ── */}
        {tier === 'simple' && (
          <div className="space-y-3 pt-2">

            {/* La douleur */}
            <div className="bg-amber-50 rounded-2xl px-4 py-3 flex items-start gap-3 border border-amber-100">
              <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                Avec le plan Simple, tu es limité à <strong>5 chats/jour et 5 articles</strong>.
                Un 6ème acheteur intéressé ne pourra pas te contacter.
              </p>
            </div>

            {/* Le processus */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 space-y-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comment ça marche ?</p>
              {[
                { n: '1', icon: '💬', t: 'Contact WhatsApp', d: "Tu cliques sur le bouton et tu envoies le message à notre équipe." },
                { n: '2', icon: '🪪', t: 'Envoi de la pièce d\'identité', d: "Une CNI valide suffit pour confirmer que tu es un vrai vendeur." },
                { n: '3', icon: '🎉', t: '1er mois offert !', d: `Ton badge est activé. Ensuite c'est ${VERIFICATION_PRICE.toLocaleString('fr-FR')} FCFA/mois seulement.` },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">
                    {s.icon}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{s.t}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {sent ? (
              <div className="rounded-3xl p-6 text-center" style={{ background: '#0F0F0F' }}>
                <p className="text-2xl mb-2">📱</p>
                <p className="text-white font-black uppercase text-sm">WhatsApp ouvert !</p>
                <p className="text-slate-400 text-[10px] mt-1 font-bold">Envoie le message pour activer ton mois gratuit.</p>
              </div>
            ) : (
              <button onClick={handleRequest}
                className="w-full py-5 rounded-3xl font-black uppercase tracking-widest text-[12px] text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #1D9BF0, #0F87DE)',
                  boxShadow: '0 16px 40px rgba(29,155,240,0.35)',
                }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Activer mon mois gratuit →
              </button>
            )}

            <p className="text-center text-[9px] text-slate-400 font-bold">
              Sans engagement · Annulable à tout moment
            </p>
          </div>
        )}

        {/* Plan Vérifié actif → invitation Premium */}
        {tier === 'verified' && (
          <div className="rounded-3xl p-6 border text-center space-y-3"
            style={{ background: '#0F0F0F', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(245,158,11,0.1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p className="font-black text-amber-400 uppercase tracking-widest text-[11px]">Le plan Premium arrive bientôt</p>
            <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
              Produits illimités, vidéos, auto-réponse, analyse avancée et priorité absolue dans les résultats.
            </p>
            <div className="bg-amber-400/10 rounded-2xl px-4 py-2 inline-block">
              <p className="text-amber-400 font-black text-[10px] uppercase">Tu seras notifié en premier ✓</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

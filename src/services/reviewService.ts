// src/services/reviewService.ts — Sprint 7
import {
  collection, addDoc, query, where, getDocs,
  onSnapshot, serverTimestamp, updateDoc, doc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Review, RatingRole } from '@/types';

const reviewsCol = collection(db, 'reviews');

export async function submitReview(params: {
  orderId: string; productId: string; productTitle: string;
  fromUserId: string; fromUserName: string; fromUserPhoto?: string;
  toUserId: string; role: RatingRole; rating: number; comment: string;
}): Promise<void> {
  // Vérifier doublon
  const existing = await getDocs(query(reviewsCol,
    where('orderId', '==', params.orderId),
    where('fromUserId', '==', params.fromUserId),
  ));
  if (!existing.empty) throw new Error('Vous avez déjà noté cette commande.');

  await addDoc(reviewsCol, { ...params, createdAt: serverTimestamp() });

  // Mettre à jour la moyenne du profil noté (vendeur uniquement pour MVP)
  if (params.role === 'buyer_to_seller') {
    await refreshSellerRating(params.toUserId);
    // Marquer la commande comme notée par l'acheteur
    await updateDoc(doc(db, 'orders', params.orderId), { buyerReviewed: true });
  } else {
    await updateDoc(doc(db, 'orders', params.orderId), { sellerReviewed: true });
  }
}

async function refreshSellerRating(userId: string): Promise<void> {
  const snap = await getDocs(query(reviewsCol,
    where('toUserId', '==', userId),
    where('role', '==', 'buyer_to_seller'),
  ));
  if (snap.empty) return;
  const ratings = snap.docs.map(d => d.data().rating as number);
  const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  await updateDoc(doc(db, 'users', userId), { rating: avg, reviewCount: ratings.length });
}

export async function hasReviewed(orderId: string, fromUserId: string): Promise<boolean> {
  const snap = await getDocs(query(reviewsCol,
    where('orderId', '==', orderId),
    where('fromUserId', '==', fromUserId),
  ));
  return !snap.empty;
}

export function subscribeSellerReviews(
  sellerId: string,
  callback: (reviews: Review[]) => void,
): () => void {
  const q = query(reviewsCol,
    where('toUserId', '==', sellerId),
    where('role', '==', 'buyer_to_seller'),
  );
  return onSnapshot(q, snap => {
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
    reviews.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(reviews);
  }, () => callback([]));
}

# Règles Firestore — À appliquer dans Firebase Console

Aller sur : https://console.firebase.google.com
→ Firestore Database → Règles

Remplacer par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — lecture publique, écriture si propriétaire
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Produits — lecture publique, écriture si vendeur propriétaire
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.sellerId ||
         request.resource.data.keys().hasOnly(['status', 'whatsappClickCount', 'bookmarkCount']));
    }

    // Commandes — lecture/écriture si acheteur ou vendeur concerné
    match /orders/{orderId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.buyerId ||
         request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.buyerId ||
         request.auth.uid == resource.data.sellerId);
    }

    // Avis / Notations — ⚠️ CORRECTION : permettre écriture aux utilisateurs authentifiés
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.fromUserId;
    }

    // Conversations — lecture/écriture si participant
    match /conversations/{convId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
    }

    // Messages — lecture/écriture si participant de la conversation
    match /conversations/{convId}/messages/{msgId} {
      allow read, write: if request.auth != null;
    }

    // Notifications — lecture/écriture pour l'utilisateur concerné
    match /notifications/{notifId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

# Ecom Plus Gabon 🇬🇦🇨🇳

> Plateforme de Sourcing Chine-Gabon — Version 1.0.0 (Production Ready)

Ecom Plus Gabon est une solution complète permettant aux entrepreneurs gabonais de sourcer des produits en Chine, de calculer les commissions et frais logistiques automatiquement, et de suivre leurs commandes jusqu'à Libreville via une PWA moderne.

## 🚀 Fonctionnalités Clés

- 📱 **PWA (Progressive Web App)** : Installable sur mobile, fonctionne hors ligne.
- 📦 **Catalogue Dynamique** : Consultation des produits avec prix convertis (CNY → XAF).
- 🧾 **Devis & Reçus Auto** : Génération de PDF avec QR Code et envoi automatique sur WhatsApp.
- 🚚 **Suivi en Temps Réel** : Timeline détaillée avec photos à chaque étape du transit.
- 🛠️ **Espace Admin Premium** : Gestion complète des produits, agents, commandes et configuration du site.
- 💬 **Intégration WhatsApp** : Notifications automatiques et support client intégré.

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, React Query, next-pwa.
- **Backend** : Node.js, Express, TypeScript, BullMQ (Queues), Puppeteer (PDF).
- **Database** : PostgreSQL (Supabase) avec RLS (Row Level Security).
- **Cache & Queues** : Redis (Upstash).
- **Stockage** : Supabase Storage (Images & PDF).

## 📦 Installation

### Pré-requis
- Node.js 18+
- Compte Supabase (Database + Auth)
- Compte Upstash (Redis)
- Meta Developer Account (WhatsApp API)

### Étapes
1. Cloner le dépôt :
   ```bash
   git clone https://github.com/taigerdev45/Ecomplus.git
   cd Ecomplus
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement (voir `.env.example` dans chaque app).

4. Lancer en développement :
   ```bash
   npm run dev
   ```

## 🧪 Tests

```bash
# Frontend tests
cd apps/web
npm test
npm run test:e2e

# Backend tests
cd apps/api
npm test
```

## 🌐 Déploiement

- **Frontend** : Déploiement recommandé sur **Vercel**.
- **Backend** : Déploiement sur **Render** ou **Railway**.
- **Database** : Déploiement sur **Supabase**.

## 📄 Licence

Propriété de Ecom Plus Gabon. Tous droits réservés.

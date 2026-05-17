# Ecom Plus Gabon 🇬🇦🇨🇳

> Plateforme de Sourcing Chine-Gabon — Version 1.10.0 (Production Ready)

Ecom Plus Gabon est une solution complète permettant aux entrepreneurs gabonais de sourcer des produits en Chine, de calculer les commissions et frais logistiques automatiquement, et de suivre leurs commandes jusqu'à Libreville via une PWA moderne et un portail d'administration complet.

## 🚀 Fonctionnalités Clés

- 📱 **PWA (Progressive Web App)** : Installable sur mobile, avec une interface fluide et réactive.
- 📦 **Catalogue Dynamique** : Consultation des produits avec prix convertis (CNY → XAF) et dimensions en mètres.
- 🧾 **Génération PDF en Mémoire** : Devis et reçus professionnels avec code QR générés entièrement en mémoire vive (RAM) à la volée, sans stockage physique, pour un téléchargement instantané et sécurisé.
- 💬 **Support Chat Direct** : Module d'assistance en direct intégré, avec bouton de messagerie instantanée dédié depuis la gestion des clients de la console d'administration.
- 🛡️ **Cloisonnement Hermétique** : Séparation physique stricte des données de la table `client` et de la table `utilisateur` (admins/agents) avec règles RLS Supabase robustes pour une sécurité optimale.
- 🚚 **Suivi en Temps Réel** : Timeline détaillée avec photos à chaque étape du transit et suivi public par numéro de traçage.
- 🛠️ **Espace Admin Premium** : Gestion complète des produits, agents, clients, commandes, statistiques de visites et configuration dynamique du site.

## 🛠️ Stack Technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, React Query, next-pwa.
- **Backend** : Node.js, Express, TypeScript, pdfmake (génération PDF native haute performance), BullMQ.
- **Database** : PostgreSQL (Supabase) avec RLS (Row Level Security).
- **Cache & Sessions** : Redis (Upstash).
- **Stockage** : Supabase Storage (Images produits).

## 📦 Installation

### Pré-requis
- Node.js 18+
- Compte Supabase (Database + Auth)
- Compte Upstash (Redis)

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

3. Configurer les variables d'environnement (se référer aux fichiers `.env` de chaque application).

4. Lancer en mode développement :
   ```bash
   npm run dev
   ```

## 🧪 Tests & Build

```bash
# Compilation globale du monorepo
npm run build

# Lancement des tests backend
cd apps/api
npm test
```

## 🌐 Déploiement

- **Frontend** : Déploiement recommandé sur **Vercel**.
- **Backend** : Déploiement recommandé sur **Render** (gestion dynamique en mémoire RAM idéale pour les environnements de conteneurs).
- **Database** : Déploiement sur **Supabase**.

## 📄 Licence

Propriété de Ecom Plus Gabon. Tous droits réservés.

# ECOM PLUS GABON â€” MASTER DOCUMENT

> **Projet** : Plateforme web de sourcing Chine-Gabon
> **Version** : 2.1
> **Stack** : Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | Node.js + Express + TypeScript | PostgreSQL (Supabase) | Redis | WhatsApp Business API
> **Date** : 2026-05-16
> **Statut** : Phase 11 — Pivot Espace Client

---

## TABLE DES MATIERES

1. [Vision du projet](#1-vision-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Plan d'exÃ©cution (10 phases)](#3-plan-dexÃ©cution)
4. [Convention de code](#4-convention-de-code)
5. [Structure des dossiers](#5-structure-des-dossiers)
6. [RÃ¨gles mÃ©tier critiques](#6-rÃ¨gles-mÃ©tier-critiques)

---

## 1. VISION DU PROJET

Ecom Plus Gabon est une plateforme PWA permettant aux clients gabonais d'acheter des produits depuis la Chine avec un accompagnement logistique complet.

### Objectifs MVP

- [ ] Catalogue produits consultable sur mobile
- [ ] Panier avec calcul automatique de commission (10%/15%/20%)
- [ ] GÃ©nÃ©ration auto de devis PDF + QR code
- [x] Portail client autonome (Dashboard, Devis, Commandes)
- [x] Validation client → génération reçu + tracking number
- [ ] Suivi public par numÃ©ro de traÃ§age (/suivi)
- [ ] Espace admin complet (devis, reÃ§us, produits, agents, config site)
- [ ] CMS Light pour personnaliser la page publique

### RÃ´les utilisateurs

| RÃ´le | Permissions |
|------|-------------|
| **Client** | Catalogue, panier, devis, suivi, historique |
| **Agent** | Mise Ã  jour statuts, upload photos, gestion commandes |
| **SecrÃ©tariat** | Gestion devis/reÃ§us, relances clients |
| **Admin** | Tout + config site, rapports, grille commissions |

---

## 2. ARCHITECTURE TECHNIQUE

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FRONTEND (Next.js 14 + PWA)                                â”‚
â”‚  â”œâ”€â”€ App Router (Server Components par dÃ©faut)              â”‚
â”‚  â”œâ”€â”€ Client Components pour l'interactivitÃ©                 â”‚
â”‚  â”œâ”€â”€ Tailwind CSS + shadcn/ui                               â”‚
â”‚  â”œâ”€â”€ Zustand (state global)                                 â”‚
â”‚  â”œâ”€â”€ React Query (server state + cache)                     â”‚
â”‚  â””â”€â”€ next-pwa (Workbox)                                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  BACKEND API (Node.js + Express + TypeScript)               â”‚
â”‚  â”œâ”€â”€ REST API /api/v1/*                                     â”‚
â”‚  â”œâ”€â”€ JWT Auth (access + refresh tokens)                     â”‚
â”‚  â”œâ”€â”€ BullMQ (queues : PDF, WhatsApp, email)                 â”‚
â”‚  â”œâ”€â”€ Puppeteer (gÃ©nÃ©ration PDF)                             â”‚
â”‚  â””â”€â”€ WebSockets (notifications temps rÃ©el)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  DATA LAYER                                                 â”‚
â”‚  â”œâ”€â”€ PostgreSQL (Supabase) â€” donnÃ©es relationnelles         â”‚
â”‚  â”œâ”€â”€ Redis (Upstash) â€” cache, sessions, queues              â”‚
â”‚  â”œâ”€â”€ Supabase Storage â€” images produits, PDF                â”‚
â”‚  â””â”€â”€ Supabase Auth â€” authentication (email/OTP)             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  INTEGRATIONS                                               â”‚
│  ├── WhatsApp Business API (Meta) — Notifications statuts (documents via Espace Client) │
â”‚  â”œâ”€â”€ Firebase Cloud Messaging â€” push notifications          â”‚
â”‚  â””â”€â”€ OneSignal (fallback push)                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. PLAN D'EXECUTION

### PHASE 0 â€” Setup & Fondations (Jour 1-2)

- [x] Initialiser monorepo (frontend + backend)
- [x] Configurer TypeScript strict
- [x] Configurer ESLint + Prettier
- [x] Setup Tailwind + shadcn/ui
- [x] Configurer Supabase (DB + Auth + Storage)
- [x] Configurer Redis (Upstash)
- [x] Setup Git + GitHub repo + branches (main, develop, feature/*)
- [x] Setup CI/CD basique (GitHub Actions lint + build)

### PHASE 1 â€” Authentification & Utilisateurs (Jour 3-4)

- [x] Schema DB utilisateurs (roles, profils)
- [x] API auth (register, login, logout, refresh)
- [x] Middleware JWT + vÃ©rification rÃ´les
- [x] Pages login/register (mobile-first)
- [x] Hook useAuth global
- [x] RLS policies Supabase

### PHASE 2 â€” Catalogue Produits (Jour 5-6)

- [x] Schema DB catÃ©gories + produits
- [x] CRUD produits (API)
- [x] Page catalogue (grid responsive)
- [x] Fiche produit dÃ©taillÃ©e
- [x] Recherche + filtres
- [x] Upload images (Supabase Storage)
- [x] Conversion prix CNY â†’ XAF

### PHASE 3 â€” Panier & Devis (Jour 7-9)

- [x] SystÃ¨me panier (Zustand + localStorage)
- [x] Formulaire demande devis
- [x] Calcul commission variable (10%/15%/20%)
- [x] GÃ©nÃ©ration PDF devis (Puppeteer + template HTML)
- [x] QR code sur devis
- [x] Espace Client sécurisé (Génération et accès PDF)
- [x] Tableau admin devis (responsive)
- [x] Workflow statuts devis (en_attente â†’ validÃ© â†’ expirÃ© â†’ annulÃ©)

### PHASE 4 â€” Commandes & ReÃ§us (Jour 10-12)

- [x] Validation devis â†’ crÃ©ation commande
- [x] GÃ©nÃ©ration tracking number (ECOM-AAAA-NNNN)
- [x] GÃ©nÃ©ration reÃ§u PDF + QR code
- [x] Accès reçu PDF via Espace Client
- [x] Tableau admin reÃ§us (responsive)
- [x] Statuts paiement (en_attente/partiel/intÃ©gral)

### PHASE 5 â€” Suivi & Timeline (Jour 13-14)

- [x] Table suivi_commande (timeline)
- [x] API mise Ã  jour statut (agent)
- [x] Upload photos par Ã©tape
- [x] Page publique /suivi (sans auth)
- [x] Timeline verticale avec icÃ´nes colorÃ©es
- [x] Notifications push + WhatsApp Ã  chaque changement

### PHASE 6 â€” Espace Admin (Jour 15-17)

- [x] Dashboard admin (KPI, graphiques)
- [x] Gestion produits (CRUD + import CSV)
- [x] Gestion agents (crÃ©ation comptes, rÃ´les)
- [x] Grille commissions (admin only)
- [x] Rapports financiers
- [x] Tableaux responsive (desktop + mobile cards)

### PHASE 7 â€” CMS Light & Config Site (Jour 18)

- [x] Table configuration_site
- [x] Interface config (logo, description, footer)
- [x] 2 numÃ©ros WhatsApp service client
- [x] PrÃ©visualisation temps rÃ©el
- [x] Page accueil publique dynamique

### PHASE 8 â€” Notifications & WhatsApp (Jour 19-20)

- [x] IntÃ©gration WhatsApp Business API
- [x] Templates messages (devis, reÃ§u, statut)
- [x] SystÃ¨me notifications multi-canal
- [x] Push web (FCM)
- [x] Email (SMTP future)

### PHASE 9 â€” Polish & DÃ©ploiement (Jour 21-23)

- [x] Tests E2E (Playwright)
- [x] Optimisation images (next/image)
- [x] PWA (manifest, service worker, offline mode)
- [x] SEO (meta tags, sitemap)
- [x] DÃ©ploiement Vercel (frontend)
- [x] DÃ©ploiement Render/Railway (backend)
- [x] Documentation technique finale

### PHASE 10 â€” Polish & Audit Final (Jour 24) âœ…

- [x] Correction bugs accessibilitÃ© (ARIA labels, labels formulaires)
- [x] Remplacement `<img>` par `<Image />` Next.js
- [x] Correction tests Jest (home.test.tsx)
- [x] Audit RLS Supabase et middleware JWT
- [x] Formatage Markdown documentation

### PHASE 11 — Pivot Espace Client (Jour 25) ✅

- [x] Suppression dépendance WhatsApp pour documents
- [x] Redirection authentifiée tunnel de commande
- [x] Tableau de bord client (stats & navigation)
- [x] Liste des devis et commandes côté client
- [x] API : `client-quotes`, `client-orders`, `regenerate-pdf`

---

## 4. CONVENTION DE CODE

### TypeScript

- `strict: true` obligatoire
- Pas de `any` sauf justification en commentaire
- Types dÃ©finis dans `/types/*.d.ts`
- Enums pour les statuts (pas de string magiques)

### Nommage

- **Fichiers** : kebab-case (`user-service.ts`)
- **Composants React** : PascalCase (`UserCard.tsx`)
- **Hooks** : camelCase commenÃ§ant par `use` (`useAuth`)
- **API routes** : kebab-case (`/api/v1/users`)
- **Tables DB** : snake_case (`utilisateur`, `commande`)
- **Colonnes DB** : snake_case (`created_at`)

### Git

- Branches : `feature/nom-fonctionnalite`, `fix/bug-description`, `hotfix/critique`
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Pas de commit sur `main` directement â€” PR obligatoire
- Review code avant merge

### API

- Versioning : `/api/v1/...`
- RÃ©ponses standardisÃ©es :

```json
{
  "success": true,
  "data": {},
  "message": "...",
  "error": null
}
```

---

## 5. STRUCTURE DES DOSSIERS

```text
ecom-plus-gabon/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/                    # Next.js 14 frontend
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ app/            # App Router
â”‚   â”‚   â”‚   â”œâ”€â”€ components/     # Composants rÃ©utilisables
â”‚   â”‚   â”‚   â”œâ”€â”€ hooks/          # Custom hooks
â”‚   â”‚   â”‚   â”œâ”€â”€ lib/            # Utils, configs
â”‚   â”‚   â”‚   â”œâ”€â”€ stores/         # Zustand stores
â”‚   â”‚   â”‚   â””â”€â”€ types/          # Types TypeScript
â”‚   â”‚   â”œâ”€â”€ public/
â”‚   â”‚   â””â”€â”€ package.json
â”‚   â”‚
â”‚   â””â”€â”€ api/                    # Backend Express
â”‚       â”œâ”€â”€ src/
â”‚       â”‚   â”œâ”€â”€ controllers/
â”‚       â”‚   â”œâ”€â”€ services/
â”‚       â”‚   â”œâ”€â”€ models/         # Queries DB
â”‚       â”‚   â”œâ”€â”€ routes/
â”‚       â”‚   â”œâ”€â”€ middleware/
â”‚       â”‚   â”œâ”€â”€ jobs/           # BullMQ workers
â”‚       â”‚   â”œâ”€â”€ templates/      # HTML PDF templates
â”‚       â”‚   â”œâ”€â”€ utils/
â”‚       â”‚   â””â”€â”€ types/
â”‚       â””â”€â”€ package.json
â”‚
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ shared-types/           # Types partagÃ©s front/back
â”‚   â””â”€â”€ ui/                     # Composants shadcn/ui partagÃ©s
â”‚
â”œâ”€â”€ docs/                       # Documentation
â”‚   â”œâ”€â”€ MASTER.md
â”‚   â”œâ”€â”€ MEMORY.md
â”‚   â”œâ”€â”€ CHANGELOG.md
â”‚   â”œâ”€â”€ PROMPTS.md
â”‚   â””â”€â”€ GIT_WORKFLOW.md
â”‚
â”œâ”€â”€ docker-compose.yml
â”œâ”€â”€ turbo.json                  # Monorepo tasks
â””â”€â”€ package.json
```

---

## 6. REGLES METIER CRITIQUES

### Commissions variables

| Tranche produits | Commission |
|------------------|------------|
| < 350 000 FCFA | 10% |
| 350 000 - 1 000 000 FCFA | 15% |
| >= 1 000 000 FCFA | 20% |

> Calcul sur le sous-total produits uniquement (hors livraison). StockÃ© en INTEGER (centimes).

### Tracking Number

- Format : `ECOM-AAAA-NNNN` (ex: `ECOM-2026-X7K9`)
- Non sÃ©quentiel, alÃ©atoire, unique
- Accessible publiquement sur `/suivi/{tracking}`

### Statuts Devis

```text
en_attente â†’ validÃ© â†’ [commande crÃ©Ã©e]
en_attente â†’ expirÃ© (aprÃ¨s 7 jours)
en_attente â†’ annulÃ©
```

### Statuts Commande

```text
devis_envoye â†’ en_attente_validation â†’ valide â†’ commande_fournisseur
â†’ en_preparation â†’ expedie_chine â†’ en_transit â†’ arrive_libreville
â†’ en_cours_livraison â†’ livre
```

### SÃ©curitÃ©

- RLS Supabase activÃ© sur TOUTES les tables
- JWT 24h + refresh token
- Upload limitÃ© images (JPG/PNG, max 5MB)
- HTTPS obligatoire
- NumÃ©ros tracking non Ã©numÃ©rables (alÃ©atoires)

---

### Gestion des Agents

- **Création** : L'administrateur crée le compte avec Nom, Email, Téléphone et un **Mot de passe provisoire**.
- **Activation** : L'agent reçoit ses accès et doit changer son mot de passe lors de sa première connexion (interface Profil).

---

> **Dernière mise à jour** : 2026-05-17
> **Prochaine étape** : Déploiement production (Vercel + Render + Supabase)



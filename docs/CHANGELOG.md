# ECOM PLUS GABON — CHANGELOG

> **Format** : [Conventional Commits](https://www.conventionalcommits.org/)
> **Date format** : YYYY-MM-DD

---

## [Unreleased]

### CHANGELOG - ECOM PLUS GABON

### [1.2.0] - Pivot Espace Client & Sécurisation

### Added
- Nouveau layout client (`apps/web/src/app/client/layout.tsx`) avec barre latérale (Tableau de bord, Devis, Commandes).
- Page `/client/dashboard` : Vue d'ensemble des statistiques client (devis en attente, commandes en cours, total achats).
- Page `/client/quotes` : Historique des devis et possibilité de régénérer le PDF à la volée.
- Page `/client/orders` : Suivi des commandes avec redirection vers le tracking public.
- API : Nouveaux endpoints `GET /api/v1/orders/client-quotes` et `GET /api/v1/orders/client-orders`.
- API : Nouvel endpoint `POST /api/v1/orders/quotes/:id/regenerate-pdf` pour la création de PDF à la demande.

### Changed
- **BREAKING CHANGE** : La demande de devis dans le panier exige désormais d'être authentifié (`useAuth`).
- Le champ WhatsApp a été entièrement supprimé du tunnel de commande client.
- `pdf.queue.ts` ne déclenche plus l'envoi de messages via WhatsApp Business API pour les documents générés.
- Redirection post-demande de devis modifiée vers l'espace client au lieu de la page statique de succès.

---

### [1.1.0] - Polish & Audit Final [COMPLET ✅]

#### 2026-05-16

- `fix(a11y):` Correction accessibilité — ajout `aria-label` sur tous les boutons icône dans `admin/products`, `admin/agents`, `admin/quotes`, `admin/receipts`, `agent/orders`, `AdminLayout` et `PDFPreview`
- `fix(a11y):` Correction accessibilité — ajout `label`+`htmlFor` sur les inputs de recherche et formulaires (quotes, receipts, agent/orders, creation agent)
- `perf(image):` Migration `<img>` → `<Image />` Next.js dans `admin/products/page.tsx` (produits), `admin/agents/page.tsx` (avatars) et `AdminLayout.tsx` (avatar header)
- `fix(security):` Ajout `placehold.co` et `ui-avatars.com` dans `img-src` du CSP (`next.config.js`)
- `test:` Correction `home.test.tsx` — mocks `next/link` + `next/image`, `beforeEach`/`afterEach` fetch mock, rendus `act()` async
- `fix(ts):` Suppression `any` dans `admin/quotes` — typage strict `QuoteStatus`, `Record<QuoteStatus, ...>`, interface `QuoteRow`
- `docs:` Reformatage complet `docs/MASTER.md` (MD022, MD032, MD040 — lignes vides, blocs code avec langage)
- `docs:` Mise à jour `MEMORY.md` — Phase 10 marquée COMPLETE, prochaine étape = déploiement
- `chore(audit):` Vérification RLS Supabase (toutes tables) + Middleware JWT (cookie httpOnly + bearer, checkRole)

---

### v1.0.0 (2026-05-13) — Production Release

#### 🚀 Nouveautés
- `feat(security):` Audit complet et durcissement (Helmet, HPP, Rate Limiting, CSP)
- `feat(security):` Vérification des signatures Meta pour le Webhook WhatsApp
- `feat(perf):` Compression Gzip backend et optimisation `next/image` frontend
- `feat(pdf):` Refonte des templates PDF (Transparent commission + Conditions)
- `feat(web):` Page de succès après commande avec preview PDF et page de validation par QR Code
- `chore: release v1.0.0`
- `docs:` Documentation complète (Guide Admin, Déploiement)
- `chore:` Transformation en PWA avec `next-pwa` et mode hors ligne
- `chore:` Optimisation SEO (Metadata API, sitemap, robots.txt)
- `feat(cms):` Table `configuration_site` et API CRUD (GET/PUT/POST logo)
- `feat(cms):` Interface d'administration `/admin/config` (Premium UI + Upload + Preview)
- `feat(web):` Page d'accueil avec 4 services (Sourcing, Livraison, Devis, Suivi)
- `feat(web):` Page de destination `/suivi` pour le tracking public
- `feat(web):` Intégration dynamique globale (Logo, Footer, WhatsApp)

### Phase 7 — Espace Admin Complet [COMPLET]

#### 2026-05-13

- `feat(admin):` Dashboard analytique avec graphiques Recharts (Chiffre d'affaires, Commandes)
- `feat(admin):` Gestion avancée des devis avec filtres et actions rapides
- `feat(admin):` Système de gestion des agents et commissions
- `feat(admin):` Rapports exportables et suivi des performances

### Phase 6 — Workflow Commandes & Suivi Timeline [COMPLET]

#### 2026-05-13

- `feat(orders):` Implémentation du cycle de vie complet : Devis → Validation → Livraison
- `feat(orders):` Génération automatique de numéros de tracking (`ECOM-YYYY-XXXX`)
- `feat(orders):` Page publique `/suivi` avec timeline interactive et photos
- `feat(agent):` Dashboard pour mise à jour des statuts et upload de preuves

### Phase 5 — Envoi WhatsApp Automatisé [COMPLET]

#### 2026-05-13

- `feat(whatsapp):` Intégration API Cloud de Meta et fallback wa.me
- `feat(whatsapp):` Workers BullMQ pour l'envoi asynchrone des notifications

### Phase 4 — Génération PDF & QR Code [COMPLET]

#### 2026-05-13

- `feat(pdf):` Service de génération de devis PDF avec Puppeteer
- `feat(pdf):` Intégration de QR codes dynamiques pointant vers le suivi
- `feat(storage):` Stockage sécurisé des documents sur Supabase Storage

### Phase 3 — Panier & Commission [COMPLET]

#### 2026-05-13

- `feat(cart):` Panier persistant (Zustand) et calcul automatique des commissions (10, 15, 20%)
- `feat(cart):` Calcul des frais de port selon le mode (Air/Mer)

### Phase 2 — Catalogue Produits [COMPLET]

#### 2026-05-13

- `feat(products):` Catalogue public avec filtres, recherche et conversion CNY/XAF
- `feat(products):` CRUD Admin avec upload d'images



### Phase 1 — Authentification [COMPLET]

#### 2026-05-13

- `feat(auth):` Système complet avec JWT et Cookies HttpOnly
- `feat(auth):` Middleware de rôles et protection des routes

### Phase 0 — Setup & Fondations [COMPLET]

#### 2026-05-12

- `chore:` Initialisation du monorepo Turbo
- `chore:` Configuration Next.js 14, Express, TypeScript strict

---

## Format de commit

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` — Nouvelle fonctionnalité
- `fix:` — Correction de bug
- `docs:` — Documentation
- `style:` — Formatage (pas de changement de code)
- `refactor:` — Refactoring
- `perf:` — Performance
- `test:` — Tests
- `chore:` — Tâches diverses (build, deps, etc.)

### Scopes

- `auth` — Authentification
- `api` — Backend API
- `web` — Frontend
- `db` — Base de données
- `admin` — Espace admin
- `whatsapp` — Intégration WhatsApp
- `pdf` — Génération PDF
- `config` — Configuration

---

## Exemples

```
feat(auth): add JWT refresh token rotation

fix(api): correct commission calculation for edge case 350000

docs(README): update deployment instructions

refactor(db): optimize order query with index

test(api): add unit tests for commission service
```

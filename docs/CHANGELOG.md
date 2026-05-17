# ECOM PLUS GABON — CHANGELOG

> **Format** : [Conventional Commits](https://www.conventionalcommits.org/)
> **Date format** : YYYY-MM-DD

---

## [Unreleased]

---

### [1.7.0] - Règles de Transport Dynamiques, Configurations Financières Admin & Sécurisation de Production

#### Added
- Implémentation des règles dynamiques de calcul des estimations de livraison :
  - **Aérien Normal** : 10 000 FCFA / KG (Durée : 7-15 jours).
  - **Aérien Express** : 15 000 FCFA / KG (Durée : 4-5 jours).
  - **Maritime CBM** : Volume en mètres cubes `(longueur * largeur * hauteur) / 1 000 000 * Tarif CBM`.
- Création d'une interface d'administration financière dans `/admin/config` permettant d'ajuster dynamiquement le taux de change CNY en XAF (`TAUX_CHANGE_CNY_XAF`) et le tarif maritime CBM (`TARIF_CBM_XAF`).
- Ajout de la gestion des dimensions optionnelles (`longueur_cm`, `largeur_cm`, `hauteur_cm`) dans les schémas Zod, l'API backend, et l'interface utilisateur de création et modification de produits dans l'espace admin `/admin/products`.
- Refonte visuelle de la sélection du mode de transport dans le panier utilisateur `/panier` avec l'intégration d'icônes descriptives (`Plane`, `Zap`, `Ship`), d'une mise en page en 3 colonnes et d'un bandeau jaune d'avertissement légal sur le caractère estimatif des frais.

#### Changed
- Harmonisation locale : correction du port par défaut de l'URL d'API de secours dans `apps/web/src/lib/axios.ts` à 4000 (au lieu de 5000) pour correspondre au port par défaut configuré sur le backend Node/Express.

#### Security
- Suppression définitive de tous les scripts temporaires scratch contenant des identifiants et clés de base de données en clair pour éliminer tout risque de fuite de données avant le déploiement en production.
- Création d'un guide de déploiement premium complet pour Render (Backend API) et Vercel (Frontend Next.js) dans `docs/DEPLOYMENT_GUIDE.md` détaillant les variables d'environnement, les commandes Turborepo de build et les bonnes pratiques de sécurité.

---

### [1.6.0] - Intégration identité visuelle Ecom Plus & Résolution CRUD Produits

#### Added
- Intégration d'une modale d'ajout de produit complète dans l'espace administrateur (`/admin/products`) incluant les catégories, prix, poids, stock et liens fournisseurs.
- Gestion robuste de l'upload multiple d'images (jusqu'à 4 images) sélectionnables d'un coup ou consécutivement (1 par 1) optimisée pour supports mobiles et PC.

#### Changed
- Uniformisation monétaire : transition globale vers le Franc CFA (FCFA) comme devise de référence sur les fiches produits, page détails, panier d'achat et dashboard admin.
- Conversion automatique transparente du prix FCFA saisi en CNY centimes en arrière-plan selon le taux de change dynamique de la plateforme.

#### Fixed
- Correction de l'erreur `400 Bad Request` sur l'aperçu du devis (`/orders/quote-preview`) en scindant les schémas de validation (nouveau `quotePreviewSchema` sans obligation de fournir un numéro WhatsApp).
- Correction de l'erreur `400 Bad Request` à la création/mise à jour de produits en convertissant explicitement les chaînes envoyées par FormData en types numériques avant la validation Zod côté API.
- Résolution des erreurs de validation ESLint (apostrophes et syntaxe dans l'espace Admin).

---

### [1.5.0] - Statistiques Analytiques Admin & Visibilité de Sécurité

#### Added
- Architecture de tracking temps-réel avec tables SQL de suivi `visite` (pages vues globales, IP, User Agents) et `connexion_log` (logins/inscriptions journalières des clients).
- Endpoints analytiques `/admin/dashboard-stats` (KPIs, visites 30j, connexions 30j) et `/admin/reports-stats` (Cohortes d'onboarding, préférences transit/méthode logistique, taux de commissions moyens, top produits).
- Tableaux de bord interactifs et graphiques avec Recharts sur le Dashboard Admin (`/admin`) et l'interface d'Analyses Avancées (`/admin/reports`).
- Option d'exportation instantanée du rapport analytique de la plateforme au format CSV.
- Boutons d'activation de visibilité (oeil pour afficher/masquer) sur tous les champs de saisie et confirmation de mot de passe (Formulaire de Connexion `/login`, Inscription `/register`, et sécurité du Profil Client `/client/profil`).

---

### [1.4.0] - Espace Client Premium & Améliorations de Navigation

#### Added
- Barre d'entête mobile sticky (Mobile Top Bar) dans le Portail Client (`layout.tsx`) affichant l'identité, le nom de l'utilisateur et un raccourci de déconnexion rapide.
- Option de déconnexion explicite à la fin du défilement horizontal de la barre de navigation sur mobile.
- Redirection automatique vers la page d'accueil (`/`) lors de la déconnexion, depuis l'Espace Client comme depuis la barre de navigation globale.

#### Fixed
- Correction des requêtes Axios de l'espace client (dashboard, quotes, orders, profil) en supprimant le préfixe `/api/v1` doublé pour éviter les erreurs 404 (Not Found).
- Résolution des problèmes d'accessibilité (labels reliés aux inputs) dans le formulaire de modification de profil client.

---

### [1.3.0] - Optimisation Stockage & Fixes

#### Added
- Implémentation du hachage SHA-256 des images d'origine dans `upload.service.ts` pour dédupliquer les fichiers stockés.
- Service de purge automatique des documents PDF (`cleanup.service.ts`) planifié toutes les 24h pour nettoyer les fichiers de plus de 7 jours sur Supabase Storage.
- Intégration du scheduler de nettoyage dans l'index du serveur API.

#### Changed
- Compression d'images WebP optimisée via Sharp : Qualité réduite à 75 (principale) / 65 (miniature) avec effort de compression maximal (`effort: 6`).
- Cache-Control des images augmenté à `31536000` (1 an) pour optimiser les performances de cache.

#### Fixed
- Correction du bug de disparition de la barre latérale sur l'espace admin lors de la navigation vers la gestion des commandes (`agent/orders/page.tsx`) en la wrappant proprement dans `AdminLayout`.
- Correction de l'erreur TypeScript de type `unknown` dans le Tableau de Bord client.
- Correction d'une erreur de parsing syntaxique JSX/TSX dans les mocks des tests unitaires Jest (`home.test.tsx`).

---

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

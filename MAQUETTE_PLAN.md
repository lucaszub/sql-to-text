# Plan Maquette — SQL-to-Text POC (Snowflake)

## Objectif du POC
Démontrer qu'un utilisateur non-technique peut interroger Snowflake en langage naturel,
visualiser les résultats de façon professionnelle, et explorer les données sans écrire une seule ligne de SQL.

---

## Stack technique envisagée
- **Frontend** : Next.js + Tailwind CSS + shadcn/ui
- **Backend** : API Route Next.js (ou FastAPI)
- **LLM** : Claude API (text → SQL)
- **Données** : Snowflake avec dataset open/mock (ex. TPC-H, NYC Taxi, ou données e-commerce fictives)

---

## Architecture globale de l'interface

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixe)  │         ZONE PRINCIPALE                  │
│                  │  ┌──────────────────────────────────┐    │
│  Logo            │  │  HEADER : titre + connexion DB   │    │
│  ─────           │  └──────────────────────────────────┘    │
│  Dashboard       │                                           │
│  Explorer        │  ┌──────────┐  ┌───────────────────┐    │
│  Historique      │  │  CHAT    │  │  RÉSULTATS / TABLE│    │
│  Schéma DB       │  │  PANEL   │  │  PANEL            │    │
│  ─────           │  └──────────┘  └───────────────────┘    │
│  Settings        │                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Pages / Vues

### 1. Page d'accueil — "Home / Welcome"
> Style inspiré de **image1.png** (glassmorphism, gradient doux, message d'accueil)

**Contenu :**
- Message de bienvenue personnalisé : _"Bonjour, prêt à explorer vos données ?"_
- Sous-titre : _"Posez une question en français ou en anglais, obtenez une réponse instantanée."_
- **3 cards d'actions rapides** avec icônes :
  - "Explorer les ventes" → lance une query exemple
  - "Analyser les tendances" → lance une query exemple
  - "Comparer les périodes" → lance une query exemple
- **Barre d'input chat** en bas (grand, arrondi, avec icône envoi)
  - Placeholder : _"Ex: Quelles sont les 10 meilleures ventes du mois dernier ?"_
- **Badges de contexte** sous l'input : `🏔️ Snowflake connecté` · `📊 Dataset: E-Commerce Demo` · `🤖 Powered by Claude`

---

### 2. Vue principale — "Explorer"
> Layout split : **Chat à gauche** + **Résultats à droite**
> Style hybride **image1.png** (chat) + **image.png** (table)

#### 2a. Panel Chat (gauche, ~40%)
- **Historique de conversation** scrollable :
  - Bulles utilisateur (droite, fond sombre)
  - Bulles assistant (gauche, fond clair) avec :
    - La réponse en langage naturel
    - Un bloc SQL collapsible (syntaxe colorée)
    - Un lien "_Voir les résultats →_"
- **Input** fixe en bas :
  - Champ texte large
  - Bouton envoi
  - Boutons contextuels : `📎 Exemple` · `🔄 Reformuler` · `📋 Copier SQL`

#### 2b. Panel Résultats (droite, ~60%)
> Style **image.png** — table pro avec tous les détails

**Header du panel :**
- Titre dynamique : _"Résultats : Top 10 ventes — Déc. 2024"_
- Badges méta : `240 lignes` · `0.8s` · `Snowflake`
- Boutons : `⬇️ Export CSV` · `📊 Visualiser` · `🔍 Filtrer`

**KPI Cards (4 cards en haut)** :
- Total des commandes
- Montant total
- Commandes en attente
- Taux de complétion

**Table de données** :
- Colonnes triables avec icônes
- **Badges de statut colorés** (comme image.png) : `Completed` (vert), `Pending` (orange), `Cancelled` (rouge)
- Avatars/icônes dans les colonnes si pertinent
- **Actions par ligne** : Voir détail · Copier
- **Barre de sélection multiple** (comme image.png) : apparaît au survol/sélection
- Pagination : `Previous · 1 · 2 · 3 · ... · Next`

**Onglets de vue** (comme image.png) :
- `Tableau` · `Graphique` · `JSON` · `SQL généré`

---

### 3. Vue "Schéma DB"
> Exploration visuelle du schéma Snowflake

**Contenu :**
- Liste des tables disponibles avec nombre de colonnes et de lignes
- Pour chaque table : colonnes avec types (cliquable pour ajouter au contexte)
- Champ de recherche de colonnes
- Bouton : "_Interroger cette table_" → ouvre le chat avec contexte pré-rempli

---

### 4. Vue "Historique"
> Toutes les questions posées et leurs requêtes SQL
> Style **image.png** — liste paginée

**Contenu :**
- Tableau : Question · SQL généré · Nb résultats · Date · Actions
- Filtre par date
- Bouton "Rejouer" sur chaque ligne

---

### 5. Vue "Dashboard" _(optionnel pour le POC)_
> KPIs fixes pré-calculés sur le dataset mock

**Contenu :**
- 4-6 KPI cards (CA total, commandes, top produit, top région...)
- 2-3 graphiques simples (courbe temporelle, bar chart, donut)
- Chaque graphique cliquable → ouvre le chat avec la question correspondante

---

## Composants UI clés

| Composant | Description | Inspiration |
|-----------|-------------|-------------|
| `<ChatBubble>` | Bulle de message avec SQL collapsible | image1.png |
| `<DataTable>` | Table triable, filtrable, avec badges statut | image.png |
| `<KPICard>` | Card metric avec tendance | image.png |
| `<SQLBlock>` | Syntax highlight du SQL généré | — |
| `<StatusBadge>` | Badge coloré (Completed/Pending/etc.) | image.png |
| `<DatabaseSchema>` | Arbre des tables/colonnes | — |
| `<QuickActionCard>` | Card d'action rapide sur home | image1.png |
| `<LoadingQuery>` | Animation pendant la génération SQL | — |

---

## Thème visuel

| Élément | Style |
|---------|-------|
| Fond général | Blanc pur `#FFFFFF` |
| Sidebar | Gris très clair `#F8F9FA` |
| Accents | Bleu `#2563EB` (comme image.png) |
| Home background | Gradient doux violet/bleu (image1.png) |
| Typographie | Inter ou Geist |
| Coins | Arrondis `rounded-lg` à `rounded-xl` |
| Ombres | Légères `shadow-sm` |
| Badges Completed | Vert `#16A34A` bg `#F0FDF4` |
| Badges Pending | Orange `#D97706` bg `#FFFBEB` |
| Badges Error | Rouge `#DC2626` bg `#FEF2F2` |

---

## Dataset mock — E-Commerce (style image.png)

### Table `ORDERS` — 240 lignes simulées

| order_id | customer_name | order_date | status | total_amount | payment_status |
|----------|---------------|------------|--------|--------------|----------------|
| #ORD1008 | Esther Klein | 17 Dec 2024 | Pending | $10.50 | Unpaid |
| #ORD1007 | Denise Kuhn | 16 Dec 2024 | Pending | $100.50 | Unpaid |
| #ORD1006 | Clint Hoppe | 16 Dec 2024 | Completed | $60.56 | Paid |
| #ORD1005 | Darin Deckow | 16 Dec 2024 | Refunded | $640.50 | Paid |
| #ORD1004 | Jacquelyn Robel | 15 Dec 2024 | Completed | $38.50 | Paid |
| #ORD1003 | Clint Hoppe | 15 Dec 2024 | Completed | $29.50 | Paid |
| #ORD1002 | Erin Bira | 16 Dec 2024 | Completed | $120.35 | Paid |
| #ORD1001 | Gretchen Gutz | 14 Dec 2024 | Refunded | $123.50 | Paid |
| #ORD1000 | Stewart Kuler | 13 Dec 2024 | Completed | $87.00 | Paid |
| #ORD0999 | Maria Santos | 13 Dec 2024 | Pending | $215.00 | Unpaid |
| #ORD0998 | James Fowler | 12 Dec 2024 | Completed | $54.99 | Paid |
| #ORD0997 | Anna Schmidt | 12 Dec 2024 | Cancelled | $320.00 | Refunded |
| ... | ... | ... | ... | ... | ... |

**Statuts possibles :** `Completed` · `Pending` · `Refunded` · `Cancelled` · `Processing`
**Distribution mock :** 60% Completed, 15% Pending, 10% Refunded, 10% Cancelled, 5% Processing

---

### Table `PRODUCTS` — 80 lignes simulées

| product_id | name | category | price | stock | rating |
|------------|------|----------|-------|-------|--------|
| P001 | Wireless Headphones Pro | Electronics | $129.99 | 245 | 4.7 |
| P002 | Running Shoes X1 | Sports | $89.50 | 512 | 4.5 |
| P003 | Coffee Maker Deluxe | Home & Kitchen | $74.99 | 89 | 4.3 |
| P004 | Yoga Mat Premium | Sports | $34.99 | 320 | 4.8 |
| P005 | USB-C Hub 7-in-1 | Electronics | $49.99 | 0 | 4.6 |
| P006 | Novel: "The Last Star" | Books | $14.99 | 150 | 4.2 |
| P007 | Protein Powder Vanilla | Health | $59.99 | 78 | 4.4 |
| P008 | Desk Lamp LED | Home & Kitchen | $39.99 | 200 | 4.1 |
| P009 | Bluetooth Speaker | Electronics | $79.99 | 34 | 4.9 |
| P010 | Winter Jacket | Clothing | $199.00 | 0 | 4.6 |
| ... | ... | ... | ... | ... | ... |

**Catégories :** `Electronics` · `Sports` · `Home & Kitchen` · `Books` · `Health` · `Clothing`
**Stock = 0** → badge `Out of Stock` (rouge)

---

### Table `CUSTOMERS` — 120 lignes simulées

| customer_id | name | email | country | total_orders | total_spent | status |
|-------------|------|-------|---------|--------------|-------------|--------|
| C001 | Esther Klein | esther.k@mail.com | Germany | 12 | $1,240.50 | VIP |
| C002 | James Fowler | j.fowler@mail.com | USA | 8 | $876.00 | Active |
| C003 | Maria Santos | m.santos@mail.com | Brazil | 3 | $215.00 | Active |
| C004 | Clint Hoppe | c.hoppe@mail.com | USA | 22 | $3,450.00 | VIP |
| C005 | Anna Schmidt | a.schmidt@mail.com | Germany | 1 | $320.00 | Inactive |
| C006 | Yuki Tanaka | y.tanaka@mail.com | Japan | 15 | $2,100.00 | VIP |
| C007 | Lucas Morel | l.morel@mail.com | France | 6 | $540.00 | Active |
| C008 | Priya Patel | p.patel@mail.com | India | 4 | $380.00 | Active |
| ... | ... | ... | ... | ... | ... | ... |

**Statuts client :** `VIP` (violet) · `Active` (vert) · `Inactive` (gris)

---

### Table `ORDER_ITEMS` — ~600 lignes simulées

| item_id | order_id | product_name | category | quantity | unit_price | subtotal |
|---------|----------|--------------|----------|----------|------------|----------|
| I001 | #ORD1008 | USB-C Hub 7-in-1 | Electronics | 1 | $10.50 | $10.50 |
| I002 | #ORD1007 | Yoga Mat Premium | Sports | 2 | $34.99 | $69.98 |
| I003 | #ORD1007 | Protein Powder Vanilla | Health | 1 | $30.52 | $30.52 |
| I004 | #ORD1006 | Desk Lamp LED | Home & Kitchen | 1 | $39.99 | $39.99 |
| I005 | #ORD1006 | Novel: "The Last Star" | Books | 1 | $14.99 | $14.99 |
| ... | ... | ... | ... | ... | ... | ... |

---

### KPIs pré-calculés pour les cards

| Métrique | Valeur mock | Tendance |
|----------|-------------|----------|
| Commandes ce mois | **240** | +12% vs mois dernier |
| Commandes en attente | **20** | -5% |
| Commandes expédiées | **180** | +18% |
| Commandes remboursées | **10** | -2% |
| CA total décembre | **$48,320** | +22% |
| Panier moyen | **$201.33** | +8% |
| Clients actifs | **98** | +3 nouveaux |
| Produit top vente | **Wireless Headphones Pro** | 🔥 |

---

### Requêtes démo pré-mappées (question → SQL → résultat attendu)

| Question utilisateur | SQL généré (aperçu) | Résultat affiché |
|----------------------|---------------------|------------------|
| "Top 10 commandes récentes" | `SELECT * FROM ORDERS ORDER BY order_date DESC LIMIT 10` | Table ORDERS (10 lignes) |
| "Produits en rupture de stock" | `SELECT * FROM PRODUCTS WHERE stock = 0` | Table PRODUCTS filtrée |
| "Clients VIP par dépense" | `SELECT * FROM CUSTOMERS WHERE status='VIP' ORDER BY total_spent DESC` | Table CUSTOMERS triée |
| "CA par catégorie" | `SELECT category, SUM(...) FROM ORDER_ITEMS GROUP BY category` | Table + bar chart |
| "Commandes pending non payées" | `SELECT * FROM ORDERS WHERE status='Pending' AND payment_status='Unpaid'` | Table ORDERS filtrée |

---

## Exemples de questions démo (pour le pitch)

1. _"Montre-moi les 10 commandes les plus récentes"_
2. _"Quel est le montant total des ventes du mois de décembre ?"_
3. _"Quels sont les 5 produits les plus vendus par catégorie ?"_
4. _"Combien de commandes sont encore en statut Pending ?"_
5. _"Compare les ventes de novembre et décembre"_

---

## Étapes de développement suggérées

1. **Layout de base** : sidebar + header + zone principale (sans logique)
2. **Page Home** : style image1.png, input fonctionnel
3. **Intégration Claude** : natural language → SQL (mock Snowflake d'abord)
4. **DataTable** : affichage des résultats style image.png
5. **Connexion Snowflake** : vraie exécution des requêtes
6. **Finitions** : historique, schéma DB, export CSV

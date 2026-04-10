---
marp: true
theme: default
paginate: true
style: |
  section {
    font-family: 'Segoe UI', sans-serif;
    background: #f8f9fa;
    color: #1a1a2e;
  }
  h1 { color: #1B87D9; border-bottom: 2px solid #29B5E8; padding-bottom: 8px; }
  h2 { color: #1B87D9; }
  code { background: #e8f4fd; color: #1B87D9; padding: 2px 6px; border-radius: 4px; }
  table { font-size: 0.8em; }
  th { background: #29B5E8; color: white; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75em; font-weight: 600; }
  .done  { background: #d1fae5; color: #065f46; }
  .todo  { background: #fef3c7; color: #92400e; }
---

# DataQuery AI — Documentation des Pages

**Stack** : Next.js 16 · React 19 · TypeScript 5 · Tailwind v4 · Snowflake Cortex AI

> Ce document est la référence visuelle de toutes les routes de l'application.
> Généré pour être lu par l'IA (contexte CLAUDE.md) **et** affiché avec Marp CLI.

---

## Carte des Routes

| Route | Fichier | Statut | Description courte |
|-------|---------|--------|-------------------|
| `/` | `app/page.tsx` | <span class="badge done">✓ Fait</span> | Hero + quick actions |
| `/explorer` | `app/explorer/page.tsx` | <span class="badge done">✓ Fait</span> | Chat NL → SQL + table résultats |
| `/history` | `app/history/page.tsx` | <span class="badge done">✓ Fait</span> | Historique des requêtes |
| `/schema` | `app/schema/page.tsx` | <span class="badge done">✓ Fait</span> | Exploration du schéma DB |
| `/dashboard` | *(à créer)* | <span class="badge todo">⏳ Todo</span> | KPIs pré-calculés + charts |
| `/settings` | *(à créer)* | <span class="badge todo">⏳ Todo</span> | Configuration connexion Snowflake |

---

## Page `/` — Home (Hero)

**Fichier** : `src/app/page.tsx`

### Rôle
Point d'entrée de l'application. Présente le produit et redirige vers `/explorer`.

### Composition visuelle
```
┌─ Sidebar ─────────────────────────────────────────────┐
│  ┌─ Hero ──────────────────────────────────────────┐  │
│  │  Badge "AI-Powered" · Titre · Sous-titre        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │
│  │  │ Ventes  │ │Tendances│ │Périodes │  (3 cards) │  │
│  │  └─────────┘ └─────────┘ └─────────┘           │  │
│  │  ┌── Input NL ──────────────────── [➤] ┐       │  │
│  │  │  "Ex: Top 10 ventes du mois..."      │       │  │
│  │  └──────────────────────────────────────┘       │  │
│  │  [❄ Snowflake] [🗄 Dataset] [🤖 Claude]         │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### Style
- Fond : dégradé lavande `linear-gradient(135deg, #e8e8f4, #dcd8f0, #d4d8f0, #d8dff5)`
- Cartes : glassmorphism `bg-white/70 backdrop-blur`
- Blobs décoratifs flous (purple-300, blue-300, indigo-200)

### Interactions
| Action | Résultat |
|--------|---------|
| Clic sur une quick-card | Pré-remplit l'input NL |
| Submit input | `router.push('/explorer?q=...')` |

---

## Page `/explorer` — Chat + Résultats

**Fichier** : `src/app/explorer/page.tsx`

### Rôle
Interface principale. Conversation NL → SQL avec affichage du résultat en tableau Snowflake-style.

### Composition visuelle
```
┌─ Sidebar ──┬─────────────────────────────────────────┐
│            │  [KPI strip: 4 cartes horizontales]     │
│            ├─────────────────────────────────────────┤
│            │  Zone chat (messages user/assistant)    │
│            │  └─ Bulles + SQLBlock inline collapsible│
│            ├─────────────────────────────────────────┤
│            │  Tabs: [Table] [SQL] [Chart]            │
│            │  ┌─ Toolbar: Filtres / Search / Export ┐│
│            │  │ En-têtes colonnes avec type icons   ││
│            │  │ Lignes avec numéros de ligne        ││
│            │  │ StatusBadge colorés                 ││
│            │  └─────────────────────────────────────┘│
│            │  Footer pagination: Rows X-Y of Z       │
│            ├─────────────────────────────────────────┤
│            │  [Input NL ──────────────── ➤]          │
└────────────┴─────────────────────────────────────────┘
```

### State management
```ts
messages: Message[]          // historique chat
activeResult: QueryResult    // résultat affiché dans les tabs
activeTab: "table"|"sql"|"chart"
statusFilter: string         // filtre All/Pending/Completed/...
page: number                 // pagination (10 rows/page)
```

### Composants utilisés
- `<SQLBlock>` — aperçu SQL inline dans les bulles chat
- `<SQLWorksheet>` — éditeur SQL Snowflake-style dans l'onglet SQL
- `<StatusBadge>` — pill coloré pour ORDER.STATUS
- `saveHistory()` — persiste chaque requête en localStorage

### Accent couleur
`#29B5E8` (Snowflake blue) · Icônes colonnes : `Calendar` `DollarSign` `Hash` `AlignLeft` `Tag`

---

## Page `/history` — Historique des Requêtes

**Fichier** : `src/app/history/page.tsx`

### Rôle
Liste toutes les requêtes passées (session courante, max 50). Permet de les rejouer ou supprimer.

### Composition visuelle
```
┌─ Header : "Query History" · N queries · [Clear all] ─┐
├─ Search bar ──────────────────────────────────────────┤
│  ┌─ Entry ──────────────────────────────────────────┐ │
│  │ [▶] Question NL           [code preview] [Replay]│ │
│  │     X rows · Yms · timeAgo                [🗑]   │ │
│  │  ─ expanded: <SQLWorksheet readonly /> ─────────  │ │
│  └──────────────────────────────────────────────────┘ │
│  (liste de N entries, triées du plus récent)          │
└───────────────────────────────────────────────────────┘
```

### Source de données
`localStorage["dq_history"]` via `src/lib/history-store.ts`

```ts
interface HistoryEntry {
  id: string          // crypto.randomUUID()
  question: string    // question NL originale
  sql: string         // SQL généré
  rowCount: number    // nb de lignes retournées
  durationMs: number  // temps d'exécution simulé
  createdAt: string   // ISO timestamp
}
```

### Interactions
| Action | Résultat |
|--------|---------|
| Clic chevron | Expand/collapse SQLWorksheet |
| Replay | `router.push('/explorer?q=...')` |
| Delete | `deleteEntry(id)` + re-render local |
| Clear all | `clearHistory()` + `setEntries([])` |
| Search | Filtre en temps réel sur question + SQL |

---

## Page `/schema` — Explorateur de Schéma

**Fichier** : `src/app/schema/page.tsx`

### Rôle
Visualise la structure de la base de données (arbre DB/Schema/Tables/Colonnes). Style inspiré de l'interface Snowflake native.

### Composition visuelle
```
┌─ Left tree (w-64) ──────┬─ Right detail ──────────────┐
│ 🗄 E_COMMERCE_DEMO      │  [Table2] ORDERS             │
│  └─ ▼ RETAIL            │  "Customer orders..."        │
│      Tables 4           │  240 rows · 6 columns  [▶ Query]│
│      ▶ ORDERS      240  ├─ Search columns... ──────────┤
│      ▼ PRODUCTS     80  │  # │ Column        │ Type    │
│        ├ $ PRICE        │  1 │ 🔑 ORDER_ID   │ VARCHAR │
│        ├ # STOCK        │  2 │ CUSTOMER_NAME │ VARCHAR │
│      ▶ CUSTOMERS   120  │  3 │ ORDER_DATE    │ DATE    │
│      ▶ ORDER_ITEMS 600  │  4 │ STATUS        │ VARCHAR │
└─────────────────────────┴─────────────────────────────┘
```

### Tables disponibles (schéma RETAIL)
| Table | Rows | Colonnes clés |
|-------|------|--------------|
| `ORDERS` | 240 | ORDER_ID (PK), CUSTOMER_NAME, ORDER_DATE, STATUS, TOTAL_AMOUNT |
| `PRODUCTS` | 80 | PRODUCT_ID (PK), NAME, CATEGORY, PRICE, STOCK, RATING |
| `CUSTOMERS` | 120 | CUSTOMER_ID (PK), NAME, EMAIL, COUNTRY, STATUS |
| `ORDER_ITEMS` | 600 | ITEM_ID (PK), ORDER_ID (FK→ORDERS), PRODUCT_NAME, QUANTITY |

### Indicateurs visuels colonnes
| Icône | Type | Couleur |
|-------|------|---------|
| `Calendar` | DATE | blue-400 |
| `DollarSign` | FLOAT | green-500 |
| `Hash` | INTEGER | gray-400 |
| `Tag` | BOOLEAN | purple-400 |
| `AlignLeft` | VARCHAR | gray-400 |
| `Key` | PK | amber-400 |

---

## Page `/dashboard` — KPIs *(À créer)*

**Fichier** : `src/app/dashboard/page.tsx` *(à créer)*

### Rôle prévu
Tableau de bord avec KPIs pré-calculés et visualisations graphiques.

### Contenu prévu
```
┌─ KPI strip ──────────────────────────────────────────┐
│  Total Revenue  │  Orders  │  Avg Order  │  VIP %   │
├─ Charts ─────────────────────────────────────────────┤
│  [CA par mois - LineChart]  [Top catégories - Bar]   │
│  [Statuts commandes - Pie]  [Pays clients - Map]     │
└──────────────────────────────────────────────────────┘
```

### Dépendances à ajouter
- `recharts` ou `@tremor/react` pour les graphiques
- Données issues de `src/lib/mock-data.ts` (existant)

---

## Composants Partagés

**Fichier** : `src/components/`

| Composant | Fichier | Utilisé dans |
|-----------|---------|-------------|
| `Sidebar` | `sidebar.tsx` | Layout global (`app/layout.tsx`) |
| `StatusBadge` | `status-badge.tsx` | `/explorer` (colonne STATUS) |
| `SQLWorksheet` | `sql-worksheet.tsx` | `/explorer` (onglet SQL), `/history` (expand) |
| `SQLBlock` | `sql-block.tsx` | `/explorer` (bulles chat, aperçu compact) |

### SQLWorksheet — Détail

Style Snowflake : fond blanc, numéros de ligne, icône ❄ sur ligne 1, toolbar Run/Copy.

**Syntax highlighting** (regex → spans HTML) :
- Mots-clés SQL → `#1B87D9` bleu bold
- Fonctions → `#7B4FCB` violet
- Strings `'...'` → `#027A48` vert
- Nombres → `#B54708` orange
- Commentaires `--` → `#9CA3AF` italique gris

---

## Règles de Cohérence Visuelle

### Couleurs accent
| Token | Valeur | Usage |
|-------|--------|-------|
| Snowflake Blue | `#29B5E8` | Boutons primaires, liens, icônes actives |
| Snowflake Dark | `#1B87D9` | Titres, keywords SQL |
| Sidebar active | `bg-blue-50 text-blue-700` | Nav item actif |
| Selected row | `bg-[#F0F7FF]` | Hover ligne tableau |
| Selected table | `bg-[#EEF6FB] text-[#1B87D9]` | Arbre schéma |

### Typographie
- UI labels : `text-xs` (12px) ou `text-[11px]`
- Code / SQL : `font-mono`
- Titres section : `text-sm font-semibold`
- Labels colonnes : `text-[10px] uppercase tracking-wide`

### Layout global
```
<body class="flex">
  <Sidebar w-56 />
  <main flex-1>
    {/* contenu page */}
  </main>
</body>
```

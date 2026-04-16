# Roadmap — Dashboard Builder

> Objectif : permettre à l'utilisateur de construire ses propres dashboards
> à partir de ses requêtes SQL/NL, sans pipeline, sans Kanban.
> Basé sur analyse Playwright du 2026-04-13.

---

## Vision

```
[Explorer] Pose une question → résultat SQL
     │
     ▼
[Explorer] Onglet Chart → configure le chart (type, axes, couleur)
     │
     ▼
[Modal] "Épingler au dashboard" → choisit nom + taille
     │
     ▼
[Dashboard] Les widgets apparaissent dans une grille
     │  • Réorganisables (drag)
     │  • Supprimables
     │  • Éditables (rouvre Chart Builder)
     │
     ▼
[Dashboard] Multi-dashboard : l'utilisateur peut créer plusieurs dashboards
             nommés (Ex: "Ventes", "Stock", "Clients")
```

---

## État actuel (diagnostic Playwright)

| Composant | Statut | Problème |
|-----------|--------|---------|
| KPI cards | ✅ OK | Valeurs + trends visibles |
| Area chart "Évolution CA" | ❌ Blanc | `ResponsiveContainer` sans hauteur parent px |
| Donut "Répartition statuts" | ❌ Blanc | Même cause |
| Bar chart "CA par catégorie" | ❌ Blanc | Même cause |
| Top produits | ✅ OK | Pas de Recharts, progress bars CSS |
| Widget store (localStorage) | ✅ OK | Code correct, aucun widget au 1er chargement |
| ChartBuilder (Explorer) | ✅ OK | Fonctionnel, sauvegarde dans widget-store |
| Grille widgets dynamiques | ⚠️ Partiel | Affiche les widgets mais pas réorganisable |

**Fix immédiat** — wrapper `h-[Npx]` autour de chaque `ResponsiveContainer` :
```tsx
// AVANT
<ResponsiveContainer width="100%" height={200}>

// APRÈS
<div className="h-[200px]">
  <ResponsiveContainer width="100%" height="100%">
```

---

## Architecture cible

```
/dashboard            → Dashboard actif (grille de widgets)
/dashboard/new        → Créer un nouveau dashboard (nommer)
```

Pas de nouvelle route `/pipeline` ni `/analytics` — tout se fait dans le dashboard builder.

---

## Phase 1 — Fix + Dashboard builder de base

### 1a. Fix Recharts (30 min)
- Wrapper `h-[Npx]` sur les 3 ChartCards du dashboard hardcodé
- Résultat : les charts hardcodés deviennent visibles

### 1b. Grille widgets draggable (2h)
Remplacer le `grid grid-cols-3 gap-4` statique par une grille réorganisable.

**Option retenue : `@dnd-kit/core` + `@dnd-kit/sortable`**
(léger, pas de dépendances lourdes, compatible React 19)

```
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Comportement :
- Drag & drop entre widgets pour réordonner
- Ordre sauvegardé dans localStorage via `reorderWidgets()`
- Handle de drag : icône GripVertical (déjà dans widget-card.tsx)

```
┌─────────────────────────────────────────────────────────┐
│  Mes dashboards   [+ Nouveau]          [Éditer] [Partager]│
├─────────────────────────────────────────────────────────┤
│  ┌── Widget M ──────────────┐  ┌── Widget S ──┐         │
│  │ ⠿ Revenue par mois       │  │ ⠿ Top catég. │         │
│  │  [line chart]            │  │  [bar chart] │         │
│  │                    ✏ 🗑  │  │        ✏ 🗑  │         │
│  └──────────────────────────┘  └─────────────┘         │
│  ┌── Widget L ──────────────────────────────────┐       │
│  │ ⠿ Évolution commandes par statut             │       │
│  │  [area chart multi-series]             ✏ 🗑  │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│    + Ajouter un widget → ouvre Explorer              │     │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
└─────────────────────────────────────────────────────────┘
```

### 1c. Mode Édition vs Lecture (1h)
Toggle `[Éditer]` / `[Terminer]` dans le header :
- **Lecture** : charts visibles, pas de handles, pas de boutons ✏ 🗑
- **Édition** : handles drag visibles, boutons ✏ 🗑 sur chaque widget, CTA "Ajouter"

---

## Phase 2 — Multi-dashboards

### Concept
L'utilisateur peut créer plusieurs dashboards nommés. La sidebar affiche les dashboards
créés, avec un `+` pour en créer un nouveau.

```
MAIN
  ├─ Explorer
  ├─ Historique
  ├─ Schéma DB
  │
DASHBOARDS
  ├─ 📊 Ventes           /dashboard/ventes
  ├─ 📊 Stock            /dashboard/stock
  ├─ 📊 Clients          /dashboard/clients
  └─ + Nouveau dashboard
```

### Modèle de données

```ts
// lib/dashboard-store.ts  (nouveau)

interface Dashboard {
  id: string;
  name: string;
  createdAt: string;
  widgetIds: string[];   // ordre des widgets dans ce dashboard
}

// widget-store.ts reste intact — les widgets sont partagés entre dashboards
// (un widget peut apparaître dans un seul dashboard, celui qui l'a créé)
```

### Sélecteur de dashboard (header du dashboard)
```
Vue d'ensemble  ▼   [+ Nouveau dashboard]
  Ventes ✓
  Stock
  Clients
```

---

## Phase 3 — Line Chart avancé comme type de widget

Actuellement le ChartBuilder propose : Bar, Line, Area, Pie, Scatter.
Enrichir le type `Line` avec des options supplémentaires déclenchées
quand l'utilisateur sélectionne "Line" :

### Options Line avancées (dans le panneau config du ChartBuilder)

```
Chart type : [Bar] [Line ✓] [Area] [Pie] [Scatter]

── Options Line ──────────────────────
Courbes multiples    [ON/OFF]
  └─ Si ON : sélecteur "Série 2" (2e colonne numérique)
             Couleur série 2 : [●]

Afficher points      [ON/OFF]
Lissage              [ON/OFF]  (type="monotone" vs "linear")
Brush / zoom         [ON/OFF]  (ajoute <Brush> en bas du chart)
Ligne de référence   [valeur] ──────  (ex: objectif $20k)
```

### Widget "Line multi-séries" résultant

```
┌─ Revenue & Orders — 6 mois ──────────────────────────────┐
│                                                    ✏  🗑  │
│  $31k ─────────────────                    ●              │
│  $25k          ╲          ╱───────────────────────        │  ← Revenue
│  $20k ···········╲·······╱·······ref·line·············    │
│  $15k             ────                                    │
│   104 ─────────────────────────────────────────────────   │  ← Orders (axe droit)
│    62  ───────────  ─────────────────                     │
│       Jul  Aug  Sep  Oct  Nov  Déc                        │
│  ════════════════════════════════════════════════════     │  ← Brush
└──────────────────────────────────────────────────────────┘
```

---

## Composants à créer / modifier

### Nouveaux

| Fichier | Rôle |
|---------|------|
| `lib/dashboard-store.ts` | CRUD dashboards (multi-dashboard) en localStorage |
| `components/dashboard/widget-grid.tsx` | Grille dnd-kit sortable |
| `components/dashboard/edit-mode-toggle.tsx` | Bouton Éditer / Terminer |
| `components/dashboard/dashboard-selector.tsx` | Dropdown sélection dashboard + créer |
| `components/shared/spark-line.tsx` | Mini AreaChart 8pts pour KPI cards |

### Modifier

| Fichier | Modification |
|---------|-------------|
| `app/dashboard/page.tsx` | Fix Recharts + intégrer widget-grid dnd + mode édition |
| `components/chart-builder.tsx` | Ajouter options Line avancées (multi-séries, brush, ref-line) |
| `components/widget-card.tsx` | Masquer/afficher contrôles selon mode édition |
| `components/sidebar.tsx` | Afficher liste des dashboards créés |

---

## Ordre d'implémentation

```
Sprint 1 — Fix + fondations (prioritaire)
  1. Fix Recharts blancs (wrapper h-[Npx])                    ~20min
  2. Sparklines KPI cards                                     ~30min
  3. widget-grid.tsx avec dnd-kit (drag & drop)               ~1h30
  4. Mode édition / lecture                                    ~45min

Sprint 2 — Multi-dashboards
  5. dashboard-store.ts (CRUD multi-dashboard)                ~45min
  6. dashboard-selector.tsx (dropdown header)                 ~45min
  7. Sidebar dynamique (liste dashboards)                     ~30min

Sprint 3 — Line chart enrichi
  8. Options Line avancées dans ChartBuilder                  ~1h30
     (multi-séries, brush, ref-line, lissage)
  9. Rendu multi-séries dans ChartRenderer                    ~1h
```

---

## Contraintes techniques

- `@dnd-kit` requis pour drag & drop (ne pas utiliser `react-beautiful-dnd`, déprécié)
- Wrapper `<div className="h-[Npx]">` **obligatoire** autour de tout `ResponsiveContainer`
- Tout en `"use client"` — pas de Server Components pour les charts
- `cn()` + Tailwind v4 — jamais de style inline sauf valeurs dynamiques recharts
- Couleurs métriques : Revenue `#29B5E8` · Orders `#6366f1` · Clients `#10b981` · Refunds `#ef4444`
- localStorage keys : `dq_widgets` (existant) · `dq_dashboards` (nouveau)

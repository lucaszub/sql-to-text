# Roadmap — De la requête SQL au widget Dashboard

> **Objectif** : Permettre à un utilisateur (technique ou non) de passer d'une
> question en langage naturel → résultat SQL → visualisation configurée → widget
> épinglé sur le dashboard. Inspiré de l'interface Snowflake (Chart tab natif).

---

## Vision du parcours utilisateur

```
[Explorer] Pose une question en NL
     │
     ▼
[Explorer] Résultats en Table  ←──────────────┐
     │                                         │
     ▼                                         │
[Explorer] Onglet "Chart" ← PROCHAINE ÉTAPE   │
     │  • Choisit le type de chart             │
     │  • Configure X / Y / Agrégat            │
     │  • Voit le preview en live              │
     │                                         │
     ▼                                         │
[ Modal ] "Ajouter au Dashboard"               │
     │  • Nomme le widget                      │
     │  • Choisit la taille (S / M / L)        │
     │                                         │
     ▼                                         │
[Dashboard] Widget apparaît dans la grille     │
     │  • Rendu depuis widget-store.ts         │
     │  • Bouton ✏️ → rouvre le Chart Builder ─┘
     │  • Bouton 🗑 → supprime
```

---

## Phase 1 — Chart Builder dans l'Explorer *(next)*

**Fichier cible** : `src/app/explorer/page.tsx` (onglet Chart existant, vide)

### UI à construire (inspirée de Snowflake `image.png`)

```
┌─ Onglet Chart ─────────────────────────────────────────────────────┐
│                                                                      │
│  ┌─ Panneau config (w-64) ──┐  ┌─ Preview chart ──────────────────┐ │
│  │                           │  │                                   │ │
│  │  Chart type               │  │   [Recharts render live]          │ │
│  │  [Bar ▼] [Line] [Area]    │  │                                   │ │
│  │  [Pie]   [Scatter]        │  │                                   │ │
│  │                           │  │                                   │ │
│  │  X-axis                   │  │                                   │ │
│  │  [ ORDER_DATE ▼ ]         │  │                                   │ │
│  │                           │  └───────────────────────────────────┘ │
│  │  Y-axis                   │                                        │
│  │  [ TOTAL_AMOUNT ▼ ]       │  ┌─ Bouton ──────────────────────────┐ │
│  │                           │  │  📌 Ajouter au Dashboard          │ │
│  │  Aggregate                │  └───────────────────────────────────┘ │
│  │  [ SUM ▼ ]                │                                        │
│  │                           │                                        │
│  │  Group by                 │                                        │
│  │  [ STATUS ▼ ]             │                                        │
│  │                           │                                        │
│  │  Color                    │                                        │
│  │  [●] Snowflake blue       │                                        │
│  └───────────────────────────┘                                        │
└────────────────────────────────────────────────────────────────────┘
```

### Colonnes détectées automatiquement depuis `QueryResult.columns`
- Type `DATE` / `VARCHAR` → proposées en X-axis
- Type `FLOAT` / `INTEGER` → proposées en Y-axis
- Aggregate par défaut : `SUM` si numérique, `COUNT` sinon

### Composant à créer
`src/components/chart-builder.tsx`
```ts
interface ChartBuilderProps {
  result: QueryResult          // données brutes de la requête
  onAddToDashboard: (cfg: WidgetConfig) => void
}
```

---

## Phase 2 — Widget Store

**Fichier à créer** : `src/lib/widget-store.ts`

```ts
export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";
export type WidgetSize = "sm" | "md" | "lg";  // col-span 1 / 2 / 3

export interface WidgetConfig {
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  aggregate: "SUM" | "COUNT" | "AVG" | "NONE";
  groupBy?: string;
  color?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  sql: string;
  question: string;       // question NL originale
  columns: string[];      // noms des colonnes du résultat
  rows: Record<string, unknown>[];  // données brutes (max 500 lignes)
  config: WidgetConfig;
  size: WidgetSize;
  createdAt: string;      // ISO
  order: number;
}

// CRUD : saveWidget / getWidgets / deleteWidget / updateWidget / reorderWidgets
// Stockage : localStorage["dq_widgets"], max 20 widgets
```

---

## Phase 3 — Dashboard dynamique

**Fichier cible** : `src/app/dashboard/page.tsx`

### Changements
- Les widgets hardcodés (area, donut, bar, top produits) deviennent des **widgets par défaut**
  chargés si `getWidgets()` retourne `[]`
- La grille lit `getWidgets()` et rend chaque widget via `<WidgetCard>`

### Composant à créer
`src/components/widget-card.tsx`
```
┌─ Widget Card ──────────────────────────────────────────────────────┐
│  Titre du widget                             [✏️ Éditer] [🗑 Suppr] │
├────────────────────────────────────────────────────────────────────┤
│  [Chart recharts selon config]                                      │
└────────────────────────────────────────────────────────────────────┘
```

### Empty state
```
┌────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   📊   Aucun widget pour l'instant                                  │
│        Lancez une requête dans l'Explorer et cliquez               │
│        "Ajouter au Dashboard"                                       │
│                                                                      │
│        [ → Aller dans l'Explorer ]                                  │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Phase 4 — Polish *(plus tard)*

| Fonctionnalité | Librairie | Priorité |
|----------------|-----------|----------|
| Drag & drop reorder | `@dnd-kit/core` | Moyenne |
| Resize widget (S/M/L) | CSS grid col-span | Haute |
| Refresh widget (re-run SQL) | mock reload | Haute |
| Export widget en PNG | `html-to-image` | Basse |
| Partage de dashboard | URL params / JSON | Basse |

---

## Ordre d'implémentation recommandé

```
1. widget-store.ts          → 30 min  (CRUD localStorage, types)
2. chart-builder.tsx        → 2h      (UI config + recharts preview)
3. Explorer: brancher Chart tab sur ChartBuilder + modal "Add to Dashboard"
4. widget-card.tsx          → 45 min  (wrapper avec edit/delete)
5. dashboard/page.tsx       → 1h      (lecture widget-store, grille dynamique)
```

---

## Contraintes techniques à respecter

- **Pas de lib externe supplémentaire** sauf `@dnd-kit` pour le drag (Phase 4)
- `recharts` déjà installé → réutiliser les mêmes composants que le dashboard
- `cn()` + Tailwind v4 pour tout le styling
- Couleur accent : `#29B5E8` (Snowflake blue)
- Tous les nouveaux composants en `"use client"`
- Toujours valider avec un screenshot Playwright avant de déclarer terminé

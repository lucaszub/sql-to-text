# Prompt — Prochaine session

> Copier-coller tel quel au début de la prochaine conversation Claude Code.

---

## PROMPT

```
Tu travailles sur le projet sql-to-text situé dans /home/cgi/sql-to-text.
Lis d'abord ces fichiers dans l'ordre avant de coder quoi que ce soit :

1. /home/cgi/sql-to-text/CLAUDE.md
2. /home/cgi/sql-to-text/app/CLAUDE.md
3. /home/cgi/sql-to-text/docs/roadmap-chart-to-dashboard.md

Le projet est une app Next.js 16 / React 19 / Tailwind v4 / TypeScript strict.
On est sur la branche git `feature/dashboard`. Le dev server tourne sur http://localhost:3000.

---

## Contexte de ce qu'on a déjà

- `/explorer` : chat NL → SQL → tableau de résultats avec onglets Table / SQL / Chart
  L'onglet Chart existe mais est VIDE (juste un placeholder "Chart coming soon").
- `/dashboard` : dashboard avec charts recharts hardcodés (KPIs, area, donut, bar, top produits).
  Il y a un bouton "Ajouter un widget" en bas qui ne fait rien pour l'instant.
- `src/lib/history-store.ts` : localStorage CRUD (modèle à copier pour widget-store)
- `recharts` est déjà installé dans app/

---

## Ce que tu dois construire (dans cet ordre)

### Étape 1 — `src/lib/widget-store.ts`
CRUD localStorage pour les widgets du dashboard.
Modèle exact dans docs/roadmap-chart-to-dashboard.md § Phase 2.
Clé localStorage : `"dq_widgets"`, max 20 widgets.

### Étape 2 — `src/components/chart-builder.tsx`
Composant Chart Builder style Snowflake (voir image de référence décrite dans le roadmap).
- Panneau gauche : sélecteur chart type (Bar/Line/Area/Pie/Scatter) + X-axis + Y-axis
  + Aggregate (SUM/COUNT/AVG/NONE) + Group by + couleur
- Panneau droit : preview live recharts qui se met à jour en temps réel
- Bouton "📌 Ajouter au Dashboard" en bas → ouvre une modal pour nommer le widget
- Les colonnes disponibles sont détectées depuis `QueryResult` (types dans mock-data.ts)

### Étape 3 — Brancher le Chart tab dans l'Explorer
Dans `src/app/explorer/page.tsx`, l'onglet "Chart" doit rendre `<ChartBuilder>`
au lieu du placeholder actuel. Passer `activeResult` en prop.
Quand l'utilisateur clique "Ajouter au Dashboard" : appeler `saveWidget()` + toast
"Widget ajouté ✓" + lien vers /dashboard.

### Étape 4 — `src/components/widget-card.tsx`
Carte widget réutilisable : titre + chart recharts selon config + boutons edit/delete.
Tailles : sm (col-span-1), md (col-span-2), lg (col-span-3).

### Étape 5 — Dashboard dynamique
Modifier `src/app/dashboard/page.tsx` :
- Lire getWidgets() au lieu des données hardcodées
- Si widgets vides → afficher un empty state avec CTA vers /explorer
- Le bouton "Ajouter un widget" redirige vers /explorer
- Garder les widgets hardcodés actuels UNIQUEMENT comme fallback si aucun widget sauvegardé

---

## Règles obligatoires

- Utiliser Playwright pour prendre un screenshot et vérifier chaque étape
  (le chromium est dans ~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome,
  les libs manquantes sont dans /tmp/chrome_libs — LD_LIBRARY_PATH à setter)
- TypeScript strict : zéro erreur `npx tsc --noEmit`
- cn() + Tailwind v4 pour tout le styling, jamais de style inline sauf recharts
- Couleur accent Snowflake : #29B5E8
- Tous les composants en "use client"
- Ne pas toucher à sidebar.tsx, history/page.tsx, schema/page.tsx
```

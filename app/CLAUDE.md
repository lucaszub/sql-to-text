# CLAUDE.md — app/ (Next.js)

## Commandes Vitales

```bash
npm run dev      # Dev server (Turbopack) → http://localhost:3000
npm run build    # Build production
npm run lint     # ESLint 9 (config next core-web-vitals)
npm run start    # Serveur production (après build)
```

## Stack Précise

| Couche | Outil | Note critique |
|--------|-------|---------------|
| Framework | Next.js 16, App Router | Pas de Pages Router |
| React | v19 | Server Components disponibles |
| Styles | Tailwind v4 + `@tailwindcss/postcss` | **Pas** de tailwind.config.js |
| Headless UI | `@base-ui/react` | Pour Badge, Button, Tooltip |
| Pre-built UI | Shadcn (Card, Separator) | Via `components.json` |
| Variants | CVA (`class-variance-authority`) | Obligatoire pour tout nouveau variant |
| Classes | `cn()` = clsx + tailwind-merge | Toujours utiliser `cn()`, jamais template literals bruts |
| Icônes | `lucide-react` | Ne pas importer de lib icônes additionnelle |
| State | React Hooks uniquement | Pas de Zustand/Redux/Context tant que non nécessaire |

## Architecture Décisionnelle Rapide

```
Nouveau composant réutilisable ?
  → Headless avec Base UI + CVA  →  skill: ui-components.md

Nouveau statut / badge ?
  → Ajouter dans status-badge.tsx variants map  →  skill: ui-components.md

Nouvelle page / route ?
  →  app/CLAUDE.md §Routing  +  skill: nextjs-patterns.md

Modifier les données mock / types ?
  →  skill: data-layer.md

Toucher au gradient / couleurs de la home ?
  →  comparer avec image1.png  +  skill: styling.md

Intégrer Claude API / Snowflake réel ?
  →  skill: llm-integration.md  (lire en entier avant de coder)

Toute modification UI terminée ?
  →  OBLIGATOIRE : prendre screenshot Playwright + comparer avec image.png/image1.png
  →  skill: playwright-testing.md  (commande one-liner + setup LD_LIBRARY_PATH)
```

## Routing

> Documentation visuelle complète (Marp) : **`docs/pages.md`**
> Contient wireframes ASCII, state management, interactions et règles visuelles pour chaque page.

| Route | Fichier | Statut | Type |
|-------|---------|--------|------|
| `/` | `app/page.tsx` | ✓ Fait | Client — Hero + quick actions |
| `/explorer` | `app/explorer/page.tsx` | ✓ Fait | Client — Chat + table résultats |
| `/history` | `app/history/page.tsx` | ✓ Fait | Client — Historique localStorage |
| `/schema` | `app/schema/page.tsx` | ✓ Fait | Client — Explorateur schéma DB |
| `/dashboard` | *(à créer)* | ⏳ Todo | KPIs pré-calculés + charts |
| `/settings` | *(à créer)* | ⏳ Todo | Config connexion Snowflake |

Toute nouvelle page = Suspense boundary obligatoire si elle utilise `useSearchParams`.

## Registre des Skills

> **Règle** : Avant toute modification dans le domaine concerné, **charge et lis le skill complet** avant de proposer du code.

| Domaine | Fichier | Charger quand |
|---------|---------|---------------|
| Composants UI | `.claude/skills/ui-components.md` | Nouveau composant, nouveau variant, modifier status-badge, toucher à ui/* |
| Data & Types | `.claude/skills/data-layer.md` | Modifier mock-data.ts, ajouter une requête, préparer migration vers API réelle |
| Styles & Thème | `.claude/skills/styling.md` | Modifier gradient home, ajouter couleur, toucher à globals.css, nouveaux layouts |
| Patterns Next.js | `.claude/skills/nextjs-patterns.md` | Nouvelle page, Server vs Client component, params URL, metadata |
| LLM / SQL | `.claude/skills/llm-integration.md` | Intégrer Claude API, connecter Snowflake, modifier la logique de query dispatch |
| Tests visuels | `.claude/skills/playwright-testing.md` | **Obligatoire avant de déclarer toute tâche UI terminée** — screenshots, debug visuel, validation contre image.png/image1.png |

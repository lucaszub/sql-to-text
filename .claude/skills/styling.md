# Skill : Styles & Thème Visuel

## Références Visuelles Obligatoires

Avant tout changement de style, comparer visuellement avec :
- `image1.png` → référence Home (gradient pastel lavande, glassmorphism clair)
- `image.png` → référence Table/Explorer (blanc pur, badges, avatars, table professionnelle)

**Process obligatoire pour changement visuel** :
1. Modifier le code
2. Prendre screenshot Playwright (voir `.claude/skills/playwright-testing.md`)
3. Comparer côte-à-côte avec les images de référence
4. Itérer si nécessaire

## Tailwind v4 — Spécificités

Ce projet utilise Tailwind v4 avec `@tailwindcss/postcss`. Différences vs v3 :
- **Pas de `tailwind.config.js`** — configuration via CSS dans `globals.css`
- **Pas de `@apply` recommandé** — préférer classes directes
- Custom properties via `@theme` dans CSS (OKLCH color space dans `globals.css`)
- Import : `import 'tailwindcss'` dans globals, pas de `content` array

## Palette de Couleurs du Projet

```
Background Home  : linear-gradient(135deg, #e8e8f4 → #dcd8f0 → #d4d8f0 → #d8dff5)
Accent principal : blue-600  (#2563EB)
Accent secondaire: violet-500 / indigo-500
Success/Completed: green-500 bg, green-50 bg-light, green-700 text
Warning/Pending  : amber-500 bg, amber-50 bg-light, amber-700 text
Error/Cancelled  : red-500 bg, red-50 bg-light, red-700 text
Refunded         : purple-500 bg, purple-50 bg-light, purple-700 text
Processing       : blue-500 bg, blue-50 bg-light, blue-700 text
VIP              : violet-500 bg, violet-50 bg-light, violet-700 text
Border standard  : gray-200
Surface/Card     : white, bg-gray-50 (header table), bg-blue-50 (row selected)
```

## Gradients Home — Ne Pas Rendre Plus Sombre

Le gradient home actuel est calibré pour correspondre à `image1.png` :
```typescript
// ✅ Valeurs calibrées — modifier avec précaution
style={{ background: "linear-gradient(135deg, #e8e8f4 0%, #dcd8f0 35%, #d4d8f0 65%, #d8dff5 100%)" }}
// Blobs : bg-purple-300 opacity-25 / bg-blue-300 opacity-20 / bg-indigo-200 opacity-15
```
Si l'arrière-plan doit changer, prendre un screenshot avant/après et comparer avec `image1.png`.

## Glassmorphism Home — Règles

```typescript
// Cards sur fond clair → blanc semi-transparent + border blanc
"bg-white/70 backdrop-blur border border-white/90 shadow-sm"
// Hover → plus opaque
"hover:bg-white/90 hover:shadow-md"

// Badges bas de page
"bg-white/60 backdrop-blur border border-white/80 shadow-sm"
```

## Layout Explorer — Proportions Figées

```
Sidebar    : w-56 (224px) — ne pas modifier sans ajuster la table
Chat panel : w-[360px]   — ne pas modifier, équilibre chat/table
Results    : flex-1      — prend le reste
```

## Responsive

Actuellement non responsive (layout fixe desktop). Ne pas ajouter de responsive sans plan complet — risque de casser les proportions de la table.

## Anti-Patterns

- ❌ Ne pas utiliser `text-slate-900` sur fond gradient lavande — utiliser `text-gray-900`
- ❌ Ne pas rendre le gradient home plus sombre (dark navy = régression visuelle documentée)
- ❌ Ne pas mélanger les systèmes de couleurs : Tailwind classes OU CSS variables, pas les deux sur le même élément
- ❌ Ne pas ajouter `overflow-hidden` sur le body sans vérifier que la sidebar reste visible
- ❌ Ne pas utiliser `!important` ni `@apply` — trouver la bonne classe Tailwind

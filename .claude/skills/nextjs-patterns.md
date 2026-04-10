# Skill : Patterns Next.js App Router

## Règle Client vs Server — Décision Rapide

```
Utilise useState / useEffect / useRef / événements → "use client"
Lit des données en async au niveau de la page      → Server Component (pas de directive)
Utilise useSearchParams                            → "use client" + Suspense obligatoire
Layout partagé sans état                           → Server Component
```

## Suspense Obligatoire avec useSearchParams

Toute page qui utilise `useSearchParams()` **doit** être wrappée dans `<Suspense>` :

```typescript
// Pattern exact utilisé dans ce projet — reproduire à l'identique
function PageContent() {
  const searchParams = useSearchParams();
  // ... logique
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Chargement...</div>}>
      <PageContent />
    </Suspense>
  );
}
```

## Créer une Nouvelle Page

```
1. Créer app/{route}/page.tsx
2. Décider Server ou Client (voir règle ci-dessus)
3. Si Client + searchParams → Suspense wrapper
4. Vérifier que la page s'intègre dans layout.tsx (sidebar + main flex)
5. Ajouter la route dans sidebar.tsx navItems
6. Ajouter la route dans app/CLAUDE.md §Routing
```

## Navigation

```typescript
// Depuis un composant Client : useRouter
import { useRouter } from "next/navigation";
const router = useRouter();
router.push(`/explorer?q=${encodeURIComponent(query)}`);

// Liens statiques : <Link>
import Link from "next/link";
<Link href="/history">...</Link>

// Lire les params URL
const searchParams = useSearchParams();
const q = searchParams.get("q") ?? "";
```

## Passage de Données entre Pages

Méthode actuelle : **query params URL** (`?q=...`). Conserver ce pattern pour la navigation Home → Explorer.

Pour des données plus complexes futures : envisager `localStorage` ou un Context côté client. Pas de Server Actions tant que la data layer est 100% mock.

## Layout Actuel

```typescript
// layout.tsx — structure immuable
<body className="min-h-full flex bg-white text-gray-900">
  <Sidebar />                                   // w-56, fixed sidebar
  <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
    {children}                                  // Pages s'insèrent ici
  </main>
</body>
```

Les pages doivent respecter `flex-col h-screen overflow-hidden` pour que le layout ne scroll pas au niveau de la page entière.

## Metadata

Définir dans `layout.tsx` (global) ou via `export const metadata` dans chaque page Server.

## Anti-Patterns

- ❌ Ne pas importer `useRouter` depuis `next/router` (Pages Router) — utiliser `next/navigation`
- ❌ Ne pas ajouter `"use client"` à `layout.tsx` — il doit rester Server Component pour les fonts et metadata
- ❌ Ne pas fetch de données dans un Client Component avec `useEffect` pour du contenu critique — préférer Server Components
- ❌ Ne pas créer de fichiers `pages/` — le projet utilise uniquement App Router
- ❌ Ne pas oublier le Suspense boundary avec `useSearchParams` — cause un build error en production

# Skill : Composants UI

## Règle de Sélection du Bon Outil

```
Besoin d'interactivité (focus, aria, keyboard) ?  → Base UI (@base-ui/react) + CVA
Besoin d'un wrapper simple (card, divider) ?       → Shadcn (copier depuis ui/)
Composant purement visuel, pas d'état ?            → Functional component direct + cn()
```

Ne jamais importer un nouveau composant externe sans justification. Le système actuel couvre 100% des besoins UI du POC.

## Pattern CVA Obligatoire pour tout Nouveau Composant avec Variants

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const monComposantVariants = cva(
  // Classes de base — toujours présentes
  "inline-flex items-center rounded-lg text-sm font-medium transition-colors",
  {
    variants: {
      intent: {
        primary: "bg-blue-600 text-white hover:bg-blue-500",
        ghost:   "text-gray-600 hover:bg-gray-100",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-3",
      },
    },
    defaultVariants: { intent: "primary", size: "md" },
  }
);

export function MonComposant({
  className, intent, size, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof monComposantVariants>) {
  return <button className={cn(monComposantVariants({ intent, size }), className)} {...props} />;
}
```

## Avatars (Pattern Existant — Ne Pas Réinventer)

Le système d'avatars initiales+couleur est dans `explorer/page.tsx`. Si besoin ailleurs, **extraire** en composant partagé dans `components/avatar.tsx` :

```typescript
// Couleurs déterministes par nom — NE PAS changer l'ordre du tableau
const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500",
];
// Hash = (hash * 31 + charCode) & 0xff  → index % 8
```

## Status Badges — Ajouter un Nouveau Statut

**Fichier** : `src/components/status-badge.tsx`

Ajouter dans les **deux** maps (`variants` et `dots`), sinon fallback gris générique.

```typescript
// Palette autorisée pour nouveaux statuts :
// green-* → succès/actif  |  amber-* → attente  |  red-* → erreur/annulé
// purple-* → remboursé    |  blue-* → en cours   |  gray-* → inactif/neutre
// violet-* → VIP/premium
```

## cn() — Règle Absolue

```typescript
// ✅ Toujours
className={cn("base-classes", condition && "conditional", props.className)}

// ❌ Jamais
className={`base-classes ${condition ? "a" : "b"}`}  // Risque conflit Tailwind
className={"base " + extra}                           // Idem
```

## Anti-Patterns

- ❌ Ne pas ajouter `styled-components`, `emotion`, ou CSS Modules — Tailwind only
- ❌ Ne pas créer un composant Button custom si `ui/button.tsx` suffit
- ❌ Ne pas utiliser `style={{ }}` inline sauf pour des valeurs dynamiques impossibles en Tailwind (ex: gradient custom avec valeurs calculées)
- ❌ Ne pas importer des icônes depuis une autre lib que `lucide-react`
- ❌ Ne pas copier les classes Tailwind entre composants — extraire en composant ou CVA variant

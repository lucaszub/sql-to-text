# Skill : Data Layer & Types

## État Actuel

Toutes les données sont **100% mockées** dans `src/lib/mock-data.ts`. Aucune API, aucun appel réseau. Le but du POC est de valider l'UX avant branchement réel.

## Hiérarchie des Types — Ne Pas Casser

```typescript
// Ordre de dépendance — modifier dans cet ordre uniquement
OrderStatus (union)  →  Order (interface)  →  ORDERS (const)
PaymentStatus        →
                        Product            →  PRODUCTS
                        Customer           →  CUSTOMERS
QueryResult          →  runDemoQuery()     →  Explorer page
```

## Ajouter une Nouvelle Requête Demo

1. Ajouter le keyword pattern dans `runDemoQuery()` **avant** le return par défaut
2. Retourner un objet `QueryResult` complet avec tous les champs
3. Le `naturalAnswer` doit utiliser `**bold**` pour les chiffres clés (rendu via `dangerouslySetInnerHTML` dans la bulle chat)

```typescript
// Pattern à suivre — cohérent avec les existants
if (q.includes("keyword_fr") || q.includes("keyword_en")) {
  return {
    sql: "SELECT ...\nFROM ...\nWHERE ...;",   // ← Retours à la ligne pour lisibilité SQL
    naturalAnswer: "Il y a **X éléments** correspondant à votre critère...",
    columns: ["col1", "col2"],                  // ← Ordre d'affichage dans la table
    rows: DATA.filter(...),
    rowCount: filteredData.length,
    durationMs: 400 + Math.floor(Math.random() * 400),  // ← Varier 400-800ms
  };
}
```

## Migration vers API Réelle (Roadmap)

Quand Snowflake sera branché, remplacer uniquement `runDemoQuery()` par :

```typescript
// src/lib/query-engine.ts (À CRÉER)
export async function executeNaturalQuery(question: string): Promise<QueryResult> {
  // 1. POST /api/nl-to-sql  → Claude API → SQL string
  // 2. POST /api/snowflake/query  → Snowflake SDK → rows
  // 3. Retourner le même type QueryResult
}
```

**La page Explorer ne doit pas être modifiée** — elle consomme `QueryResult` peu importe la source.

## Types QueryResult — Contrat Immuable

```typescript
export interface QueryResult {
  sql: string;           // SQL brut affiché dans l'onglet SQL
  naturalAnswer: string; // Réponse en langage naturel (markdown **bold** supporté)
  columns: string[];     // Définit l'ordre ET les colonnes affichées
  rows: Record<string, any>[];  // Données — doit respecter les clés dans columns
  rowCount: number;      // Peut différer de rows.length (ex: total réel vs page)
  durationMs: number;    // Temps d'exécution affiché dans le header
}
```

## Formatage Automatique des Colonnes

`formatCell(key, value)` dans `explorer/page.tsx` gère automatiquement :
- Clés contenant `price/amount/spent/revenue` → formatées en `$X.XX`
- Clé `order_date` → formatée en date locale
- Clé `rating` → préfixée `⭐`
- Clé `status` / `payment_status` → rendu `<StatusBadge>`
- Clé `customer_name` / `name` → rendu avec `<Avatar>` + texte

Ajouter une nouvelle colonne spéciale ? → Modifier `formatCell()` et documenter ici.

## Anti-Patterns

- ❌ Ne pas importer ORDERS/PRODUCTS/CUSTOMERS directement dans les pages — passer par `runDemoQuery()`
- ❌ Ne pas hard-coder des données dans les pages — toujours dans `mock-data.ts`
- ❌ Ne pas changer les noms de colonnes dans les rows sans mettre à jour `QueryResult.columns`
- ❌ Ne pas ajouter des colonnes calculées côté page — les calculer dans `runDemoQuery()`
- ❌ Ne jamais exposer le type `any` dans les interfaces métier — `rows` est l'exception justifiée car schema dynamique

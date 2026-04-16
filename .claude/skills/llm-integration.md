# Skill : Intégration LLM (Claude API → SQL → Snowflake)

## Architecture Cible (Roadmap)

```
User Input (FR/EN)
      ↓
/api/nl-to-sql        → Claude API  →  SQL string + explication
      ↓
/api/snowflake/query  → Snowflake SDK  →  rows + columns + duration
      ↓
QueryResult           → Explorer page (inchangée)
```

La page Explorer consomme `QueryResult` — **elle ne doit pas savoir si les données viennent du mock ou du vrai Snowflake**.

## Fichiers à Créer lors de l'Intégration

```
app/
├── api/
│   ├── nl-to-sql/route.ts        → Claude API call
│   └── snowflake/query/route.ts  → Snowflake execution
└── lib/
    ├── claude-client.ts          → Claude API setup
    ├── snowflake-client.ts       → Snowflake SDK setup
    └── query-engine.ts           → Orchestration NL → SQL → Résultat
```

## Prompt Système Recommandé pour NL → SQL

```typescript
// claude-client.ts
const SYSTEM_PROMPT = `Tu es un expert SQL pour Snowflake.
Base de données disponible :
- ORDERS(order_id, customer_name, order_date, status, total_amount, payment_status)
- PRODUCTS(product_id, name, category, price, stock, rating)
- CUSTOMERS(customer_id, name, email, country, total_orders, total_spent, status)
- ORDER_ITEMS(item_id, order_id, product_name, category, quantity, unit_price, subtotal)

Règles :
- Retourne UNIQUEMENT le SQL, pas d'explication
- Utilise ILIKE pour les recherches textuelles
- Limite à 100 lignes par défaut sauf si spécifié
- Syntaxe Snowflake (DATEADD, TO_DATE, etc.)

Question : {userQuestion}`;
```

## Appel Claude API — Route Next.js

```typescript
// app/api/nl-to-sql/route.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { question } = await req.json();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",   // Modèle recommandé pour SQL generation
    max_tokens: 500,               // SQL rarement plus long
    messages: [{ role: "user", content: question }],
    system: SYSTEM_PROMPT,
  });

  const sql = (message.content[0] as { text: string }).text.trim();
  return Response.json({ sql });
}
```

## Variables d'Environnement Requises

```bash
# .env.local (ne jamais committer)
ANTHROPIC_API_KEY=sk-ant-...
SNOWFLAKE_ACCOUNT=xxx.snowflakecomputing.com
SNOWFLAKE_USER=...
SNOWFLAKE_PASSWORD=...
SNOWFLAKE_DATABASE=...
SNOWFLAKE_SCHEMA=...
SNOWFLAKE_WAREHOUSE=...
```

## Migration du Mock vers le Réel — Étapes

1. Créer `lib/query-engine.ts` avec la même signature que `runDemoQuery()`
2. Brancher dans `explorer/page.tsx` via une env var `USE_MOCK=true/false`
3. Tester chaque requête demo avec screenshot Playwright (voir `playwright-testing.md`)
4. Supprimer le mock seulement quand toutes les requêtes demo passent en réel

## Gestion des Erreurs LLM

```typescript
// Le naturalAnswer doit toujours être rempli, même en cas d'erreur
catch (error) {
  return {
    sql: "-- Erreur lors de la génération",
    naturalAnswer: "Je n'ai pas pu interpréter votre question. Essayez de reformuler.",
    columns: [], rows: [], rowCount: 0, durationMs: 0,
  };
}
```

## Anti-Patterns

- ❌ Ne jamais exposer `ANTHROPIC_API_KEY` côté client — toujours via Route Handler API
- ❌ Ne pas appeler Claude depuis le Client Component directement — passer par `/api/`
- ❌ Ne pas modifier `QueryResult` interface — adapter la réponse Claude pour correspondre au contrat existant
- ❌ Ne pas hardcoder le modèle Claude — utiliser une constante `MODEL = "claude-sonnet-4-6"` dans `claude-client.ts`
- ❌ Ne pas supprimer le système mock avant validation complète en production

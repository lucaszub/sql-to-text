# Skill : Intégration LLM — Snowflake Cortex AI

## Principe

Pas de Claude API externe. Le LLM tourne **dans Snowflake** via Cortex AI.
Tout passe par une seule connexion Snowflake — le AI et l'exécution SQL sont colocalisés.

## Architecture Cible

```
User Input (FR/EN)
      ↓
POST /api/cortex/analyst          →  Snowflake Cortex Analyst
  (question + semantic model)        (LLM interne Snowflake)
      ↓                               ↓
  SQL généré  ←──────────────────────┘
      ↓
Snowflake execute SQL              →  rows + columns + duration
      ↓
QueryResult                        →  Explorer page (inchangée)
```

## Option 1 — Cortex Analyst (Recommandé pour NL→SQL)

API REST Snowflake dédiée NL→SQL avec semantic model.

```typescript
// app/api/cortex/analyst/route.ts
export async function POST(req: Request) {
  const { question, conversationHistory } = await req.json();

  const response = await fetch(
    `https://${process.env.SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/api/v2/cortex/analyst/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getSnowflakeToken()}`,
        "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
      },
      body: JSON.stringify({
        messages: [
          ...(conversationHistory ?? []),
          { role: "user", content: [{ type: "text", text: question }] },
        ],
        semantic_model_file: "@MY_DB.MY_SCHEMA.MY_STAGE/semantic_model.yaml",
        // OU inline :
        // semantic_model: SEMANTIC_MODEL_YAML,
      }),
    }
  );

  const data = await response.json();
  // data.message.content = [{ type: "text", text: "..." }, { type: "sql", statement: "SELECT ..." }]
  const sqlBlock = data.message.content.find((c: { type: string }) => c.type === "sql");
  const textBlock = data.message.content.find((c: { type: string }) => c.type === "text");

  return Response.json({
    sql: sqlBlock?.statement ?? "",
    naturalAnswer: textBlock?.text ?? "",
  });
}
```

## Option 2 — CORTEX.COMPLETE() (Flexible, modèle au choix)

Pour des usages custom (pas seulement NL→SQL).

```sql
-- Directement dans Snowflake SQL
SELECT SNOWFLAKE.CORTEX.COMPLETE(
  'llama3.1-70b',   -- ou 'mistral-large', 'mixtral-8x7b', 'snowflake-arctic'
  CONCAT(
    'Tu es un expert SQL Snowflake. Génère uniquement le SQL pour : ',
    :user_question
  )
) AS generated_sql;
```

```typescript
// Via Snowflake SDK dans une route Next.js
const result = await snowflakeConnection.execute({
  sqlText: `SELECT SNOWFLAKE.CORTEX.COMPLETE(?, ?) AS sql_result`,
  binds: ['llama3.1-70b', `Génère SQL pour: ${question}`],
});
```

## Semantic Model YAML (Cortex Analyst)

Fichier à créer et uploader sur un stage Snowflake. Décrit les tables pour que le LLM comprenne le schéma.

```yaml
# semantic_model.yaml
name: E-Commerce Data Model
tables:
  - name: ORDERS
    description: "Commandes clients"
    base_table: { database: MY_DB, schema: RETAIL, table: ORDERS }
    dimensions:
      - name: order_id
        expr: ORDER_ID
        data_type: VARCHAR
        description: "Identifiant unique de la commande"
      - name: customer_name
        expr: CUSTOMER_NAME
        data_type: VARCHAR
      - name: status
        expr: STATUS
        data_type: VARCHAR
        description: "Statut: Completed, Pending, Refunded, Cancelled, Processing"
      - name: payment_status
        expr: PAYMENT_STATUS
        data_type: VARCHAR
    time_dimensions:
      - name: order_date
        expr: ORDER_DATE
        data_type: DATE
    measures:
      - name: total_amount
        expr: TOTAL_AMOUNT
        data_type: FLOAT
        description: "Montant total en USD"
        default_aggregation: sum

  - name: PRODUCTS
    description: "Catalogue produits"
    base_table: { database: MY_DB, schema: RETAIL, table: PRODUCTS }
    dimensions:
      - name: name
        expr: NAME
        data_type: VARCHAR
      - name: category
        expr: CATEGORY
        data_type: VARCHAR
    measures:
      - name: price
        expr: PRICE
        data_type: FLOAT
      - name: stock
        expr: STOCK
        data_type: INTEGER
```

## Fichiers à Créer lors de l'Intégration

```
app/
├── api/
│   ├── cortex/
│   │   └── analyst/route.ts      → Cortex Analyst REST call
│   └── snowflake/
│       └── query/route.ts        → Execute SQL + retourner QueryResult
└── lib/
    ├── snowflake-client.ts       → Connexion Snowflake (SDK gosnowflake ou snowflake-sdk)
    └── query-engine.ts           → Orchestration : Cortex → SQL → Execute → QueryResult
```

## Connexion Snowflake (Node SDK)

```typescript
// lib/snowflake-client.ts
import snowflake from "snowflake-sdk";

const connection = snowflake.createConnection({
  account:   process.env.SNOWFLAKE_ACCOUNT!,
  username:  process.env.SNOWFLAKE_USER!,
  password:  process.env.SNOWFLAKE_PASSWORD!,
  // OU authenticator: "SNOWFLAKE_JWT" pour key pair (recommandé Cortex Analyst)
  database:  process.env.SNOWFLAKE_DATABASE!,
  schema:    process.env.SNOWFLAKE_SCHEMA!,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
});

export async function executeQuery(sql: string): Promise<{ columns: string[], rows: Record<string, unknown>[] }> {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      complete: (err, _stmt, rows) => {
        if (err) return reject(err);
        const columns = Object.keys(rows?.[0] ?? {});
        resolve({ columns, rows: rows ?? [] });
      },
    });
  });
}
```

## Variables d'Environnement

```bash
# .env.local — ne jamais committer
SNOWFLAKE_ACCOUNT=xxxxx.snowflakecomputing.com
SNOWFLAKE_USER=...
SNOWFLAKE_PASSWORD=...           # ou SNOWFLAKE_PRIVATE_KEY pour JWT
SNOWFLAKE_DATABASE=...
SNOWFLAKE_SCHEMA=...
SNOWFLAKE_WAREHOUSE=...
SNOWFLAKE_ROLE=...               # optionnel
```

## Migration Mock → Cortex — Étapes

1. Créer `lib/snowflake-client.ts` + `lib/query-engine.ts`
2. Créer `api/cortex/analyst/route.ts`
3. Créer `api/snowflake/query/route.ts`
4. Dans `explorer/page.tsx`, remplacer `runDemoQuery(query)` par :
   ```typescript
   const { sql, naturalAnswer } = await fetch("/api/cortex/analyst", {
     method: "POST", body: JSON.stringify({ question: query })
   }).then(r => r.json());
   const result = await fetch("/api/snowflake/query", {
     method: "POST", body: JSON.stringify({ sql })
   }).then(r => r.json());
   ```
5. `QueryResult` interface reste **identique** — la page Explorer ne change pas

## Modèles Cortex Disponibles

| Modèle | Usage recommandé |
|--------|-----------------|
| `snowflake-arctic` | SQL generation (optimisé Snowflake) |
| `llama3.1-70b` | Qualité élevée, bon pour NL complexe |
| `llama3.1-8b` | Rapide, pour questions simples |
| `mistral-large` | Bon équilibre qualité/vitesse |

## Anti-Patterns

- ❌ Ne jamais appeler Cortex depuis le Client Component — toujours via `/api/`
- ❌ Ne pas hardcoder les credentials Snowflake dans le code
- ❌ Ne pas modifier `QueryResult` interface — adapter la réponse Cortex au contrat existant
- ❌ Ne pas supprimer le mock avant que Cortex soit validé en prod
- ❌ Ne pas utiliser `CORTEX.COMPLETE()` pour du NL→SQL si Cortex Analyst est disponible — il est plus précis car il connaît le schema via le semantic model

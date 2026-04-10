# CLAUDE.md — Racine du Projet

> Index minimal. Chaque sous-dossier a son propre CLAUDE.md. Ne pas dupliquer d'informations ici.

## Projet

**sql-to-text** — POC de Natural Language → SQL sur Snowflake, avec UI Next.js.
Stack : Next.js 16 · React 19 · TypeScript 5 strict · Tailwind v4 · Base UI · Shadcn

## Structure

```
sql-to-text/
├── app/          → Application Next.js  →  voir app/CLAUDE.md
├── .claude/skills/  → Fichiers de compétences domaine-spécifiques
├── MAQUETTE_PLAN.md → Spec UX de référence (maquette visuelle)
└── image.png / image1.png → Références visuelles (ne pas supprimer)
```

## Règle Globale Unique

**Avant toute modification structurelle** (nouvelle page, nouveau composant, changement d'architecture), charge le skill correspondant depuis `.claude/skills/` via `app/CLAUDE.md`.

## Prochains Modules Attendus

Quand un nouveau dossier arrive (ex: `api/`, `db/`, `scripts/`), créer immédiatement un `{dossier}/CLAUDE.md` minimal qui pointe vers les skills pertinents. Ne jamais gonfler ce fichier racine.

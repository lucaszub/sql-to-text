# Skill : Tests Visuels & Debug avec Playwright

## Principe Fondamental

**Playwright est l'outil de validation visuelle principal de ce projet.**
Toute modification de style, layout, ou comportement interactif doit être validée par screenshot avant d'être considérée comme terminée.

## Setup Environnement (WSL/Linux sans sudo)

Le navigateur Chromium nécessite des libs système. Setup one-shot :

```bash
# 1. Télécharger les libs manquantes (sans sudo)
cd /tmp
apt-get download libnspr4 libnss3 libatspi2.0-0t64 libglib2.0-0t64
for f in *.deb; do dpkg -x "$f" /tmp/chrome_libs/; done

# 2. Variables d'env pour toute commande Playwright
export LIBPATH="/tmp/nspr_libs/usr/lib/x86_64-linux-gnu:/tmp/chrome_libs/usr/lib/x86_64-linux-gnu"
export LD_LIBRARY_PATH="$LIBPATH"

# 3. Chemin headless shell
CHROME="/home/cgi/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell"
```

## Script Réutilisable — Screenshot d'une Page

```javascript
// Depuis app/ avec LD_LIBRARY_PATH configuré
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/cgi/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
    env: { ...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });  // Viewport standard projet

  await page.goto('http://localhost:3000{ROUTE}');
  await page.waitForTimeout(2000);   // Attendre hydration React
  await page.screenshot({ path: '/tmp/screenshot-{nom}.png' });

  await browser.close();
  console.log('done');
})().catch(e => console.error(e.message));
```

## Workflows Playwright par Cas d'Usage

### 1. Valider un changement de style (pattern standard)

```bash
# Étape 1 : screenshot avant (sauvegarder)
# Étape 2 : modifier le code
# Étape 3 : screenshot après
# Étape 4 : comparer visuellement avec image.png ou image1.png
# Étape 5 : si OK → conserver, si régresssion → revenir
```

### 2. Tester la table avec données chargées

```javascript
await page.goto('http://localhost:3000/explorer?q=Top%2010%20commandes%20r%C3%A9centes');
await page.waitForTimeout(4000);  // ← 4s pour simuler le délai LLM mock
```

### 3. Tester la sélection de lignes (bulk action bar)

```javascript
await page.goto('http://localhost:3000/explorer?q=Top%2010%20commandes');
await page.waitForTimeout(4000);
const checkboxes = await page.locator('tbody input[type=checkbox]').all();
await checkboxes[0].click();
await checkboxes[1].click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/screenshot-bulk.png' });
```

### 4. Tester les actions au hover (boutons Pencil/Trash/More)

```javascript
const rows = await page.locator('tbody tr').all();
await rows[2].hover();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/screenshot-hover.png' });
```

### 5. Tester le filtre par statut

```javascript
await page.click('button:has-text("Pending")');
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/screenshot-filter-pending.png' });
```

### 6. Tester la navigation sidebar

```javascript
await page.click('a[href="/history"]');
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/screenshot-history.png' });
```

## Commande One-liner pour Debug Rapide

```bash
# Depuis /home/cgi/sql-to-text/app/
LIBPATH="/tmp/nspr_libs/usr/lib/x86_64-linux-gnu:/tmp/chrome_libs/usr/lib/x86_64-linux-gnu" \
LD_LIBRARY_PATH="$LIBPATH" \
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({
    executablePath: '/home/cgi/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
    env: { ...process.env, LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH },
    args: ['--no-sandbox'],
  });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1280, height: 800 });
  await p.goto('http://localhost:3000');
  await p.waitForTimeout(2000);
  await p.screenshot({ path: '/tmp/debug.png' });
  await b.close();
  console.log('→ /tmp/debug.png');
})();" 2>&1
```

## Référence Visuelles à Comparer

| Page | Référence | Points critiques |
|------|-----------|-----------------|
| Home `/` | `image1.png` | Gradient pastel lavande, cards glassmorphism, texte sombre |
| Explorer `/explorer` | `image.png` | KPIs 4 colonnes, avatars initiales colorées, filtres tabs, bulk bar, pagination |

## Quand Utiliser Playwright (Obligatoire)

- ✅ Tout changement de gradient/couleur sur la home
- ✅ Tout changement de layout (proportions sidebar/chat/table)
- ✅ Toute nouvelle feature interactive (nouveau bouton, filtre, modal)
- ✅ Avant de déclarer une tâche terminée si elle touche l'UI
- ✅ Debug d'un composant dont le rendu est incertain

## Anti-Patterns

- ❌ Ne pas déclarer un style "correct" sans screenshot de validation
- ❌ Ne pas supposer que le rendu React correspond à l'intention CSS — toujours vérifier
- ❌ Ne pas oublier les 4s de délai pour les pages avec mock LLM (le loading state doit se résoudre)
- ❌ Ne pas utiliser `fullPage: true` pour les comparaisons de layout — utiliser le viewport standard 1280×800

# Portfolio de Melvyn Philippon

## Phase 1 — Installation

Socle minimal Astro et Tailwind CSS, installé à la racine du dépôt existant. Bun remplace npm à la demande de l’utilisateur. Aucun thème, aucune connexion PocketBase et aucun composant du portfolio à ce stade.

### Prérequis et installation

Node.js >= 22.23.4 et Bun 1.4.2. Environnement utilisé : Node.js 24.17.0 et Bun 1.4.2. Astro 7.4.7 et Tailwind CSS 4.3.5.

```sh
bun install --frozen-lockfile
bun run dev
```

Ouvrir l’URL affichée dans le terminal (habituellement http://localhost:4321). La page temporaire doit présenter un fond sombre, un encadré, un titre blanc et une pastille verte. Réduire la largeur pour vérifier l’adaptation du titre et des espacements. Arrêter le serveur avec Ctrl+C.

**Utiliser `bun run dev`, sans `--bun`.** Bun gère les dépendances et les commandes ; Astro s’exécute avec Node.js. Le moteur Bun 1.4.2 ne prend pas en charge l’appel WASI `initialize` utilisé par le paquet WebAssembly de Rolldown.

```sh
bun run build
bun run preview
```

`build` génère le site statique dans `dist/`. `preview` permet de consulter ce résultat à l’URL indiquée dans le terminal.

### Configuration

- `astro.config.mjs` : configuration JavaScript d’Astro et plugin Vite Tailwind.
- `src/styles/global.css` : import Tailwind CSS, chargé dans la page temporaire.
- `src/pages/index.astro` : unique page de vérification.
- `.env.example` : emplacement de `POCKETBASE_URL`, à compléter dans un fichier `.env` en phase 2. Aucun identifiant superuser nécessaire pour les contenus publics.
- `bun.lock` : versions verrouillées, à conserver.

Configuration Tailwind conforme au [guide officiel Astro](https://tailwindcss.com/docs/installation/framework-guides/astro), avec `@tailwindcss/vite` et `@import "tailwindcss"`.

### Git et données existantes

Aucun commit, ajout à l’index ni push effectué par Codex. Les fichiers PocketBase existants sont préservés.

**À corriger par le propriétaire du dépôt :** `pb_data/` est déjà suivi par Git dans l’état initial. Le `.gitignore` empêche l’ajout de nouveaux fichiers ignorés mais ne retire pas les fichiers déjà suivis. Retirer personnellement ce dossier du suivi Git en conservant la copie locale avant le prochain commit. Cette installation ne modifie ni l’index ni l’historique.

Ne pas versionner `.env`, `node_modules/`, `pb_data/` ou les sauvegardes de la base.

## Suite

La phase 2 nécessite une autorisation explicite après test et commit par le propriétaire. Elle comprendra l’intégration Figma, la connexion REST PocketBase et les documents `IA.md`, `JOURNAL.md` et `QUALITE.md`, avec les actions réellement réalisées pendant l’installation.

### Trace de l’installation — 7 novembre 2026

Vérification du dépôt, de Node.js et de npm ; création manuelle du socle Astro sans initialisation Git ; première installation avec npm, puis passage à Bun 1.4.2 à la demande de l’utilisateur, suppression du verrou npm au profit de `bun.lock`. Création de la configuration Tailwind, de la page temporaire, du `.gitignore`, du modèle d’environnement et de ce README. Aucune modification des collections ou données PocketBase.

### Résultat des vérifications

- Installation Bun terminée ; verrou `bun.lock` généré. Installation avec `--frozen-lockfile` vérifiée après correction.
- Blocage initial identifié : Windows refuse le module natif Rolldown avec `ERR_DLOPEN_FAILED`. Une réinstallation forcée n’a pas résolu le problème.
- Correction : ajout de la variante officielle `@rolldown/binding-wasm32-wasi` 1.3.0. Rolldown la charge automatiquement si le module natif n’est pas disponible, conformément à sa [documentation](https://rolldown.rs/guide/getting-started). Aucun réglage de sécurité Windows modifié.
- Le paquet est référencé par l’URL de son archive officielle sur le registre npm afin que Bun 1.4.2 l’installe sur Windows. Une référence ordinaire à sa version était ignorée par Bun à cause de son architecture `wasm32`.
- `bun run build` : réussi, page statique et feuille CSS produites dans `dist/`.
- `bun run dev` : serveur démarré ; accueil HTTP 200, texte UTF-8 et génération des classes Tailwind `bg-slate-950` et `text-emerald-300` vérifiés par requêtes HTTP.
- `bun run preview` : démarrage et réponses HTTP 200 de l’accueil et du CSS de production vérifiés.
- `bun run --bun build` : incompatible avec ce chargement WASI (`wasi.initialize is not a function`). Lancer les scripts sans `--bun`.
- Un avertissement Node.js signale le caractère expérimental de WASI ; il n’empêche pas la construction ou le démarrage.
- Inspection visuelle dans le navigateur non effectuée : outils de navigateur indisponibles pendant cette session. Vérification manuelle du rendu à effectuer avec les étapes ci-dessus.

# Portfolio de Melvyn Philippon

## Développement

```sh
bun ci
bun run --bun dev
```

Commandes et tests exécutés avec Bun (version de référence : `bun@1.4.2`). `bun run --bun build` utilise le runtime Bun, y compris sous Windows. Le binding WebAssembly de Rolldown existant reste conservé ; aucune dépendance supplémentaire n’est ajoutée.

Copier `.env.example` vers `.env` si nécessaire. PocketBase doit répondre à `POCKETBASE_URL` (`https://pb.melvyn-philippon.fr` en production, ou une instance locale pour le développement). Le site lit uniquement l’API publique ; il ne crée ni ne modifie de données. Voir [POCKETBASE.md](POCKETBASE.md) pour les champs et les règles d’accès.

## Organisation

Le site utilise Astro, Tailwind CSS et JavaScript natif. La présentation validée le 11 novembre 2026 est conservée pendant la refactorisation décrite dans [REFACTOR.md](REFACTOR.md).

- `src/pages/` : pages, routes et scripts locaux placés en bas des pages Astro.
- `src/components/` : éléments réutilisables et fragments de présentation.
- `src/scripts/` : menu plein écran, contraste du header et raccord de navigation, communs aux pages.
- `src/lib/` : lecture PocketBase, traitement des contenus et calcul du contraste communs.
- `src/styles/global.css` : entrée Tailwind, couleurs et polices uniquement. Les utilitaires de mise en page, états et variantes responsive sont directement dans les attributs `class` des fichiers Astro. Les keyframes et transitions natives sont définies dans les composants Astro concernés.
- `src/assets/` : photographies sources traitées par Astro, sans copie brute inutile dans le dossier public.
- `public/` : favicon blanc, logo, portrait de partage et polices WOFF2 avec leurs licences.
- `tests/` : tests de comportement et de construction ; `tests/helpers/page-scripts.js` extrait les vrais scripts des pages.

Les projets publiés sont triés par `ordre,id`. L’accueil présente les trois premiers ; la page Projets les présente tous. Les compétences sont triées par titre, car cette collection n’expose pas de champ `ordre` sur l’instance actuelle. Les contenus détaillés et la galerie sont lus directement dans `Projets` ; l’ancienne collection `sections_projet` n’est plus utilisée.

## Navigation et animations

Le logo permet de revenir à l’accueil. Le menu commun utilise un `dialog` natif, avec focus, fermeture par Échap et raccord animé entre les pages. Une navigation de secours reste disponible sans JavaScript. Le header adapte indépendamment le contraste du logo et du bouton de menu au fond visible.

Le carrousel d’accueil suit le scroll vertical sur ordinateur et reste horizontal natif sur mobile. Le bilan rouge est une section séparée. Les noms des savoirs et outils apparaissent et disparaissent dans une zone fixe pilotée par le scroll.

La galerie Projets boucle verticalement dans les deux sens et avance automatiquement toutes les sept secondes, avec les animations et la synchronisation des textes conservées. L’automatisme est suspendu dans un onglet masqué, hors écran, pendant une manipulation tactile, dans les filtres ou pendant le focus clavier. La touche Espace permet de le mettre en pause et de le reprendre. Les copies de raccord sont retirées du parcours clavier et masquées aux lecteurs d’écran. Les filtres se ferment par Échap, clic extérieur ou sélection.

Les préférences de réduction du mouvement sont respectées. Les images hors écran sont différées ; les images d’entrée restent prioritaires. Leurs variantes ne dépassent pas leur résolution source et la qualité de compression est conservée. Les pages projet éliminent les fichiers identiques, y compris renommés, sans modifier PocketBase. La couverture garde la transition native partagée avec sa carte.

## Contact et configuration

Le formulaire prépare un brouillon dans la messagerie du visiteur ; le message doit être envoyé depuis cette messagerie. Les coordonnées directes, notamment l’adresse e-mail, restent accessibles sans JavaScript. Le numéro de téléphone reste du texte simple.

Configurer `CONTACT_EMAIL`, les URL sociales et `CV_URL` dans `.env`. Les réseaux sans URL et le lien de CV non renseigné restent masqués. `SITE_URL` doit être l’origine HTTPS publique et est obligatoire pour construire le site. Elle alimente Astro, les URL canoniques, les cartes de partage et le sitemap. Une valeur vide n’est acceptée qu’en développement, où `robots.txt` bloque alors l’exploration. Le `.env` du VPS est indépendant du `.env` local.

## Vérifications et production

```sh
bun run test
bun run --bun build
bun run check:seo
bun run --bun preview
```

`dist/` contient le site statique. Une modification de PocketBase nécessite une nouvelle compilation pour la production. Les tests utilisent des enregistrements synthétiques isolés et ne modifient pas la base.

La validation HTML, les références ARIA, les ressources et les tests automatisés complètent les contrôles manuels ; ils ne constituent pas une certification RGAA. Les limites de vérification et les mesures avant/après sont consignées dans `REFACTOR.md`.

Ne pas versionner `.env`, `node_modules/` ni `pb_data/`. Le propriétaire conserve la gestion de Git et du déploiement. Aucun commit, push ou déploiement n’est effectué par cette refactorisation.

## Référencement et serveur

Voir [SEO.md](SEO.md) pour l’audit réalisé, les métadonnées et JSON-LD intégrés au layout Astro, les validations et les actions manuelles Apache/Search Console. [L’exemple Apache](docs/apache/portfolio.conf.example) reste séparé du site : il ne doit pas être copié en remplacement d’une configuration partagée. Le workflow prépare et vérifie un build de staging avant de remplacer `dist`. Aucun de ces changements n’a été déployé par Codex.

Les corrections et vérifications des diagnostics Astro/Tailwind sont détaillées dans [DIAGNOSTICS.md](DIAGNOSTICS.md). Les règles de validation de l’éditeur restent actives.

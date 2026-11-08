# Portfolio de Melvyn Philippon

## Lancer le site

```sh
bun install --frozen-lockfile
bun run dev
```

PocketBase doit répondre sur `http://127.0.0.1:8090`. Copier `.env.example` vers `.env` si nécessaire. Utiliser `bun run dev`, sans `--bun` : Astro utilise Node.js et le binding WebAssembly de Rolldown installé pour cet environnement Windows. Node.js >= 22.23.4 est requis.

## Référence visuelle

La version actuelle reprend la maquette Figma d’origine **Desktop-apres**, page `725:603` du fichier `wpBtuvgjb9jYIQHbMeLlqI`. Les cinq écrans ont été consultés de nouveau le 8 novembre 2026 : Accueil, Projets, À propos, modèle de projet et Contact. Les refontes expérimentales et leurs scripts/styles ont été retirés. Aucun asset de capture d’écran n’est utilisé comme page du site.

Le site utilise Astro, Tailwind CSS et JavaScript natif. Les couleurs, polices locales Barlow Condensed et Inter et colonnes 61/39 viennent de la maquette. Le header commun est désormais transparent et superposé au contenu, avec logo à gauche et menu hamburger à droite sur toutes les tailles d’écran. À la demande du propriétaire, le footer est sans portrait : cinq colonnes sur fond sombre, séparateurs fins et nom compact dans la première colonne. Les pages s’adaptent aux petits écrans.

## Organisation

- `src/pages/` : pages et routes dynamiques des projets.
- `src/layouts/BaseLayout.astro` : structure HTML, métadonnées et éléments communs.
- `src/components/` : header, footer, boutons, carrousels et sections de projet.
- `src/lib/pocketbase.js` : API publique, pagination, publication et relations.
- `src/lib/content.js` : contenus Text/Editor, URL et dispositions de section.
- `src/lib/contact-form.js` : préparation d’un lien e-mail depuis le formulaire.
- `src/styles/global.css` et `contact-form.css` : styles de la maquette et adaptations mobiles.
- `public/` : ressources locales et licences des polices.

Les projets et savoirs publiés sont lus dans PocketBase. Les sections sont filtrées par projet et triées par `ordre,id`. Leurs titres et leur nombre ne sont pas imposés par le code. Les compétences sont reliées au projet ; le bloc rouge de l’accueil reprend le texte de la maquette. Les compétences sont triées par titre, car cette collection n’expose pas de champ `ordre` dans la base actuelle. Voir `POCKETBASE.md`.

## Galerie des projets

La galerie verticale boucle dans les deux sens : après le dernier projet, le premier arrive par le bas. Le défilement automatique garde toujours ce sens, toutes les sept secondes. Les copies visuelles du raccord sont exclues de la navigation clavier et des lecteurs d’écran ; les filtres reconstruisent la boucle avec les seuls projets sélectionnés.

`/projets/` reprend la composition du PDF « Desktop - 1 » fourni par le propriétaire : images défilantes verticalement à gauche, titre et texte du projet centré à droite. Le contenu de droite suit le projet actif. Le bouton rouge « Filtrer les projets » est visible et ouvre un panneau fermé au chargement, alimenté par les domaines PocketBase. Sur mobile, les informations passent sous la galerie. Les filtres utilisent un élément `details` natif, avec fermeture par Échap, clic extérieur ou choix d’une action. Le menu hamburger ouvre un `dialog` natif plein écran : navigation typographique en escalier sur toute la largeur, sans image, ouverture et fermeture animées. Le dialogue gère le focus et bloque l’accès à la page derrière ; le scroll est verrouillé jusqu’à sa fermeture. Le bouton Fermer, Échap et les liens permettent de sortir du menu. Les préférences de mouvement réduit sont respectées.

Les cartes rectangulaires verticales sont dans le carrousel horizontal de l’accueil, à l’emplacement de l’ancienne sélection de projets. Un même script natif gère les deux axes. La page Projets n’affiche plus de commandes Précédent/Suivant/Auto ni de barre de défilement. Elle avance automatiquement toutes les sept secondes et reprend sept secondes après une action à la molette. L’animation de 1,4 seconde utilise un seul pilote requestAnimationFrame, avec accélération puis ralentissement ; le texte sort et entre pendant le passage de l’image. Les impulsions d’une même molette ne redémarrent pas le mouvement.

L’automatisme est suspendu hors écran, dans un onglet masqué, pendant la manipulation tactile, quand les filtres sont ouverts ou lors d’un focus clavier. Le mouvement réduit est respecté. Avec un seul projet publié, aucun contenu supplémentaire n’est simulé. La galerie verticale accepte la molette, le glissement et les flèches haut/bas ; le carrousel d’accueil conserve le défilement vertical normal de la page et ses commandes de navigation horizontale.

La couverture utilise une transition native partagée entre la carte et la page du projet sur les navigateurs compatibles. Un fondu de départ sert de repli pour les autres navigateurs. Les liens HTML restent utilisables sans JavaScript. Le footer commun reste inchangé sur les autres pages.

## Contact et liens à compléter

Le formulaire prépare un e-mail dans la messagerie du visiteur ; il ne transmet pas de message à un serveur et n’annonce pas un envoi réussi. Le visiteur doit envoyer le brouillon depuis sa messagerie. Sans JavaScript, le formulaire utilise son action `mailto:` native et les coordonnées directes restent accessibles.

Configurer `CONTACT_EMAIL`, les URL sociales et `CV_URL` dans `.env`. Le CV reste désactivé tant que son URL HTTPS n’est pas fournie. Les profils sociaux sans URL sont affichés sans lien inventé. `SITE_URL` active les URL canoniques, le sitemap et l’indexation ; sans domaine configuré, le site reste non indexable.

## Vérifications et production

```sh
bun run test
bun run build
bun run preview
```

`dist/` contient le site statique. Une modification dans PocketBase nécessite une nouvelle compilation pour la production. Les tests ne modifient pas la base. La compilation et les contrôles HTTP passent ; le contrôle visuel dans un navigateur reste à effectuer, les outils de navigateur étant indisponibles dans cette session.

Aucune modification de schéma ou de contenu PocketBase, aucun ajout à l’index, commit, push ou déploiement effectué par Codex. Le propriétaire conserve la gestion de Git. Ne pas versionner `.env`, `node_modules/` ni `pb_data/` ; ce dernier était déjà suivi dans l’état initial et doit être retiré du suivi par le propriétaire en conservant sa copie locale.

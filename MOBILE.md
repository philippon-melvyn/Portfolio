# Mobile et palette — 13 novembre 2026

## Changements

Le hero d’accueil conserve son glissement horizontal sur une fenêtre d’au moins **900 px de large**, y compris lorsqu’elle est basse. En dessous de cette largeur, le nom est présenté entier sur deux lignes, puis la texture occupe une zone de pleine largeur. Il n’y a plus de découpage latéral ni de longue réserve de scroll dans ce mode. Le nom et la photographie ont une entrée légère ; sur une fenêtre basse, le nom et les espacements se réduisent selon la hauteur disponible. La transition entre les deux présentations nettoie les transformations, tout en conservant les révélations de texte et la préférence de mouvement réduit.

Sur Contact, la photographie est limitée à un bandeau lorsque la largeur est inférieure à 900 px. Les informations commencent sous ce bandeau au lieu de passer derrière l’image. Les panneaux deviennent défilables quand le contenu dépasse, y compris en fenêtre basse. Le formulaire reste accessible avec un clavier virtuel qui réduit la hauteur ; ses champs font au moins 44 px et utilisent un texte de 16 px sur petit écran ou avec un pointeur tactile. Les très petits écrans empilent les champs en une colonne.

Sur Projets, la hauteur du panneau de description s’adapte à la hauteur disponible et le texte peut défiler. Sa molette n’est plus interceptée par le carrousel lorsqu’il déborde. Le geste tactile suspend l’automatisme, puis le délai repart après l’interaction. Les titres sont remis en haut du panneau au changement de projet. Les filtres gardent une cible tactile d’au moins 44 px.

Le carrousel de l’accueil reste horizontal natif sous 900 px et conserve son effet de défilement sur ordinateur. Les mots des savoirs/outils reviennent à une liste lisible si la hauteur est inférieure à 480 px. Les autres pages conservent leurs grilles responsive et leur contenu.

## Palette commune

Les couleurs de l’interface sont définies uniquement dans `src/styles/global.css` :

| Rôle | Couleur |
| --- | --- |
| Rouge | `#a33333` |
| Gris foncé | `#14161d` |
| Fond clair | `#fafaf8` |
| Texte secondaire sur fond clair | `#686b73` |
| Texte secondaire sur fond foncé | `#b8bbc3` |

L’ancien accent est un alias du même rouge. Les séparations et surfaces translucides dérivent de ces couleurs. Les valeurs dispersées ont été remplacées par des références au thème dans les classes Astro et les rideaux de navigation partagés. Les flèches héritent de la couleur du lien, y compris au survol. Les photographies et les visuels des projets ne sont pas recolorés.

## Vérifications réalisées

- **48 tests réussis** avec Bun, dont le mode compact du hero et son retour au bureau, les faibles hauteurs des outils, la lecture du texte de la galerie et les contrastes des principales paires texte/fond (au moins 4,5:1).
- Construction statique de production réussie, audit SEO réussi sur les 12 pages de contenu et les neuf URL indexables.
- Analyse Astro : zéro erreur et zéro avertissement ; les suggestions informatives d’inférence ne sont pas masquées.
- Audit des règles CSS compilées : **362 contrôles ciblés**, sans erreur, sur 11 pages accessibles dans dix formats : 320×568, 375×667, 390×844, 430×932, 768×1024, 844×390, 960×540, 1024×600, 1024×768 et 1440×900. L’audit distingue les pointeurs tactiles et précis.
- Vérification des modes du hero, des colonnes de projet, de l’accès aux panneaux Contact/Projets, des tailles du formulaire et du bouton des filtres. Le rapport détaillé reste dans `.astro/mobile-css-report.json`, ignoré par Git.
- Les routes locales et les ressources ont été contrôlées, sans envoi du formulaire ni écriture PocketBase. Aucune fonctionnalité de contact ne transmet automatiquement un message.

## Limites et contrôle sur appareil

L’inventaire du navigateur a échoué : accès natif et hôte du navigateur indisponibles. Les contrôles ci-dessus sont des tests de logique et une analyse statique du CSS, **pas un rendu visuel dans un navigateur ou une validation sur téléphone réel**. Aucun score Lighthouse ou Core Web Vitals réel n’est revendiqué.

À contrôler sur Safari/Chrome mobiles après ouverture du site : nom entier et cadrage de la texture, rotations portrait/paysage, ouverture/fermeture du menu et des filtres, balayage des galeries, lecture des descriptions, formulaire avec clavier ouvert et retour aux coordonnées. Tester aussi le mouvement réduit et l’agrandissement du texte. La présence des dimensions responsive dans le code ne suffit pas à certifier ces comportements sur tous les appareils.

Aucun commit, push ou déploiement effectué. La commande de développement avec `--force` préparée précédemment est conservée.

## 14 novembre 2026 — Galeries horizontales sur mobile

Sous 900 px, la galerie Projets utilise désormais le défilement horizontal natif avec alignement des cartes. La page défile verticalement normalement, les descriptions restent lisibles et un lien « Voir le projet » est accessible. Le mode mobile ne crée pas de copies de raccord, ne lance pas de lecture automatique et n’intercepte pas la molette verticale. Le changement de format conserve le projet sélectionné ; le mode vertical du bureau reste actif à partir de 900 px.

L’accueil et Projets partagent un aperçu de la carte suivante, l’indication « Glissez pour découvrir » et un compteur synchronisé. Les touches gauche/droite permettent également de parcourir les cartes mobiles. Le hero de l’accueil reste inchangé.

Vérifications : 54 tests Bun réussis, build de production réussi, audit SEO réussi et analyse Astro sur 20 fichiers sans erreur ni avertissement (45 suggestions informatives). Un audit des styles compilés réalise 76 contrôles sans erreur sur six formats, de 320 × 568 à 1440 × 900, notamment autour du seuil de 900 px. Les rapports restent dans `.astro`, ignoré par Git. L’accès au navigateur est toujours indisponible : ces résultats ne constituent pas une validation visuelle ou tactile sur appareil réel.

# Journal de réalisation

## 9 novembre 2026 — Présentation animée de l’accueil

Remplacement limité à la première rubrique de l’accueil par une séquence au scroll. Le nom complet apparaît d’abord ; le trait rouge se déploie, les mots s’écartent et leurs terminaisons s’effacent pour laisser M et P autour du portrait personnel. Les initiales et le trait disparaissent ensuite, laissant le portrait seul, puis celui-ci s’efface à son tour pour révéler les textes Qui suis-je existants. Fond clair, Barlow Condensed et rouge #a33333, sans image décorative supplémentaire.

Animation directement liée à la progression du scroll, réversible, dans une zone sticky ; aucune interception de la molette. Les mesures des textes sont actualisées après chargement des polices et au redimensionnement. Une seule frame par mise à jour et absence d’écriture lorsque la progression n’a pas changé. Sans JavaScript ou avec mouvement réduit, la présentation reste statique et lisible. Les liens de biographie sont exclus du focus tant que ce contenu est masqué. Composition adaptée au mobile.

Validation : compilation de dix pages et 34 tests réussis, dont étapes nom/initiales/portrait/biographie, réversibilité, regroupement des frames et repli accessible. Le reste de l’accueil et les pages approuvées sont conservés. L’aperçu de contrôle reste indisponible ; la composition et le rythme visuel nécessitent une vérification dans le navigateur du propriétaire.

## 8 novembre 2026 — Transition du menu vers la page choisie

Le menu approuvé reste inchangé. Au clic sur un lien interne, un rideau rouge #a33333 monte sur le dialogue pendant 750 ms et reste en place jusqu’à la navigation. Un marqueur de destination temporaire dans sessionStorage permet de poser le même fond avant le premier affichage du document suivant. Après un court délai de décodage du visuel prioritaire (350 ms maximum), le rideau continue vers le haut en 1,05 seconde, avec une entrée discrète du contenu. Pas de changement de route côté client ni de remplacement des pages : la navigation reste native.

Le marqueur est consommé une seule fois, limité à la destination et à douze secondes, et ignoré en mouvement réduit. Repli natif si le stockage est indisponible, protection contre un écran couvert si le module ne charge pas, nettoyage à la sortie de page pour le retour arrière. Les transitions natives des cartes projet sont évitées pendant ce passage spécifique. La croix et Échap conservent leur fermeture existante ; les clics modifiés et les liens externes restent natifs.

Validation : compilation de dix pages, 32 tests réussis, dont destination/expiration, présence du rideau pendant le changement de document et nettoyage au retour. Le fichier Header.astro approuvé est vérifié inchangé. Le rendu animé reste à vérifier dans le navigateur du propriétaire, l’aperçu de contrôle étant indisponible.

## 8 novembre 2026 — Trait latéral du menu

Correction de l’interprétation du survol : le soulignement est supprimé, comme la couleur rouge des intitulés. Les mots restent blancs. Un long trait blanc se déploie à droite du mot, à la place de la flèche. Le déplacement du texte reste conservé. Le décalage en escalier est réduit sur les petits écrans desktop pour laisser la place au trait et garder les mots entiers. Compilation réussie.

## 8 novembre 2026 — Survol du menu sans bandeau

Le rose des intitulés provenait de l’indicateur aria-current de la page active. Tous les intitulés sont désormais blancs, avec conservation de l’information de page active pour les lecteurs d’écran. Suppression du grand aplat rouge au survol : déplacement discret du bloc de texte, entrée de la flèche et petit trait rouge sous le numéro. Taille, disposition en escalier et animation d’ouverture conservées. Modification limitée au style du menu.

## 8 novembre 2026 — Menu agrandi et survol sans découpe

Retrait des textes de bas de menu (e-mail, profils et signature) et du libellé visible Fermer ; la croix conserve un nom accessible. Les quatre liens occupent désormais quatre lignes de hauteur égale sur toute la zone disponible, avec une typographie agrandie et adaptée à la hauteur de fenêtre. Le décalage au survol porte sur le masque complet plutôt que sur le texte à l’intérieur : les lettres ne sortent plus de la zone de découpe. Marges ajoutées autour des glyphes et mots maintenus sur une ligne. Disposition en escalier, aplats rouges, ouverture et fermeture conservés. Compilation de dix pages et 30 tests réussis.

## 8 novembre 2026 — Menu typographique sans image

À la demande du propriétaire, suppression du visuel et de la colonne latérale du menu. Navigation sur toute la largeur avec quatre grandes entrées en escalier, Inter en capitales, numéros rouges et aplats rouges révélés au survol ou au focus. Les titres entrent en décalé avec une légère inclinaison qui se redresse. Le nom compact est déplacé dans la ligne de coordonnées. Composition adaptée aux petits écrans et fenêtres basses. Header fermé, contraste, dialogue accessible et fermeture animée conservés. Préférence à retenir : privilégier les compositions typographiques et éviter d’ajouter des images décoratives aux prochaines rubriques.

Compilation de dix pages et 30 tests réussis. Les pages et le footer approuvés ne sont pas modifiés. L’inspection visuelle des animations reste limitée par l’indisponibilité du navigateur de contrôle.

## 8 novembre 2026 — Menu plein écran

Remplacement du petit panneau par un dialogue natif plein écran : navigation numérotée en grands caractères à gauche (70 %), motif de tissu rouge existant à droite (30 %), coordonnées et profils configurés en bas. Coins droits, fond #101113 et accents de la charte. Sur mobile, la navigation occupe toute la largeur. Le header fermé conserve exactement les dimensions et positions de son logo et de son hamburger.

Ouverture par révélation verticale, titres décalés, léger zoom du motif et fermeture animée avec possibilité d’inverser pendant l’ouverture. Échap, bouton Fermer et liens ferment le dialogue ; les clics modifiés restent natifs. Focus et fond inactif gérés par showModal, scroll verrouillé puis restauré. Préférences de mouvement réduit respectées. Le contraste du header est suspendu derrière le dialogue et recalculé à sa fermeture. Les filtres PocketBase restent des details natifs.

Validation : 30 tests réussis, compilation de dix pages et contrôles HTTP des liens et ressources. Les sources des pages approuvées et du footer sont conservées. Le navigateur de contrôle est toujours indisponible ; la mise en page et les transitions nécessitent une inspection visuelle dans le navigateur du propriétaire.

## 8 novembre 2026 — Header noir ou blanc selon son fond

Suppression du mode de fusion difference. Le logo est rendu avec son SVG comme masque et une couleur explicite noire ou blanche ; le hamburger utilise la même logique. Chaque contrôle évalue indépendamment la luminosité du fond situé derrière lui, en tenant compte des fonds CSS et des images recadrées. Trois points de mesure et une marge de bascule limitent les oscillations sur les photos. Les images sont lues dans un petit canvas local, avec repli sur le fond CSS si une image externe ne permet pas cette lecture.

Mise à jour au scroll, au redimensionnement, au chargement d’images et pendant les transitions, avec regroupement des demandes en une frame et limitation de fréquence. Arrêt hors onglet et à la sortie de page. Couleurs initiales calculées selon la page pour éviter un état incorrect au chargement. Placement, dimensions, liens et comportement du menu conservés. Aucun changement des pages Contact/Projets/À propos, du footer ou des styles partagés.

## 8 novembre 2026 — Alignement de la présentation

Refonte limitée à la première rubrique À propos : surtitre sur sa propre ligne, portrait et introduction centrés verticalement sur une grille stable, nom en titre court et spécialité rouge en sous-titre. Parcours déplacé sous l’introduction et réparti en deux colonnes ouvertes, avec les dates au-dessus des formations. Largeur de lecture et espacements réduits. Sur mobile, la présentation et le portrait se suivent, puis les formations passent en une colonne. Contenus et animations conservés ; Inspirations et Méthode préservées. Compilation de dix pages réussie. La validation visuelle reste à effectuer dans le navigateur du propriétaire.

## 8 novembre 2026 — Animations de la page À propos

Titres révélés ligne par ligne derrière un masque, portrait dévoilé verticalement et étapes de méthode animées élément par élément. Passage temporaire du fond Inspirations du rouge sombre au noir à son entrée dans le viewport. Léger mouvement horizontal du grand titre lié au scroll sur ordinateur, mise à jour regroupée dans une seule frame. Traits rouges courts et déplacement discret des intitulés au survol des lignes de méthode. Mise en page et contenus des trois rubriques conservés.

Les animations sont annulées si le mouvement réduit est activé ou lors de la sortie de page ; aucun contenu n’est caché en attendant JavaScript. Les pages approuvées Contact/Projets et le footer restent protégés par vérification de leurs empreintes. Le navigateur de contrôle reste indisponible ; fluidité visuelle à confirmer dans le navigateur du propriétaire.

## 8 novembre 2026 — À propos en trois compositions typographiques

À partir des captures fournies, remplacement des cartes et grands visuels par trois rubriques continues : introduction asymétrique sur fond clair (portrait réduit à 260 × 320 px maximum, présentation et parcours en texte), inspirations sur fond noir (phrase typographique et paragraphes décalés), méthode sur fond clair (titre latéral et cinq lignes ouvertes). Rouge présent dans les trois rubriques. La photo personnelle est le seul visuel du contenu ; les textures et la parallaxe sont retirées de cette page. Les exemples non utilisés sont réservés à une éventuelle refonte de l’accueil, sans modification de cette page pour l’instant.

Les apparitions individuelles au scroll restent actives, avec respect du mouvement réduit. Les contenus existants sont conservés sous une forme courte ; aucun texte des sites de référence n’est repris. Compilation de dix pages, 23 tests réussis et vérification du HTML : trois sections et une seule image dans main. Empreintes des pages Contact/Projets, du header, du footer et des styles communs inchangées. Le rendu visuel reste à vérifier dans le navigateur du propriétaire, l’aperçu de contrôle étant indisponible.

## 8 novembre 2026 — À propos en grande page au scroll

Correction de la structure demandée : suppression des onglets et de leur script. Les quatre rubriques sont désormais des sections ordinaires, toujours présentes et lisibles à la suite, avec leurs ancres. Portrait en double colonne 46/54, parcours en deux cartes suivi d’un bandeau de texture, inspirations en composition 64/36 et méthode sur fond clair en trois puis deux colonnes. Le footer approuvé reste en fin de page.

Apparitions déclenchées individuellement à l’entrée des blocs dans le viewport et parallaxe légère des images sur ordinateur. Aucun détournement de la molette ; le scroll est celui du navigateur. Sans JavaScript ou en mouvement réduit, tous les contenus restent visibles. Les tests propres aux anciens onglets sont retirés avec cette fonctionnalité. Compilation de dix pages, 23 tests restants réussis et contrôles HTTP concluants. Les fichiers Contact, Projets, Header, Footer et les styles communs sont inchangés. Vérification visuelle toujours limitée par l’indisponibilité du navigateur de contrôle.

## 8 novembre 2026 — À propos en quatre rubriques

Nouvelle présentation en deux colonnes 46/54 : portrait et motifs rouges fournis à gauche, rubriques Profil, Parcours, Inspirations et Méthode à droite. Textes issus du contenu existant, raccourcis en paragraphes courts et blocs rectangulaires. Parcours en deux cartes, inspirations en grille et méthode en cinq étapes. La sélection d’une rubrique synchronise le texte et le visuel : masque vertical sur l’image, apparition décalée des blocs. Images optimisées avec Astro. Sur mobile, le visuel passe au-dessus des rubriques.

Navigation en onglets avec flèches, Début/Fin et prise en charge des liens directs. Sans JavaScript, les quatre rubriques restent lisibles via leurs ancres. Les préférences de mouvement réduit interrompent les animations. Le footer existant reste sous la présentation. Les sources de Contact, Projets, Header, Footer et les styles partagés sont vérifiées inchangées par SHA256.

Validation : compilation Bun de dix pages, 25 tests réussis (dont synchronisation des rubriques/images, clavier, liens directs et mouvement réduit), contrôles HTTP de six pages principales et des ressources. Le navigateur de contrôle est indisponible ; le rendu visuel reste à inspecter dans le navigateur du propriétaire.

## 8 novembre 2026 — Expansion du motif et révélation du formulaire

La transition de Contact agrandit le visuel de 50 % à 100 % de l’écran, puis révèle un panneau gris à gauche par un masque horizontal. Le retour, chaque champ et le bouton apparaissent avec des décalages progressifs. Le retour aux coordonnées replie le panneau avant de réduire le visuel. Retrait du surtitre Contact, du titre visible Votre message et de la note sous le formulaire ; le bouton porte uniquement Envoyer. Le statut de préparation de la messagerie reste disponible pour les lecteurs d’écran, sans message visible ajouté à la page ni simulation d’envoi serveur.

Hauteur de page fixée au viewport, défilement de page bloqué uniquement sur Contact. E-mail et sujet partagent une ligne, zone de message et espacements adaptés à la hauteur disponible, redimensionnement manuel de la zone de texte désactivé. La réduction de mouvement reste respectée. Header, footer et galerie Projets conservés. Le navigateur de contrôle est indisponible dans cette session ; les contrôles de compilation et de structure ne remplacent pas une inspection visuelle.

## 8 novembre 2026 — Contact avec inversion des panneaux

Visuel fixe bord à bord sur la moitié gauche, sur toute la hauteur de l’écran desktop. Le bouton Écrire un message déclenche un glissement horizontal du visuel vers la droite (950 ms, accélération puis ralentissement), dévoilant le formulaire intégré à gauche. Les coordonnées s’effacent à droite. Le bouton Coordonnées et Échap déclenchent le retour inverse. La fenêtre modale est supprimée. Le panneau inactif devient inert et aria-hidden ; le focus accompagne le changement sans défilement. Les champs conservent leur contenu entre les vues. Sur mobile, le visuel reste au-dessus et les contenus se remplacent avec une courte translation verticale. Les préférences de mouvement réduit désactivent les transitions. Header, footer et page Projets préservés.

## 8 novembre 2026 — Contact compact dans la charte de la galerie

Remplacement du tissu par le motif rouge à diagonales fourni (`engin-akyurt-pxA3AcRb0UE-unsplash.jpg`). Fond #101113, titre condensé, grand bloc e-mail rouge, deux blocs pleins téléphone/localisation et bouton blanc rectangulaire. La page affiche uniquement l’essentiel ; le formulaire existant est conservé dans un dialogue natif ouvert sur demande, sans allonger le contenu principal. Le dialogue gère le focus et Échap avec le navigateur ; la préparation d’e-mail existante est maintenue. Les liens de réseaux et le CV n’apparaissent que lorsqu’ils sont configurés. Le visuel reste fixe à gauche sur ordinateur et passe au-dessus sur mobile. Animations d’entrée désactivées en mouvement réduit.

Installation de daisyUI 5 avec Bun, limitée aux composants button/input/textarea/select, classes préfixées `ct-`, thèmes automatiques désactivés et variables rattachées à `#contact-page`, selon https://daisyui.com/docs/config/. Header, footer et galerie Projets conservés. Le footer reste absent sur Contact.

## 8 novembre 2026 — Contact en deux colonnes

Image de tissu rouge choisie parmi les quatre nouveaux motifs fournis : `montylov-HyBXy5PHQR8-unsplash.jpg`. Sur ordinateur, le visuel reste fixe sur la moitié gauche de l’écran ; le formulaire, les réseaux et les coordonnées défilent à droite. Sur mobile, le visuel passe au-dessus des informations. Image optimisée par Astro en WebP avec tailles adaptées. Retrait de l’ancien filigrane et du lien Retour, remplacé par le header commun existant, sans modifier ce composant. La page reste sans footer. Typographie et espacements du contenu compactés uniquement sur Contact. La page Projets et le footer approuvés sont préservés.

## 8 novembre 2026 — Boucle continue de la galerie verticale

Le dernier projet est suivi du premier par le bas, sans retour animé vers le début. Deux bandes de copies visuelles entourent les cartes originales ; une remise en position équivalente, après la transition, permet de continuer dans le même sens. Le texte reste synchronisé, la cadence de sept secondes est conservée et la molette peut aussi boucler vers le haut. Les filtres reconstruisent les bandes ; un seul projet désactive la boucle et l’automatisme. Les copies ne dupliquent ni identifiants, ni noms de transition, ni étapes de navigation clavier ou de lecture accessible. L’accueil conserve son comportement précédent.

Validation : 22 tests réussis, dont plusieurs tours avec deux projets, le raccord vers le haut, une inversion pendant le raccord et les changements de filtre. Compilation Bun réussie (10 pages). Empreinte du footer inchangée. Validation visuelle des mouvements indisponible dans cette session ; les tests simulent les positions et la synchronisation.

## 7 novembre 2026 — Phase 1

Inspection du dépôt PocketBase existant. Vérification de Node.js et npm. Création du socle Astro/Tailwind à la racine. Passage à Bun sur demande du propriétaire. Création d’une page de vérification et de la documentation d’installation.

Premiers lancements bloqués par la stratégie Windows sur le module natif Rolldown. Une réinstallation forcée n’a pas suffi. Le paquet WebAssembly officiel a finalement permis les commandes Astro avec Node.js via `bun run`, sans `--bun`. Build, développement et prévisualisation vérifiés par HTTP. Le serveur de test laissé actif a ensuite été arrêté après signalement du propriétaire.

Le propriétaire a confirmé le fonctionnement et déclaré avoir effectué le commit d’installation. Codex n’a réalisé aucun commit ni push.

## 7 novembre 2026 — Phase 2

Autorisation explicite de poursuivre. Lecture de `Desktop-apres` dans Figma et récupération des références des six écrans. Confirmation des couleurs, polices, proportions de colonnes et éléments communs. Téléchargement des ressources statiques et polices en local.

API PocketBase locale accessible. Les quatre collections sont vides ; ce point a été confirmé par le propriétaire. Lecture seule des champs/règles et des migrations : collection `Projets` avec majuscule, introduction Editor, textes de section Text, fichiers multiples, dispositions avec espaces. Identification des écritures anonymes autorisées par les règles existantes ; correction proposée dans `POCKETBASE.md`, sans application.

Développement des composants communs, de l’accueil, de la page À propos, des pages projets, de Contact, de la 404 et des pages légales à compléter. Mise en place des appels REST, de la pagination, des relations et du modèle de sections variables. Ajout des métadonnées et des endpoints robots/sitemap conditionnés au domaine réel.

Création de tests de données et d’une construction synthétique isolée pour vérifier les pages projet malgré la base vide. Une référence erronée à l’ancien chemin du CLI Astro a été corrigée dans le test. Un contenu de script était conservé comme texte dans les métadonnées ; son retrait a été ajouté à la conversion en texte brut. Les trois tests passent ensuite.

Construction réelle réussie sur la base vide. Vérification HTTP des routes principales, des liens internes, des ressources, de la 404 personnalisée et des endpoints SEO. Le serveur ancien a renvoyé une erreur après ajout de la configuration ; redémarrage effectué et requêtes vérifiées à nouveau. Les outils de navigateur sont indisponibles : aucune validation visuelle ou de console n’est déclarée réussie.

## 7 novembre 2026 — Motifs et animations demandés par le propriétaire

Installation de daisyUI 5.7.50 avec Bun et création d’un thème reprenant la charte existante. Utilisation de ses classes de boutons, navigation, menu et badges. Les styles de base des boutons ont été simplifiés en conservant les ajustements graphiques du portfolio.

Création d’un composant de motifs CSS réutilisable à trois variantes : cercles, trame et plis. Remplacement des aplats décoratifs de l’accueil, de la page À propos, des états vides et de la 404. Retrait de la photo d’architecture de Contact et remplacement par un motif. Le portrait du pied de page est conservé.

Ajout d’apparitions au scroll par `IntersectionObserver`, d’une entrée des grands titres, de fondus de carrousel et de transitions natives entre pages. Prise en compte de la préférence de réduction du mouvement, du focus clavier et du cache de navigation. Trois tests de comportement des animations ajoutés ; les six tests du projet passent. Le premier événement `pageshow` est distingué d’une restauration depuis le cache pour ne pas désactiver les apparitions au chargement.

Les outils de navigateur ont été interrogés de nouveau et restent indisponibles. Le rendu animé nécessite donc une vérification manuelle dans le navigateur du propriétaire.

## À compléter au fil du travail personnel

### 7 novembre 2026 — Refonte éditoriale et réduction des tailles

À partir des nouvelles captures et de l’autorisation explicite de refonte, remplacement des grands aplats vides de l’accueil et de la présentation personnelle par des compositions éditoriales plus compactes. Reprise des textes fournis dans une nouvelle hiérarchie, portrait personnel, parcours et méthode. Header ramené à 52 px, texte courant à 16 px et tailles des titres, composants et espacements réduites.

Recherche de textures sur Unsplash, lecture des pages sources et de la licence, téléchargement de deux images de Heather Green et Valentin Salja, redimensionnement à 1100 px et compression WebP. Crédits ajoutés au dépôt et aux mentions légales. Photographie d’architecture retirée de Contact.

Refonte complète de Contact autour d’une composition de correspondance. Ajout de sujets cliquables qui synchronisent un aperçu et le lien `mailto:`, ainsi que d’une copie de l’adresse avec annonce accessible du résultat réel. Deux tests couvrent la préparation des sujets et les cas de succès/refus de la copie.

L’accès aux outils de navigateur a été essayé de nouveau : il reste indisponible. Les contrôles automatisés ne remplacent donc pas la validation visuelle et tactile dans le navigateur du propriétaire.

### 7 novembre 2026 — Transitions uniquement

Après le retour à la version précédente, le propriétaire demande de remettre uniquement les animations, avant de modifier les sections dans une étape ultérieure. Ajout d’une feuille CSS et d’un script dédiés aux transitions, avec révélations au scroll et fondus. Aucun changement de structure du header ou des pages, aucun motif ni daisyUI réintroduit. Prise en compte de la réduction du mouvement, du focus, du cache de navigation et de l’impression.

Ajouter ici les prochaines actions réellement effectuées, leur date, les difficultés rencontrées et les choix retenus. Aucune période antérieure n’a été reconstituée.

## Retour à la version précédente — 7 novembre 2026

À la demande du propriétaire, les ajouts de motifs, animations et daisyUI ont été retirés. Le header, les sections de projets, les boutons et les visuels de la version initiale ont été restaurés. Les tests spécifiques aux animations ont également été retirés. Le travail initial Astro/PocketBase est conservé.

## 7 novembre 2026 — Version visuelle épurée

À la demande du propriétaire, retrait de la présentation en carnet, des slogans et des paragraphes ajoutés. Réduction des textes à de courts extraits de la maquette, images beaucoup plus présentes, architecture et matière textile issues d’Unsplash avec crédits. Développement d’un parallax vertical et d’une galerie horizontale liée au scroll sur ordinateur, glissable sur mobile. Conservation du header et de la structure des projets. Contact simplifié, méthode de travail repliée par défaut sur À propos. Respect du mouvement réduit, navigation clavier et lien pour passer la galerie prévus. Les anciennes textures de papier ont été retirées.

## 8 novembre 2026 — Refonte complète en grille

À la demande du propriétaire : nouvelle entrée en 70/30, séquence horizontale en 50/50, projets en grille, compétences sur trois colonnes, outils filtrables et footer commun recomposé. Angles droits, bordures fines et textes existants conservés. Aucun contenu de projet inventé, aucune donnée PocketBase modifiée.

Les cartes utilisent les catégories réelles de PocketBase, y compris les relations de catégorie multiples des savoirs et les espaces terminaux. Pagination par six compétences ou huit savoirs, boutons natifs, états aria-pressed, annonces accessibles et affichage intégral sans JavaScript. Apparitions des cartes, dévoilement des images, parallax et changements progressifs des fonds sombres au scroll ; réduction du mouvement respectée.

Une section Olyvia sans disposition, avec uniquement des images pleine largeur, empêchait la compilation. Le rendu déduit la pleine largeur dans ce seul cas non ambigu ; les dispositions inconnues continuent de déclencher une erreur. Aucun changement de schéma ni d’enregistrement.

La compilation avec le vrai projet Olyvia réussit. Les interactions des filtres sont testées par exécution du script dans un environnement DOM simulé ; cela ne remplace pas une vérification visuelle. Les outils de navigateur ont été réessayés et restent indisponibles. Aucun commit, ajout à l’index, push ou déploiement effectué.
## 8 novembre 2026 — Références du PDF Inspiration

Lecture visuelle des quatre pages du PDF fourni par le propriétaire, rendues dans le dossier ignoré .astro/inspiration-review. Choix des galeries sombres à trois colonnes et compositions décalées (page 1), de la présentation architecturale à trois zones et de la bande de matière (page 2), du footer à colonnes avec grande signature (page 3), et des alignements de galerie décalés (page 4).

Adaptation dans le portfolio Astro : triptyque d’accueil avec un vrai visuel Olyvia, présentation asymétrique, grille des projets, pages À propos et Contact à trois zones, introduction des projets en trois colonnes, footer noir avec bande textile et signature Philippon. Les images du PDF, les logos, les textes et les affirmations des autres studios ne sont pas réutilisés. Les photos déjà créditées et les contenus PocketBase restent les sources du site. Les boutons rectangulaires en majuscules et les suppressions demandées sont conservés.

Compilation de huit pages réussie ; dix tests réussis ; contrôles HTTP de six pages principales, de sept liens internes et de vingt-neuf ressources réussis. Le contrôle visuel du site et des animations reste à effectuer dans le navigateur, inaccessible aux outils de cette session. Aucun changement de base, ajout à l’index, commit, push ou déploiement.
## 8 novembre 2026 — Reprise de la maquette Figma d’origine

Le propriétaire demande de repartir de zéro et confirme explicitement la maquette Figma d’origine. Nouvelle lecture des contextes détaillés et captures des cinq écrans de Desktop-apres : Accueil 725:604, Projets 725:637, À propos 725:647, modèle de projet 725:690 et Contact 725:732. Les compositions du PDF et les refontes expérimentales sont abandonnées.

Reprise des colonnes 61/39, du header blanc de 64 px, des couleurs et typographies d’origine, des textes de la maquette, des carrousels et du footer sombre avec portrait. Réintégration du formulaire Contact, de sa photographie Figma téléchargée localement et du bouton Retour. Le formulaire prépare un e-mail et n’annonce pas de faux envoi ; les champs sont validés et le destinataire reste configurable. Les profils sans URL ne reçoivent pas de faux liens ; le téléchargement du CV est désactivé tant que son URL n’est pas renseignée.

Les composants, scripts, styles et tests spécifiques aux expérimentations ont été retirés. L’état précédent est conservé sous .astro/before-maquette-restart-20261108, ignoré par Git. Les données, le schéma, les règles API, le correctif de tri des compétences et le rendu dynamique des sections sont conservés.

Cinq tests réussissent, dont deux consacrés à la préparation du message et à la validation du formulaire. La compilation de huit pages et les contrôles HTTP des pages et ressources réussissent. Le navigateur a été réessayé mais reste inaccessible ; aucune comparaison visuelle de rendu navigateur n’est déclarée réussie. Les captures Figma ne sont jamais utilisées comme images de page dans le site.

Aucun ajout à l’index, commit, push ou déploiement effectué.
## 8 novembre 2026 — Galerie horizontale des projets

À la demande du propriétaire, seule la liste /projets/ devient une galerie plein écran sans footer sous les cartes. Le composant Footer.astro est inchangé, vérifié par empreinte SHA256. Sidebar de filtres construite depuis les domaines PocketBase, cartes portrait, zoom de l’image et agrandissement de la carte au survol. Les vraies pages de projet et leurs sections restent disponibles après clic.

Défilement automatique uniquement quand plusieurs projets débordent : pause au survol, arrêt après interaction clavier/tactile/molette, reprise explicite, pause dans un onglet masqué, préférence de réduction du mouvement respectée. Glissement tactile, molette convertie localement en défilement horizontal, touches gauche/droite/début/fin, filtres annoncés et liens HTML préservés. Aucun projet fictif ni doublon d’Olyvia ajouté : la base ne contient actuellement qu’un projet publié.

Transition native entre carte et couverture via un nom de transition partagé, avec fondu de départ en repli. Le script et les styles de la galerie sont isolés de l’accueil et du footer. L’état du filtre et la position sont conservés dans le stockage de session lorsque disponible.

Neuf tests réussis : données, champs, sections dynamiques, construction Astro, filtres, navigation circulaire, défilement automatique, pauses, mouvement réduit et liens modifiés. Compilation de huit pages réussie. Galerie et page Olyvia vérifiées via HTTP. Tests d’interaction exécutés dans un DOM simulé ; aucune validation visuelle ou tactile réelle n’est déclarée, car les outils de navigateur restent indisponibles.
## 8 novembre 2026 — Filtres repliés et header transparent

Demande ciblée du propriétaire : masquer la sidebar au chargement, donner davantage de hauteur aux cartes et remplacer le header par un logo à gauche et un hamburger à droite sur fond transparent. Le header ne réserve plus de bande dans la mise en page ; ses éléments flottent au-dessus du contenu. Le contraste des icônes s’adapte au fond avec le mode de fusion difference.

La galerie utilise toute la largeur disponible. Le bouton Filtres ouvre un panneau repliable ; les cartes sont plus hautes et leur largeur est limitée selon la hauteur de l’écran pour conserver une silhouette verticale. Les menus sont natifs, fermés initialement et exclusifs, avec fermeture au clavier, clic extérieur, sortie du focus ou sélection d’un filtre. Le défilement automatique s’arrête tant que le panneau des filtres est ouvert.

Onze tests réussissent, dont les interactions des menus et l’absence d’ouverture initiale ; compilation de huit pages et vérification HTTP des pages, de sept liens et de quarante-et-une ressources réussies. Footer.astro inchangé, contrôlé par empreinte SHA256. Aucune modification de données PocketBase ni opération Git d’écriture. Le contrôle visuel reste à effectuer dans un navigateur accessible.
## 8 novembre 2026 — Galerie verticale et déplacement des cartes sur l’accueil

Lecture visuelle de l’unique page du PDF Desktop - 1 fourni par le propriétaire. Seule la composition sert de référence : les blocs gris et le texte de remplissage ne sont pas intégrés. /projets/ devient une colonne d’images défilant verticalement à gauche avec titre, domaines, introduction et lien du projet actif à droite. Le bouton rouge Filtrer les projets reste visible en haut, son panneau est replié. Sur mobile, les informations sont placées sous les images.

Les cartes rectangulaires précédemment développées sont déplacées dans le carrousel horizontal de l’accueil, à la place de son ancienne sélection de projet. Le script commun gère les deux axes, les filtres facultatifs, les textes synchronisés, la molette, le clavier, le tactile, les pauses et la reprise automatique. Un observateur de visibilité empêche l’accueil de défiler automatiquement hors écran ; le mode mouvement réduit est respecté. Le header et le footer ne sont pas modifiés. Footer vérifié par empreinte SHA256.

Treize tests passent, dont la synchronisation de la description verticale, les axes distincts, les filtres, les menus, les pauses et le comportement de la molette sur l’accueil. Compilation de huit pages et vérification HTTP des six pages principales, de sept liens internes et de quarante-et-une ressources réussies. La base contient toujours un seul projet publié ; aucun doublon ni projet de remplissage n’est ajouté. Les tests d’interaction utilisent un DOM simulé. Le contrôle visuel du site reste à faire dans le navigateur, inaccessible aux outils de cette session.

Aucune modification de données PocketBase, aucun ajout à l’index, commit, push ou déploiement.
## 8 novembre 2026 — Présentation allégée et caractères HTML

À la demande du propriétaire, la présentation du projet actif ne garde que son titre et son introduction. Retrait de la ligne des domaines et du bouton de découverte ; le clic sur l’image reste disponible. Déplacement du bouton des filtres en bas à droite et ouverture de son panneau vers le haut.

Correction de la conversion Text/Editor : les entités HTML des accents, apostrophes, ligatures et caractères numériques sont décodées avant l’affichage. Les contenus Editor continuent d’être échappés et limités aux balises autorisées. Les champs PocketBase ne sont pas modifiés. Deux tests de régression couvrent la phrase encodée fournie et les balises encodées à conserver comme texte inoffensif.

Quinze tests réussis, compilation de huit pages réussie et vérification HTTP des contenus décodés. Les autres composants, dont le footer, sont conservés.
## 8 novembre 2026 — Défilement fluide et automatisme de sept secondes

À la demande du propriétaire, retrait des commandes Précédent, Suivant et Défilement auto de la page Projets, ainsi que du compteur et de la barre visible. Le bouton des filtres reste en bas à droite. Le carrousel avance automatiquement toutes les sept secondes et reprend après la molette, sans pause permanente faute de bouton de reprise.

Remplacement du cumul scroll natif/aimantation/animation par un seul pilote requestAnimationFrame de 1,4 seconde : départ lent, accélération centrale et arrivée ralentie. Sortie et entrée du texte synchronisées sur le passage des images. Les événements successifs d’une impulsion ne redémarrent pas le mouvement ; une inversion repart de la position réelle. Le tactile conserve le déplacement natif avec recentrage en fin de geste. Les préférences de réduction du mouvement, le clavier, l’onglet masqué et les filtres ouverts restent pris en compte.

Dix-neuf tests réussissent, incluant la courbe de mouvement, l’annulation et l’inversion, le délai de sept secondes, la reprise après molette et la synchronisation du texte. Compilation de neuf pages réussie avec les deux projets désormais publiés. Vérification HTTP : les commandes retirées ne sont plus présentes. Footer inchangé, empreinte SHA256 vérifiée. Le rendu des animations reste à valider dans un navigateur accessible ; les tests simulés ne constituent pas une validation visuelle.

## 10 novembre 2026 — Texture rouge et zoom d’accueil

À la demande du propriétaire, remplacement de la séquence prénom/nom et portrait par la texture rouge fournie, déjà disponible dans public/images/bangsal-nam-9HMGyZJfrk8-unsplash.jpg. Image optimisée en WebP responsive. Zoom lié au scroll depuis un cadre central vers le plein écran, puis image maintenue immobile par un conteneur sticky pendant que la présentation opaque défile normalement par-dessus. Aucun détournement de la molette. La présentation devient une section #111 : grand titre en haut à gauche, amorce grise, paragraphes décalés à droite et lien À propos. Le bloc Donner forme aux idées reprend cette disposition sur le même fond sombre. Sur mobile, le texte revient sur une colonne. Sans JavaScript ou en mouvement réduit, image et textes restent accessibles dans le flux.

Référence consultée : https://www.brand-nw.com/ et captures fournies. 34 tests réussis, compilation de 10 pages réussie, contrôles HTTP de six pages principales, neuf liens internes et trente-sept ressources réussis. Tests du zoom réversible, du maintien après plein écran, de la mutualisation des frames et du mouvement réduit. La vérification visuelle dans un navigateur reste indisponible : le runtime node_repl nécessaire au skill Computer Use n’est pas exposé dans cette session. Aucun changement de données PocketBase, aucun commit, push ou déploiement.

## 10 novembre 2026 — Rétablissement du nom avant le zoom

Précision du propriétaire : conserver l’entrée prénom/nom avec le trait rouge et remplacer uniquement le portrait par la texture. Rétablissement de Melvyn Philippon sur fond clair, séparation vers les initiales et déploiement du trait rouge, révélation de la texture au centre, disparition des initiales puis zoom jusqu’au plein écran. La section sombre continue de défiler sur la texture immobile. Remplacement du lien à deux filets par le composant ArrowLink partagé, en variante rectangulaire rouge filled, sans modification des boutons globaux. Séquence réversible et contenu accessible sans animation. 34 tests réussis, compilation de 10 pages réussie et vérification HTTP des six pages principales, neuf liens internes et trente-sept ressources réussie. Vérification visuelle navigateur toujours indisponible. Aucun changement PocketBase, commit, push ou déploiement.

## 10 novembre 2026 — Hero plus expressif et trait central

À la demande du propriétaire, le trait rouge est désormais limité à l’intervalle entre les blocs M et P, avec une largeur calculée depuis leur écart animé. Retrait des segments extérieurs sans supprimer la liaison centrale. Hero enrichi à partir des captures fournies : typographie du nom agrandie, en-tête éditorial à filet fin, vignette de la texture rouge légendée, accroche Imaginer. Dessiner. Donner forme. et repères de formation et de lieu. Ces éléments s’effacent avant le zoom pour laisser la séquence existante se poursuivre. Adaptations mobile et écrans courts ; boutons partagés et suite de l’accueil conservés.

Les deux tests de la séquence d’accueil passent et la compilation de dix pages réussit. Contrôle visuel dans le navigateur toujours indisponible dans cette session. Aucun changement PocketBase, commit, push ou déploiement.

## 10 novembre 2026 — Accueil simplifié après référence Kubrick

Le propriétaire rejette les textes décoratifs et demande de retirer la séquence initiales/trait rouge. Le hero contient désormais uniquement le vrai prénom et nom alignés à gauche sur deux lignes, avec la texture rouge à droite. Suppression des slogans, de l’édition, de la vignette et de sa légende, des repères de formation et du scroll hint. Suppression du sous-titre inventé dans la présentation ; le titre reste Qui suis-je ?. Entrée du nom par masques de lignes, puis retrait discret du nom pendant le zoom continu de la texture. Défilement normal de la présentation sombre conservé, boutons ArrowLink partagés conservés. Les titres et paragraphes de présentation apparaissent progressivement à l’entrée dans le viewport. Contenu lisible sans JavaScript, mouvement réduit respecté et état restauré au retour arrière.

Référence demandée : https://kubrick.life/?ref=httpster.net. Récupération de la page publique et du HTML de sa première scène depuis ses ressources Readymag : conteneurs fixes, superpositions, transformations d’échelle, déplacements et opacités. Consultation de la présentation des créateurs sur Behance via la recherche. Le navigateur et la lecture des transitions animées ne sont pas accessibles dans cette session ; aucune inspection visuelle exhaustive des transitions n’est déclarée.

Compilation de dix pages réussie, deux tests d’accueil réussis comprenant le zoom réversible, la mutualisation des frames, l’observateur d’apparition des textes et le mouvement réduit. Six pages, neuf liens internes et trente-sept ressources vérifiés via HTTP. Aucun changement PocketBase, commit, push ou déploiement.

## 10 novembre 2026 — Glissement du hero et cartes projets en paysage

À la demande du propriétaire, texture alignée à droite sur toute la hauteur du hero. L’image conserve une largeur et une hauteur constantes égales au viewport : seule sa translation horizontale passe de 50 % à zéro au scroll, sans agrandissement. Le nom reste à gauche et s’efface pendant cette translation ; la présentation sombre et ses apparitions de texte sont conservées.

Démarcation par un fond clair chaud #e9e6df après Donner forme aux idées. Carrousel d’accueil recomposé en grandes cartes paysage, avec aperçus des cartes voisines, angles droits, image bord à bord et seul titre visible en bas à gauche sur un dégradé de contraste. Retrait du bouton Tous les projets, des catégories, des commandes et du compteur visibles. Cartes entièrement cliquables, effet d’image au survol, titre légèrement déplacé et focus clavier visible. Navigation tactile, clavier et transition vers les pages de projet conservées via le script partagé ; aucun changement de la page Projets.

34 tests réussis dont vérification du rendu du carrousel sans bouton et de ses liens de projet ; compilation de dix pages réussie. Six pages principales, neuf liens internes et trente-sept ressources vérifiés via HTTP. Le contrôle visuel navigateur reste indisponible. Aucun changement PocketBase, commit, push ou déploiement.

## 10 novembre 2026 — Séquence horizontale plein écran et bilan rouge

À la demande du propriétaire, retrait intégral du titre Mes projets, des boutons, compteur et informations sous les images. Remplacement du carrousel d’accueil par une séquence dédiée : trois images de projets cliquables de 100vw sur 100svh, sans marges ni espaces, titre en bas à gauche ; quatrième panneau plein écran rouge utilisant --color-brick (#a33333) avec les deux paragraphes exacts du bilan. L’ancienne section verticale home-summary est supprimée pour éviter le doublon.

Sur desktop, le scroll de page pilote la translation horizontale dans une scène sticky, puis le panneau rouge entre depuis la droite. Temps de lecture ménagé sur le panneau final avant la reprise verticale. Scroll réversible, molette horizontale de trackpad et touches gauche/droite/début/fin pris en charge ; le focus clavier amène le projet ciblé. Sur mobile, sans JavaScript et en mouvement réduit, défilement horizontal natif. Le script partagé de la page Projets reste inchangé et ne pilote plus cette section.

35 tests réussis, incluant le passage des quatre panneaux, le retour arrière, la sortie du défilement horizontal, la navigation clavier et le mouvement réduit. Compilation de dix pages réussie. Contrôle explicite du HTML servi sur localhost:4321 et du HTML construit : trois cartes, panneau de bilan présent, aucun ancien titre, bouton, compteur ni ancien bilan vertical. Six pages, neuf liens internes et trente-six ressources vérifiés via HTTP. Contrôle visuel navigateur toujours indisponible. Aucun changement PocketBase, commit, push ou déploiement.

## 10 novembre 2026 — Couvertures non recadrées et section claire

Demande ciblée : améliorer le rendu des images de projets, mettre les noms en majuscules et distinguer Donner forme aux idées de la présentation précédente. Inspection des originaux publics : Bargo 2880 × 1370, La Cimade 670 × 564, Olyvia 1756 × 1766. Les images de l’accueil sont maintenant entières, centrées sur le rouge de la charte, sans recadrage cover ni agrandissement au-delà de leur taille native. Suppression du zoom au survol au profit d’un éclaircissement. ProjectImage accepte une qualité et des largeurs configurables ; la variante nativeSizing de l’accueil utilise les métadonnées pour limiter les variantes à la largeur réelle et adapter sizes à l’espace effectivement occupé. Qualité WebP 95 et variantes jusqu’à 2880 px pour les sources qui le permettent ; aucune résolution artificielle créée pour la petite image La Cimade. Titres de projets en majuscules via CSS.

Donner forme aux idées passe sur fond blanc cassé #fafaf8, avec titre rouge de la charte, texte gris foncé et marges verticales équilibrées. Le panneau de bilan rouge et le défilement horizontal restent conservés.

Compilation de dix pages réussie ; 35 tests réussis, puis test de construction réexécuté avec succès après le plafonnement des variantes. Contrôle des srcset : Bargo jusqu’à 2880, La Cimade jusqu’à 670, Olyvia jusqu’à 1756, sans dépassement de largeur native. Six pages, neuf liens et trente-six ressources vérifiés via HTTP. Contrôle visuel navigateur toujours indisponible. Aucun changement PocketBase, commit, push ou déploiement.

## 10 novembre 2026 — Retour des couvertures bord à bord

Précision du propriétaire : restaurer les images de projets sur toute la largeur et hauteur desktop. Retour à width/height 100 % et object-fit cover, sizes 100vw, avec les variantes haute qualité plafonnées à la résolution des sources conservées. Le titre Donner forme aux idées redevient noir #14161d sur le fond blanc cassé. Titres des projets en majuscules, scroll horizontal et bilan rouge conservés. Compilation de dix pages réussie.

## 10 novembre 2026 — Slider par recouvrement

Précision du propriétaire : les images doivent rester immobiles pendant que la suivante glisse par-dessus. Sur desktop, les trois projets et le panneau rouge sont maintenant superposés dans la scène sticky. Chaque panneau entrant se déplace de droite à gauche, puis reste fixe une fois arrivé ; la piste entière ne se translate plus. Le panneau de bilan rouge recouvre le troisième projet avec le même mouvement. Suppression du fond rouge derrière les images au profit d’un fond noir pour éliminer les filets rouges aux jonctions, sans bordure ni espace. Largeurs des panneaux ajustées à 100 % du conteneur pour éviter un décalage lié à la scrollbar. Clavier, focus, retour arrière, sortie de scène et fallback horizontal natif conservés.

Test de comportement réussi, incluant une vérification à mi-transition : l’image sortante reste à zéro pendant que la suivante avance. Compilation de dix pages réussie. Vérification visuelle navigateur toujours indisponible. Aucun changement PocketBase, commit, push ou déploiement.

## 11 novembre 2026 — Transition accélérée puis ralentie

À la demande du propriétaire, suppression des contours, arrondis et ombres sur les couches d’image ; le focus clavier reste visible via le soulignement du titre au lieu d’un cadre autour de l’image. Fond derrière les panneaux unifié en noir. Le recouvrement utilise une courbe quintique : départ doux, accélération au centre et freinage à l’arrivée, avec vitesse et accélération nulles aux extrémités. Même comportement en sens inverse et panneau sortant toujours immobile. Test de la courbe et du scroll réussi, compilation de dix pages réussie. Contrôle visuel navigateur indisponible.

## 11 novembre 2026 — Aimantation du slider à chaque impulsion

À la demande du propriétaire, une impulsion verticale ou horizontale de molette déclenche maintenant un passage complet vers le panneau suivant ou précédent sur desktop. Animation de 1,05 seconde avec accélération et freinage, arrivée exacte sur une image entière. Les événements d’inertie d’une même rafale sont absorbés pour éviter de sauter plusieurs images ; une inversion peut repartir de la position courante. Aimantation à l’entrée dans la séquence, panneau rouge inclus, puis molette libre aux extrémités après la fin de la rafale. Annulation au changement de taille, de préférence et à la sortie de page ; mode natif mobile et mouvement réduit conservés.

Deux tests ciblés réussissent, notamment exécution des frames jusqu’à l’arrivée, rafales, retour arrière, panneau rouge et sortie sans blocage. Compilation de dix pages réussie. Contrôle visuel navigateur toujours indisponible. Aucun changement PocketBase, commit, push ou déploiement.

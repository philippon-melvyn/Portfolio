# Contrôles qualité

État au 7 novembre 2026. « Réussi » indique un contrôle effectivement exécuté ; une règle de code ou une intention ne remplace pas un test visuel.

| Contrôle                        | Méthode et résultat                                                                                               | Statut                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Installation phase 1            | Versions Node/npm/Bun vérifiées, installation Bun et verrou contrôlés                                             | Réussi                                                          |
| Rolldown sous Windows           | Variante WebAssembly installée ; commandes sans `--bun` testées                                                   | Réussi avec adaptation                                          |
| Construction phase 2            | `bun run build`, sept pages HTML et endpoints générés sur la vraie base vide                                      | Réussi                                                          |
| Données réelles                 | GET publics et lecture seule locale ; quatre collections vides, confirmation du propriétaire                      | Réussi pour l’état vide                                         |
| Pagination et erreurs           | Test serveur HTTP en mémoire : deux pages, erreurs 403 et réponse invalide                                        | Réussi                                                          |
| Relation projet/sections        | Filtre `projet="id"` et tri `ordre,id` vérifiés par tests                                                         | Réussi                                                          |
| Deux dispositions               | Construction isolée d’une page synthétique avec colonnes et pleine largeur                                        | Réussi sur données de test                                      |
| Galeries                        | Plusieurs fichiers à droite et pleine largeur dans la construction de test                                        | Réussi sur données de test                                      |
| Champs Text/Editor              | Text échappé, balises de mise en forme Editor conservées, attributs et scripts retirés                            | Réussi sur données de test                                      |
| Relations savoirs               | Nom/logo liés rendus, savoir non publié omis, compétences absentes acceptées                                      | Réussi sur données de test                                      |
| Champs facultatifs              | Section vide et lien incomplet omis, images absentes acceptées                                                    | Réussi sur données de test                                      |
| Images de projet                | `Image` natif Astro, dimensions et `srcset` vérifiés dans la construction isolée                                  | Réussi sur données de test                                      |
| Routes et ressources            | Requêtes HTTP sur les six pages principales, six liens internes et ressources locales, dev et preview             | Réussi                                                          |
| 404                             | URL inconnue : statut 404 et contenu de la page personnalisée                                                     | Réussi                                                          |
| SEO local                       | Métadonnées dans le HTML, robots non indexable sans domaine, sitemap valide ; sitemap avec projet vérifié en test | Réussi                                                          |
| Liens de contact                | Présence des vrais `mailto:` et `tel:` ; aucun envoi ni appel effectué                                            | HTML vérifié, activation manuelle à faire                       |
| Correspondance Figma            | Contextes de design et captures de `Desktop-apres` examinés ; couleurs/polices/grille reprises                    | Intégration effectuée, comparaison navigateur à faire           |
| Responsive                      | Grilles empilées, titres fluides, menu mobile et images adaptatives codés                                         | À vérifier dans un navigateur à 390, 768 et 1440 px             |
| Carrousels                      | Synchronisation titres, visuels, descriptions, liens et compteurs codée ; contenu accessible sans JS              | Interactions réelles à tester quand les contenus seront ajoutés |
| Clavier et focus                | Lien d’évitement, boutons natifs, focus visible, fermeture du menu par Échap codés                                | Test manuel à faire                                             |
| Contrastes                      | Calcul sRGB : texte/crème 17,29:1, blanc/sombre 17,90:1, blanc/brique 6,82:1 ; grand « 404 » rouge/crème 4,04:1   | Rapports mesurés ; inspection visuelle à faire                  |
| Console navigateur              | Outils de navigateur indisponibles                                                                                | Non effectué                                                    |
| Erreurs réseau d’images réelles | Aucun média de projet encore présent dans la base                                                                 | À faire après ajout des contenus                                |
| Règles PocketBase               | Écritures anonymes et brouillons non protégés constatés ; règles proposées dans `POCKETBASE.md`                   | Correction par le propriétaire avant exposition publique        |
| Informations légales            | Pages créées avec éléments manquants explicitement indiqués, sans inventer d’hébergeur                            | À compléter                                                     |
| Git                             | Aucun commit, ajout à l’index, push ou changement d’historique par Codex                                          | Respecté                                                        |

## Vérification manuelle proposée

### Refonte éditoriale compacte

Résultats exécutés : cinq tests réussis avec `bun run test`, construction de production réussie, vérification HTTP des six pages principales, de sept liens internes, de dix ressources locales et de la 404. Les deux textures pèsent environ 134 ko et 229 ko en WebP. Aucun contrôle visuel automatisé n’est déclaré réussi.

Les sections montrées dans les captures et Contact ont été recomposées sur demande explicite. Header de 52 px, corps de texte de 16 px, titres et espacements réduits. Deux textures téléchargées depuis leurs pages Unsplash avec licence vérifiée et crédits conservés. Les images sont locales et compressées en WebP ; la photographie d’architecture n’est plus utilisée.

La page Contact conserve un `mailto:` utilisable sans JavaScript. Les boutons de sujet préparent le bon lien et synchronisent l’aperçu. Deux tests de comportement couvrent cette synchronisation et les réponses du presse-papiers. Tester manuellement l’ouverture du logiciel e-mail, les sujets, la copie d’adresse, les annonces accessibles et les affichages à 390, 768, 1440 et 1920 px. Le navigateur reste inaccessible aux outils de cette session.

### Transitions seules après restauration du design

Ajout de `transitions.css` et `transitions.js`, avec fondu des carrousels. Construction et contrôle de syntaxe JavaScript réussis. La préférence de réduction du mouvement, le focus clavier, la restauration depuis le cache et l’impression sont pris en compte dans le code. Le comportement animé doit être vérifié manuellement dans le navigateur ; les outils de navigateur restent indisponibles dans cette session.

1. Lancer PocketBase puis `bun run dev` ; parcourir l’accueil, À propos, Projets, Contact et une URL inexistante.
2. Tester à 390, 768 et 1440 px : pas de débordement horizontal, grands titres lisibles, ordre de lecture, cadrage du portrait et navigation mobile.
3. Parcourir au clavier : lien d’évitement, menu, boutons, liens et focus ; tester Échap dans le menu.
4. Après ajout des données, comparer une vraie page projet à Figma, vérifier l’ordre des sections, les savoirs et les liens finaux. Tester les deux carrousels et leurs compteurs.
5. Vérifier la console et les requêtes réseau ; contrôler une image absente, une relation vide et un lien final non renseigné.
6. Corriger les règles API et compléter les contenus légaux, coordonnées et domaine avant toute mise en ligne.

## Version visuelle épurée — 7 novembre 2026

Vérifications exécutées : les sept tests passent avec `bun run test`, la compilation `bun run build` réussit et les six pages principales répondent en HTTP 200. Six liens internes, dix ressources locales, la page 404, robots.txt et le sitemap ont été vérifiés. Le contrôle visuel des animations reste à faire, l’accès au navigateur étant indisponible dans cette session.

Contrôles à effectuer dans le navigateur : parallax vertical, démarrage et fin de la séquence horizontale, retour au scroll vertical, flèches et lien Passer la galerie ; glissement tactile à 390 et 768 px ; disparition du mode épinglé si le mouvement réduit est activé. Le code ne bloque pas la molette. Sans JavaScript, la galerie reste accessible par défilement horizontal. Les images sont hébergées localement avec leurs crédits. Les limites et positions du parcours horizontal sont couvertes par des tests de calcul, sans les présenter comme un test visuel.

## Refonte en grille — 8 novembre 2026

Compilation de production réussie avec huit pages, dont le vrai projet Olyvia et ses images optimisées. Contrôle HTTP des six pages principales, de sept liens internes et de vingt-neuf ressources réussi. Tests des filtres : catégories simples/multiples avec espaces terminaux, pagination sans doublon ni omission, clic sur catégorie, retour à la première page et annonces accessibles. Tests de contact, données, sections de projet et calculs du scroll conservés.

À vérifier visuellement : largeurs 390, 768 et 1440 px ; filtres et navigation des cartes ; lisibilité des fonds sombres pendant leur changement de couleur ; cadrage des photos ; début et fin du scroll horizontal ; retour en haut ; mouvement réduit et clavier. L’accès au navigateur reste indisponible et aucun contrôle visuel n’est déclaré réussi.
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
## 8 novembre 2026 — Défilement fluide et automatisme de sept secondes

À la demande du propriétaire, retrait des commandes Précédent, Suivant et Défilement auto de la page Projets, ainsi que du compteur et de la barre visible. Le bouton des filtres reste en bas à droite. Le carrousel avance automatiquement toutes les sept secondes et reprend après la molette, sans pause permanente faute de bouton de reprise.

Remplacement du cumul scroll natif/aimantation/animation par un seul pilote requestAnimationFrame de 1,4 seconde : départ lent, accélération centrale et arrivée ralentie. Sortie et entrée du texte synchronisées sur le passage des images. Les événements successifs d’une impulsion ne redémarrent pas le mouvement ; une inversion repart de la position réelle. Le tactile conserve le déplacement natif avec recentrage en fin de geste. Les préférences de réduction du mouvement, le clavier, l’onglet masqué et les filtres ouverts restent pris en compte.

Dix-neuf tests réussissent, incluant la courbe de mouvement, l’annulation et l’inversion, le délai de sept secondes, la reprise après molette et la synchronisation du texte. Compilation de neuf pages réussie avec les deux projets désormais publiés. Vérification HTTP : les commandes retirées ne sont plus présentes. Footer inchangé, empreinte SHA256 vérifiée. Le rendu des animations reste à valider dans un navigateur accessible ; les tests simulés ne constituent pas une validation visuelle.
## SEO technique — 13 novembre 2026

Audit et corrections documentés dans [SEO.md](SEO.md). Contrôles effectivement exécutés : installation figée avec `bun ci`, 45 tests réussis avec `bun run test`, build réel de production et build de staging avec Bun, audit des deux sorties : 12 pages, 9 URL sitemap, 49 images, 7 pages JSON-LD et 286 références, sans erreur. HTML validé, XML parsé et JSON-LD décodé. Les builds isolés sans SITE_URL, avec un domaine local ou avec PocketBase inaccessible échouent comme attendu. Le YAML du workflow et la syntaxe shell ont été contrôlés localement ; aucune promotion serveur n’a été exécutée.

Corps HTML identiques après exclusion des attributs de chargement ; empreintes CSS et poids du JavaScript navigateur inchangés. Les JPEG de partage sont ajoutés sans modifier les images du corps des pages. Aucun secret ajouté aux fichiers à versionner. Pas de validation visuelle : l’accès natif au navigateur a échoué. Lighthouse, tests tactiles, résultats enrichis externes, Core Web Vitals réels et configuration Apache sur le VPS restent à vérifier. Les constats de cette entrée décrivent l’état actuel ; les entrées datées précédentes restent un historique.

## Diagnostics de l’éditeur — 13 novembre 2026

110 erreurs Astro corrigées ; contrôle final sur 19 fichiers : zéro erreur, zéro avertissement, 45 suggestions informatives d’inférence conservées. 581 occurrences de classes normalisées, puis zéro suggestion canonique restante selon Tailwind 4.3.5. 45 tests et build Bun réussis ; audit SEO réussi. Comparaison statique de 12 360 éléments et états sans différence détectée. Les scripts de page restent dans Astro, avec un petit module DOM JavaScript partagé documenté en JSDoc et les définitions Node en dépendance de développement. Aucun diagnostic désactivé. Voir [DIAGNOSTICS.md](DIAGNOSTICS.md) pour le périmètre et les limites.

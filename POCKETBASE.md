# Collections et contenu

Référence : captures fournies, migrations existantes et lecture seule de la base locale les 7 et 8 novembre 2026. Aucune collection ni donnée créée ou modifiée par Codex. Instance confirmée par le propriétaire : `http://127.0.0.1:8090`. Initialement vides, les collections contiennent désormais les contenus ajoutés par le propriétaire.

## `Projets` — majuscule obligatoire

| Champ                                | Type / cardinalité                   | Utilisation                                    |
| ------------------------------------ | ------------------------------------ | ---------------------------------------------- |
| `titre`, `slug`                      | Text                                 | Titre et route du projet                       |
| `domaines`                           | Select multiple                      | Domaines affichés dans les métadonnées         |
| `annee`                              | Number                               | Année                                          |
| `introduction`                       | Editor                               | Mise en forme simple, assainie avant affichage |
| `couverture`                         | File unique                          | Image principale                               |
| `couverture_alt`                     | Text                                 | Alternative de la couverture                   |
| `competences`                        | Relation multiple vers `competences` | Compétences du projet                          |
| `savoirs`                            | Relation multiple vers `savoirs`     | Noms et logos des savoirs utilisés             |
| `liens_libelle_1`, `liens_libelle_2` | Text                                 | Libellés des liens finaux                      |
| `liens_url_1`, `liens_url_2`         | URL                                  | Destination HTTP ou HTTPS                      |
| `liens_img_1`, `liens_img_2`         | File unique                          | Visuels des liens                              |
| `ordre`                              | Number                               | Tri croissant, puis `id` pour départager       |
| `publie`                             | Bool                                 | Publication                                    |

Le site exige des slugs uniques au format `mon-projet`, en minuscules sans accents. Un projet publié avec un slug manquant ou dupliqué fait échouer la construction avec une explication ; il n’est pas ignoré silencieusement. Cette vérification n’ajoute aucun index à la base.

Un lien final n’apparaît que si son libellé et son URL sont renseignés et valides. Son image est facultative. Les images vides ne créent pas de balise cassée.

## `sections_projet`

| Champ                                           | Type / cardinalité                                        |
| ----------------------------------------------- | --------------------------------------------------------- |
| `projet`                                        | Relation unique vers `Projets`, obligatoire               |
| `ordre`                                         | Number                                                    |
| `disposition`                                   | Select unique : **`deux colonnes`**, **`pleine largeur`** |
| `titre`                                         | Text                                                      |
| `texte_gauche`, `texte_droite`                  | **Text**, pas Editor                                      |
| `image_gauche`, `image_droite`, `image_largeur` | File multiple, jusqu’à 10 fichiers                        |
| `description_images`                            | Text                                                      |

Les valeurs réelles de disposition contiennent des espaces. Le code les normalise en interne et accepte aussi les formes avec underscores du brief, sans modifier PocketBase.

Pour chaque projet : `filter=projet="identifiant"`, `sort=ordre,id`. Chaque section choisit son composant. Le nombre de sections est libre. Une disposition inconnue déclenche une erreur explicite pour éviter de perdre silencieusement du contenu.

Si la disposition est vide et que seules les images `image_largeur` sont renseignées, la section utilise la pleine largeur. Ce cas non ambigu permet d’afficher les contenus Olyvia actuels sans modifier la base. Renseigner la disposition reste préférable.

- Deux colonnes : textes et images gauche/droite ; une colonne entièrement vide disparaît. Le texte conserve ses sauts de ligne et s’affiche comme du texte échappé.
- Pleine largeur : galerie `image_largeur` et titre facultatif.
- Les savoirs ne sont jamais recopiés dans les sections.

`description_images` sert d’alternative commune, complétée par l’indice du visuel en cas de galerie. Le schéma ne prévoit pas d’alternative individuelle par fichier : fournir une description commune pertinente. Le site utilise un libellé de secours si elle manque.

## `competences`

`titre` (Text), `description` (Text), `categorie` (Select unique), `niveau` (Select unique), `illustration` (File unique), `ordre` (Number), `publie` (Bool).

Mise à jour du 8 novembre 2026 : les enregistrements de l’instance actuelle exposent `titre`, `description`, `categorie`, `niveau` et `publie`, mais pas `ordre` ni `illustration`. La requête des compétences utilise donc `sort=titre,id` ; demander `sort=ordre,id` provoque un HTTP 400. Les autres collections conservent leur tri par `ordre,id`. Aucune modification de la base n’a été effectuée.

## `savoirs`

`nom` (Text), `categorie` (Select multiple), `logo` (File unique), `description` (Text), `niveau` (Select unique), `competences_liees` (Relation multiple vers `competences`), `ordre` (Number), `publie` (Bool).

Les relations d’un projet sont chargées avec `expand=competences,savoirs`. Les noms et logos sont lus dans les enregistrements liés. Les relations absentes sont acceptées ; les relations non publiées sont omises. Des valeurs de catégorie ou niveau ont des espaces terminaux dans les migrations : ne pas les renommer sans vérifier la base.

## Règles API à corriger avant exposition publique

**État observé :** les règles List, View, Create, Update et Delete des quatre collections sont des chaînes vides. Cela autorise les requêtes anonymes correspondantes, y compris les écritures. Les filtres `publie=true` du site ne constituent pas une protection des brouillons. Ce constat vient d’une lecture seule de la configuration locale, sans tentative d’écriture.

Proposition concrète à appliquer par le propriétaire dans PocketBase (non appliquée par Codex) :

| Collection        | List et View           | Create, Update et Delete                     |
| ----------------- | ---------------------- | -------------------------------------------- |
| `Projets`         | `publie = true`        | Verrouillées / superuser uniquement (`null`) |
| `competences`     | `publie = true`        | Verrouillées / superuser uniquement (`null`) |
| `savoirs`         | `publie = true`        | Verrouillées / superuser uniquement (`null`) |
| `sections_projet` | `projet.publie = true` | Verrouillées / superuser uniquement (`null`) |

Les fichiers actuels sont non protégés : connaître leur URL peut permettre de les consulter indépendamment de la visibilité des enregistrements. Protéger des médias confidentiels demanderait un paramétrage des champs File et un flux d’accès adapté, hors modification autorisée à ce stade. Ne pas considérer un brouillon comme un stockage privé de fichiers.

Références : [règles API](https://pocketbase.io/docs/api-rules-and-filters/), [relations](https://pocketbase.io/docs/working-with-relations/), [fichiers](https://pocketbase.io/docs/files-handling/).

## Ajouter les contenus et reconstruire

1. Ajouter les compétences et savoirs, leurs illustrations/logos et leur état de publication.
2. Ajouter les projets avec leur slug et relier leurs compétences et savoirs.
3. Ajouter autant de sections que nécessaire en les reliant au bon projet et en renseignant `ordre`.
4. Ajouter les liens finaux souhaités, puis publier le projet.
5. Exécuter `bun run build`, vérifier avec `bun run preview`, puis déployer le résultat après validation.

Les fichiers des projets sont récupérés depuis PocketBase. Les grandes images sont traitées par le composant natif Astro `Image` : dimensions déduites, variantes WebP et `srcset`. L’instance doit donc être accessible à la construction. La liste des origines autorisées est construite à partir de `POCKETBASE_URL` dans la configuration Astro.

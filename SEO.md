# Référencement technique — 13 novembre 2026

## Constats vérifiés avant modification

Lecture du dépôt, compilation statique réelle avec Bun et requêtes publiques en lecture seule. Le dépôt était propre au début de cette intervention. Aucune donnée PocketBase ni configuration du VPS n’a été modifiée.

| Élément | Constat | Suite donnée |
| --- | --- | --- |
| Métadonnées | Titre, description, canonical, Open Graph, `lang="fr"` déjà présents | Conservation du layout commun, sans second système SEO |
| Projets | Titres limités au nom ; description Olyvia arrêtée sur « mobile, av » | Titres descriptifs et cinq descriptions rédigées depuis les contenus actuels |
| Descriptions de secours | `.slice(0, 180)` coupait les mots | Nettoyage HTML/entités, phrases complètes ou limite de mots avec ellipse ; repli explicite |
| Données structurées | Aucun JSON-LD | `WebSite` à l’accueil, `ProfilePage`/`Person` à propos, `CreativeWork` et contributeur sur les projets |
| Partage | Couvertures PocketBase en AVIF, portrait par défaut en WebP | JPEG locaux générés par Astro pour les métadonnées, sans remplacer les images affichées |
| Canonical et sitemap | Cohérents avec le domaine localement configuré ; sitemap public avec neuf URL | Validation HTTPS de `SITE_URL`, déduplication, échappement XML ; build bloqué si le domaine manque |
| HTTP public | `http://portfolio.melvyn-philippon.fr/` répondait **200**, sans `Location` | Exemple Apache de redirection permanente à appliquer séparément |
| Ancienne route | `/projets/la-cimade/` répondait **200** avec une redirection HTML vers `/projets/lacimade/` | Route conservée en secours ; règle Apache **301** préparée pour les deux variantes avec/sans slash |
| URL inconnue | Vrai **404**, mais page générique Apache | `ErrorDocument 404 /404.html` préparé, sans remplacement par un index de SPA |
| PocketBase indisponible | Les erreurs réseau/API faisaient déjà échouer la récupération | Comportement conservé et échec du build vérifié ; pas de remplacement par une liste vide |
| Déploiement | Compilation directement dans le répertoire servi | Workflow préparé pour construire et contrôler dans `.astro/deploy-dist` avant promotion |

Les autres pages possèdent déjà un H1, un `main`, des liens HTML vers les projets et des alternatives d’images. Les pages légales et la 404 restent en `noindex`. Le sitemap conserve les **neuf pages indexables** : accueil, À propos, Projets, Contact et cinq projets publiés. Il exclut les pages légales, la 404 et l’ancienne route. Aucun `lastmod` n’est inventé.

## Organisation et choix éditoriaux

- `src/layouts/BaseLayout.astro` reste le point unique de rendu des métadonnées et du JSON-LD. Les JSON sont sérialisés avec `<` échappé pour empêcher une fermeture de script injectée par le contenu.
- `src/lib/seo.js` partage les fonctions de validation d’URL, description, XML et sérialisation. La correspondance par slug décrit les cinq projets actuels ; les futurs projets utilisent automatiquement leurs champs PocketBase, sans migration de base.
- `astro.config.mjs` déclare le domaine, le mode statique et le slash final. Le contrôle de configuration s’exécute avant le build.
- Les projets collectifs restent collectifs. Le JSON-LD utilise `contributor`, sans attribuer à Melvyn la création exclusive du travail de l’équipe. AQITA décrit la conception éditoriale et les maquettes mobiles. La Cimade reste un **exercice et une proposition de refonte**, pas une identité officiellement adoptée.
- Aucun poste, diplôme obtenu, client, adresse, disponibilité, date de publication, avis ou note n’est ajouté. Les réseaux structurés viennent uniquement des URL sociales déjà configurées.
- Aucun fil d’Ariane ni `BreadcrumbList` n’est ajouté : la navigation existante reste inchangée. Aucun texte caché pour les moteurs, `meta keywords` ou attribut ARIA artificiel n’est ajouté.
- `og:image` et `twitter:image` utilisent une URL absolue vers un JPEG de couverture, ou vers le portrait existant en repli, avec type, dimensions et alternative. Les JPEG font au total environ **544 ko dans le build** ; ils ne sont pas chargés par les balises d’images des pages.
- Sur la galerie Projets, seule la première image garde une priorité réseau élevée ; les suivantes restent différées. Les autres réglages d’images, polices et animations sont conservés.

Les titres et descriptions peuvent être reformulés par Google. Les longueurs utilisées ici sont des choix éditoriaux de repli, pas une limite imposée par Google. Un JSON-LD syntaxiquement valide ne garantit ni résultat enrichi ni gain de position. Aucune promesse d’indexation n’est faite.

## Configuration et commandes locales — Windows / PowerShell

Le fichier `.env` n’est pas versionné. `.env.example` contient uniquement des valeurs publiques :

```dotenv
POCKETBASE_URL=https://pb.melvyn-philippon.fr
SITE_URL=https://portfolio.melvyn-philippon.fr
```

`SITE_URL` désigne l’origine HTTPS du nom de domaine public, sans chemin, port, paramètres ou fragment. Elle est obligatoire pour construire ; une adresse IP, une URL locale ou HTTP est refusée. En développement seulement, une valeur vide omet les métadonnées absolues et le JSON-LD, bloque l’exploration dans `robots.txt` et rend le sitemap indisponible.

`POCKETBASE_URL` désigne l’API publique lue pendant la compilation. Elle peut désigner une instance locale pour les tests et le développement. Aucun identifiant administrateur n’est utilisé. Un champ facultatif vide reste accepté ; une erreur de récupération n’est pas traitée comme une absence normale de contenu. Une réponse API valide sans aucun projet publié reste possible.

Après examen du `.env` local, exécuter :

```powershell
bun ci
bun run test
bun run --bun build
bun run check:seo
bun run --bun preview
```

`bun run check:seo` inspecte le vrai `dist` sans interroger PocketBase : unicité des métadonnées, URL, JSON-LD, sitemap, robots, images de partage, dimensions/chargement, liens internes et pages isolées. Le rapport est dans `.astro/seo-report.json`, ignoré par Git. Pour un autre répertoire : `bun run check:seo .astro/deploy-dist`.

Modifier le `.env` local **ne modifie pas celui du VPS**. Une modification de contenu PocketBase ne change pas les fichiers déjà publiés : il faut reconstruire puis publier à nouveau.

### Point de vigilance Git préexistant

Le contrôle `git ls-files` a trouvé trois fichiers **déjà suivis avant cette intervention** : `pb_data/auxiliary.db`, `pb_data/data.db` et `pb_data/types.d.ts`. `.gitignore` n’enlève pas les fichiers déjà suivis. Ils n’ont pas été lus ni modifiés pour cet audit. Aucune base ou clé n’a été ajoutée par les changements SEO.

Avant de publier, examiner ce suivi et l’historique distant. Pour retirer ces trois chemins du suivi sans supprimer les fichiers locaux, le propriétaire peut exécuter dans **PowerShell local**, après examen :

```powershell
git rm --cached -- pb_data/auxiliary.db pb_data/data.db pb_data/types.d.ts
```

Cette commande prépare des suppressions dans l’index Git ; elle n’a **pas** été exécutée par Codex. Elle ne retire pas les versions déjà présentes dans l’historique. Si ces bases ont déjà été exposées, examiner séparément les données concernées et les éventuels secrets à renouveler, sans supposer que leur simple retrait du dernier commit suffit.

## Déploiement préparé, non exécuté

Le workflow `.github/workflows/deploy.yml` continue d’utiliser `bun ci` et `bun run --bun build`, sur `main`. Il construit désormais dans `.astro/deploy-dist`, lance l’audit sur ce répertoire, puis seulement remplace `dist`. Un échec de configuration, de récupération ou d’audit laisse donc le répertoire publié en place. Un échec de promotion ou du contrôle HTTP déclenche une tentative de restauration de l’ancien `dist`.

La concurrence GitHub est limitée à un déploiement du portfolio à la fois. La promotion emploie deux renommages de répertoires : elle peut créer une très brève fenêtre sans `dist` et **n’est pas une publication atomique par lien symbolique**. Le workflow n’a pas été exécuté sur le VPS. Sa syntaxe YAML et shell a été contrôlée localement ; sa commande de compilation dans le répertoire temporaire et l’audit associé ont été exécutés avec succès. Si `.astro/deploy-previous` subsiste après une interruption, l’inspecter et décider de restaurer/conserver son contenu avant de relancer : le workflow refuse de l’écraser.

## Actions manuelles — VPS Linux après connexion SSH

Ces commandes sont proposées pour le propriétaire et **n’ont pas été exécutées sur le VPS**.

1. Vérifier séparément `/var/www/portfolio/Portfolio/.env` avec les deux valeurs publiques ci-dessus. Conserver ce fichier hors de Git.
2. Examiner les VirtualHosts actuellement chargés et les modules :

   ```sh
   sudo apachectl -S
   sudo apachectl -M
   ```

3. Sauvegarder le fichier de configuration identifié par ces commandes, puis **fusionner uniquement les blocs du domaine portfolio** depuis [l’exemple Apache](docs/apache/portfolio.conf.example). Ne pas remplacer un fichier commun à plusieurs sites. Ne pas modifier le VirtualHost de `pb.melvyn-philippon.fr`. Conserver les options TLS et le mécanisme de renouvellement Let's Encrypt existants.
4. Dans le VirtualHost HTTP du portfolio, placer la redirection spécifique La Cimade avant la redirection générale HTTPS. Dans le VirtualHost HTTPS, ajouter la 301 de l’ancienne route et `ErrorDocument 404 /404.html`. Conserver `DirectoryIndex index.html`, les vrais fichiers statiques et l’absence de repli global vers l’accueil. Le certificat et le `DocumentRoot` de l’exemple correspondent aux chemins fournis par le propriétaire.
5. Le cache long et immuable est limité à `/_astro/`, réservé aux ressources fingerprintées du build. Le HTML et les endpoints sont revalidés (`no-cache`). Les images/polices publiques sans empreinte ne reçoivent pas ce cache long. La compression textuelle optionnelle s’applique si `deflate_module` et `filter_module` sont actifs ; `headers_module` est nécessaire pour les en-têtes proposés. Les blocs sont protégés par `IfModule` : sans ces modules, ces optimisations ne sont pas appliquées. Ne pas activer un module aveuglément sur un serveur partagé.
6. **Après publication des fichiers du site**, tester la configuration puis recharger uniquement si le test réussit :

   ```sh
   sudo apachectl configtest
   # Seulement si le résultat est « Syntax OK » :
   sudo systemctl reload apache2
   ```

   Le nom de service ci-dessus correspond à Debian/Ubuntu ; vérifier celui de la distribution avant usage.

7. Vérifier les réponses, sans se fier uniquement au navigateur :

   ```sh
   curl -I http://portfolio.melvyn-philippon.fr/
   curl -I http://portfolio.melvyn-philippon.fr/projets/la-cimade/
   curl -I https://portfolio.melvyn-philippon.fr/projets/la-cimade
   curl -I https://portfolio.melvyn-philippon.fr/projets/la-cimade/
   curl -I https://portfolio.melvyn-philippon.fr/projets/lacimade/
   curl -I https://portfolio.melvyn-philippon.fr/verification-seo-inexistante/
   curl --compressed -I https://portfolio.melvyn-philippon.fr/
   curl --fail https://portfolio.melvyn-philippon.fr/sitemap.xml
   curl --fail https://portfolio.melvyn-philippon.fr/robots.txt
   ```

   Attendus : HTTP général **301** vers HTTPS ; ancienne route **301** vers `https://portfolio.melvyn-philippon.fr/projets/lacimade/` ; route actuelle **200** ; URL inconnue **404** avec la page Astro personnalisée. Le `Location` doit rester sur le domaine du portfolio. Vérifier aussi un chemin `/_astro/…` réel copié du HTML pour son cache immuable et son type MIME. `ErrorDocument` doit utiliser le chemin local `/404.html`, jamais une URL HTTPS qui produirait une redirection.

Le build Astro conserve la page HTML de redirection pour les hébergements locaux sans ces règles ; elle ne remplace pas la 301 serveur. Apache n’étant pas installé dans cet environnement Windows, l’exemple ne peut pas être déclaré validé par `apachectl configtest` ici.

## Search Console et contrôles après publication

- Inspecter l’accueil, À propos et un projet ; vérifier le HTML exploré, l’URL canonique déclarée et celle retenue par Google. Demander une indexation sur quelques pages prioritaires si nécessaire.
- Vérifier la lecture du sitemap existant à la même adresse et ses neuf URL actuelles. Les futurs projets publiés s’y ajoutent au prochain build ; nul besoin de créer un second sitemap.
- Contrôler l’ancienne route et la 404 après application des règles Apache. Observer ensuite les rapports d’indexation sans interpréter leur délai de mise à jour comme une erreur immédiate.
- Vérifier le JSON-LD dans le test de résultats enrichis Google et le validateur Schema.org. `CreativeWork` décrit le contenu sans revendiquer un résultat enrichi dédié. Vérifier manuellement les cartes de partage après publication et actualiser le cache de l’outil de partage si nécessaire.
- Contrôler les pages sur ordinateur et mobile, puis mesurer Lighthouse si disponible. Les Core Web Vitals réels nécessitent des données d’utilisateurs ; aucun score ni succès visuel n’est revendiqué ici.
- `robots.txt` organise l’exploration : il **ne protège pas des données privées**. Cette protection relève des contrôles d’accès, notamment côté PocketBase.

## Vérifications réalisées et limites

- `bun ci`, `bun run test` : **45 tests réussis** ; `bun run --bun build` réussi sur les **cinq vrais projets publiés**.
- Compilation de staging avec la commande du workflow et audit du staging réussis.
- **12 pages HTML de contenu**, **9 URL de sitemap**, **49 images**, **7 pages JSON-LD**, **286 références** vérifiées, aucune erreur dans l’audit. XML également chargé par le parseur XML PowerShell ; HTML validé avec les règles sémantiques recommandées.
- Trois builds isolés refusés comme prévu : `SITE_URL` vide, origine `https://localhost`, PocketBase inaccessible. Ils n’ont pas utilisé ni remplacé `dist`.
- Comparaison des corps HTML : inchangés après exclusion des seuls attributs de chargement. Empreintes CSS inchangées ; CSS compilé **99 287 octets**, JavaScript navigateur **14 943 octets**, identiques à la référence de cette intervention. Aucun script d’animation n’a été modifié.
- Vérification des fichiers modifiés et ajoutés : pas de `.env`, clé privée, jeton ou données PocketBase ajouté au dépôt.
- Accès natif au navigateur indisponible (« native pipe » introuvable). Pas de validation visuelle desktop/mobile, de Lighthouse, de test de lecteur d’écran, de validation externe des résultats enrichis ni de mesure des Core Web Vitals réels. Aucun appel à Search Console et aucun accès d’écriture au serveur.
- Aucun commit, push ou déploiement. La configuration Apache reste un **exemple à intégrer et tester sur le serveur**.

## Références officielles utilisées

- [Google : titres descriptifs](https://developers.google.com/search/docs/appearance/title-link) et [descriptions et extraits](https://developers.google.com/search/docs/appearance/snippet) : textes propres à chaque page, sans promesse de contrôle de l’extrait.
- [Google : ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page) et [Schema.org : CreativeWork](https://schema.org/CreativeWork) : types limités au contenu réellement présenté.
- [Astro : configuration `site`, slash final et routes](https://docs.astro.build/en/reference/configuration-reference/) : architecture statique et domaine cohérent.
- [Google : construction des sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) et [rôle de robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro) : URL publiques, absence de dates artificielles et limites de protection.
- [Apache : ordre des Redirect/RedirectMatch](https://httpd.apache.org/docs/2.4/mod/mod_alias.html#order), [ErrorDocument](https://httpd.apache.org/docs/2.4/mod/core.html#errordocument), [en-têtes](https://httpd.apache.org/docs/2.4/mod/mod_headers.html) et [compression](https://httpd.apache.org/docs/2.4/mod/mod_deflate.html) : redirections spécifiques d’abord, chemin local de la 404, cache et compression ciblés.

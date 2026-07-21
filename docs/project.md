# FuelLog - Mini-framework TypeScript reactif et application de demonstration

## Presentation du projet
FuelLog est un mini-framework TypeScript cote client, accompagne d'une application de demonstration complete, developpe sans bibliotheque externe autre que Vite pour le bundling. Le framework s'appuie exclusivement sur l'API DOM standard et sur l'ensemble des Design Patterns demandes dans le sujet.

L'application de demonstration permet a un motard de suivre ses pleins de carburant, sa consommation moyenne en L/100 km, sa depense totale et son cout au kilometre. Elle sert surtout de preuve fonctionnelle que le framework gere la creation de composants, la reactivite Observable, le routage client, le store global, la validation de formulaires et un CRUD complet.

## Stack technique et contraintes

- **Langage** : TypeScript avec `strict: true`
- **Bundler** : Vite.js uniquement
- **Execution** : Node.js pour le developpement
- **Infrastructure** : Docker + Docker Compose obligatoires, avec serveur HTTP statique de type Nginx
- **UI** : HTML, CSS et DOM API vanilla (`document.createElement`, `appendChild`, `addEventListener`, etc.)
- **Tests** : Vitest avec `jsdom` si necessaire
- **Bibliotheques externes** : interdites (`React`, `Vue`, `Svelte`, `jQuery`, `Lodash`, etc.)

## Architecture des dossiers

```text
projet/
├── src/
│   ├── core/
│   │   ├── factory.ts
│   │   ├── builder.ts
│   │   ├── singleton.ts
│   │   ├── strategy.ts
│   │   └── observer.ts
│   ├── components/
│   ├── store/
│   ├── router/
│   ├── http/
│   ├── utils/
│   ├── app.ts
│   └── main.ts
├── public/
│   └── index.html
├── tests/
│   └── *.test.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Bareme detaille - 20 points

Les sections ci-dessous reprennent les parties notees du sujet, avec leur numerotation, leurs sous-points attendus et le nombre de points associe a chaque partie.

## 1. Infrastructure et application reactive - 1 pt

Le projet doit demarrer via Vite en developpement puis etre servi en local via Docker Compose sur `localhost`. Des elements HTML sont crees dynamiquement via le framework, styles et comportements inclus. Les interactions utilisateur mettent a jour le DOM sans rechargement de page.

Sous-points attendus :

1. Projet Vite + TypeScript configure avec `strict: true`
2. `Dockerfile` et `docker-compose.yml` presents et fonctionnels
3. Application accessible dans le navigateur via `localhost`
4. Utilisation de l'API DOM standard pour creer et inserer les elements
5. Creation interactive d'elements HTML via le framework
6. Gestion des evenements utilisateur avec `addEventListener`
7. Application de styles CSS dynamiques
8. Mise a jour du DOM en reponse aux actions utilisateur

Exemples concrets dans FuelLog :

1. clic sur un bouton pour naviguer vers une vue ou supprimer une entree
2. saisie dans un formulaire avec validation immediate
3. mise a jour instantanee du dashboard et du tableau lorsque les donnees changent
4. application dynamique de classes CSS selon l'etat d'un composant ou d'un champ invalide

## Implementation des Design Patterns

### 2. Builder - `TagBuilder` - 1 pt

Le Builder prend en charge la construction d'elements DOM complexes avec une API fluide :

1. `withText(text)`
2. `withClass(className)`
3. `withStyle(property, value)`
4. `withEvent(event, handler)`
5. `withChild(child)`
6. `withoutClass(className)`
7. `withoutEvent(event)`
8. `build()`

Dans FuelLog, il est utilise pour composer les cartes de statistiques, les lignes du tableau, les formulaires et les modales de confirmation sans multiplier les constructeurs surcharges.

### 3. Factory - `TagFactory` - 1 pt

La Factory sert a instancier rapidement les elements HTML simples a partir d'un `Record<ElementType, Tag>` sans `if` ni `switch`.

Tags prevus :

1. `ButtonTag`
2. `DivTag`
3. `ImageTag`
4. `HorizontalRuleTag`
5. `InputTag`
6. `HeadingTag`
7. `SpanTag`
8. `ParagraphTag`

Dans FuelLog, elle est utilisee pour les boutons d'action, les champs de formulaire, les labels, les titres de sections et les messages d'erreur.

### 4. Singleton - `AppConfig` et `AppStore` - 1 pt

`AppConfig` centralise une configuration globale unique :

1. `apiUrl`
2. `currency`
3. `distanceUnit`
4. `defaultStorageStrategy`

`AppStore` expose une instance unique d'etat centralise et type, basee sur une `StorageStrategy`. Il fournit :

1. lecture et ecriture de l'etat
2. changement de strategie a chaud via `setStrategy()`
3. mecanisme d'actions explicites pour des mises a jour previsibles
4. synchronisation avec des `Observable` pour notifier les composants

Etat principal de FuelLog :

1. `fillUps: FillUp[]`
2. `selectedFillUpId: string | null`
3. `formDraft: FillUpFormState`
4. `loading: boolean`
5. `error: string | null`

### 5. Strategy - stockage et validation - 5 pts

#### Stockage

Une interface `StorageStrategy` unifie les operations `get`, `set`, `remove` et `clear` avec une API basee sur des Promesses, afin d'absorber proprement la difference entre backends synchrones et asynchrones.

Strategies prevues :

1. `VolatileStorage` pour le developpement ou les tests
2. `LocalStorageAdapter` pour la persistence navigateur simple
3. `IndexedDBStorage` pour des volumes plus importants

#### Validation de formulaires

Une famille de `ValidationStrategy` est appliquee champ par champ :

1. `RequiredStrategy`
2. `NumericStrategy`
3. `MinStrategy`
4. `PatternStrategy`

Ces strategies permettent de valider le kilometrage, les litres, le prix, ainsi que les contraintes metier comme "le kilometrage doit etre superieur au precedent plein".

### 6. Observer - `Observable<T>` - 2 pts

Le framework expose un `Observable<T>` generique avec :

1. `subscribe(callback)` retournant une fonction de desinscription
2. `next(value)` pour propager une nouvelle valeur

Dans FuelLog, les changements d'etat du store, de la route active et des champs de formulaire sont diffuses via des observables. Le DOM est alors mis a jour de maniere directe et ciblee, sans Virtual DOM.

## 7. Systeme de composants avec cycle de vie - 1 pt

Le framework inclut une classe de base `Component` avec les responsabilites suivantes :

1. encapsuler l'etat local et les props
2. produire un `HTMLElement` via `render()`
3. exposer `onMount()`, `onUpdate()` et `onDestroy()`
4. nettoyer les abonnements et ecouteurs lors de la destruction

Exemples de composants reutilisables :

1. `StatCard`
2. `FillUpTable`
3. `FillUpForm`
4. `Modal`
5. `Layout`

Chaque composant peut recevoir des props descendantes, emettre des evenements vers son parent et accueillir des enfants via un mecanisme de slots.

## 8. Reactivite Observable vers le DOM - 1 pt

Le framework lie directement les observables aux noeuds du DOM :

1. le compteur d'entrees du tableau se met a jour quand `fillUps` change
2. les cartes du dashboard recalculent la consommation et le budget total a chaque ajout, modification ou suppression
3. le routeur notifie la vue active via un observable de route
4. les composants se desabonnent lors de `onDestroy()` pour eviter les fuites memoire

Cette reactivite reste entierement imperative et ciblee, sans Virtual DOM.

## 9. Store global et actions - 1 pt

Le store combine les patterns Singleton et Observer :

1. une instance unique porte l'etat global
2. les composants s'abonnent aux tranches d'etat utiles
3. les modifications passent par des actions explicites

Actions prevues dans FuelLog :

1. `loadFillUps()`
2. `addFillUp(payload)`
3. `updateFillUp(id, payload)`
4. `deleteFillUp(id)`
5. `selectFillUp(id | null)`
6. `setFormDraft(payload)`
7. `setStorageStrategy(strategy)`

L'ensemble est fortement type pour respecter TypeScript strict.

## 10. Gestion des formulaires avec validation - 1 pt

Le formulaire d'ajout et d'edition d'un plein implemente :

1. binding bidirectionnel entre les `input` et l'etat `formDraft`
2. validation en temps reel par strategies
3. affichage des messages d'erreur au niveau de chaque champ
4. soumission avec recuperation des donnees normalisees
5. reinitialisation ou pre-remplissage selon le mode creation ou edition

Champs principaux :

1. date du plein
2. kilometrage compteur
3. litres ajoutes
4. prix par litre
5. commentaire optionnel

## 11. Routage client - 1 pt

Le routeur utilise l'History API :

1. `history.pushState`
2. `history.replaceState`
3. ecoute de `popstate`

Un `Observable<string>` represente la route active afin de declencher le rendu conditionnel des vues.

Vues de l'application :

1. **`/` - Dashboard** : synthese des indicateurs, acces rapide aux actions et cartes composees avec slots
2. **`/history` - Historique** : liste complete des pleins avec lecture, suppression et acces a l'edition
3. **`/fillups/new` - Nouveau plein** : formulaire de creation
4. **`/fillups/:id/edit` - Edition** : formulaire pre-rempli pour modifier un plein existant

Cette organisation garantit une demonstration explicite d'un CRUD complet.

## 12. Composition de composants et slots - 1 pt

La composition parent-enfant est prise en charge par le framework :

1. un `Layout` accueille `Header`, contenu principal et `Footer`
2. une `Card` peut recevoir un titre, un corps et des actions en enfants
3. une `Modal` peut inserer n'importe quel contenu dans son slot principal

Les composants communiquent via :

1. props descendantes pour transmettre les donnees
2. callbacks ou evenements pour remonter les actions utilisateur

## 13. Client HTTP - 1 pt

Un client HTTP generique base sur `fetch` est fourni pour centraliser les acces reseau.

Fonctionnalites attendues :

1. `GET`, `POST`, `PUT`, `DELETE`
2. gestion des erreurs HTTP et reseau
3. gestion des timeouts
4. serialisation et deserialisation JSON
5. point d'extension pour des interceptors optionnels

### Integration prevue avec les prix des carburants en France

Le client HTTP doit pouvoir interroger une source reelle de prix des carburants pour enrichir FuelLog avec des donnees externes.

Source retenue a ce stade :

1. flux officiel de l'Etat diffuse via `data.economie.gouv.fr`
2. dataset : `prix-des-carburants-en-france-flux-instantane-v2`
3. acces en JSON par requetes HTTP `GET`
4. CORS ouvert, ce qui permet une consommation directe depuis le navigateur

Exemples de cas d'usage prevus :

1. rechercher des stations par ville ou code postal
2. filtrer les stations selon un type de carburant (`Gazole`, `SP95`, `E10`, `SP98`, `E85`, `GPLc`)
3. recuperer le prix courant d'un carburant pour pre-remplir ou comparer une saisie utilisateur
4. afficher la date de derniere mise a jour du prix
5. exploiter les coordonnees geographiques, le departement, la region, les services et les ruptures

Structure de donnees utile cote application :

1. identifiant de station
2. adresse, ville, code postal
3. latitude et longitude
4. liste des carburants disponibles et indisponibles
5. prix par carburant (`gazole_prix`, `sp95_prix`, `e10_prix`, `sp98_prix`, `e85_prix`, `gplc_prix`)
6. horodatage de mise a jour associe a chaque prix
7. informations de rupture temporaire ou definitive

Strategie d'integration recommandee :

1. encapsuler l'API externe dans un service dedie du client HTTP
2. convertir la reponse brute en types TypeScript metier utilisables par le store et les composants
3. normaliser les valeurs facultatives ou absentes (`null`)
4. prevoir une couche d'adaptation pour pouvoir changer de fournisseur sans impacter le reste de l'application

Source secondaire documentee :

1. une API REST tierce referencee sur `data.gouv.fr` est disponible via `api.prix-carburants.2aaz.fr`
2. elle expose une specification Swagger avec des routes de stations, carburants et prix agreges
3. elle peut servir de surcouche de consultation, mais le flux officiel reste la reference prioritaire pour la robustesse et la tracabilite des donnees

Verification documentaire effectuee le 21 juillet 2026 :

1. la fiche `data.gouv.fr/reuses/api-prix-carburants` reference bien la surcouche API 2aaz
2. la specification Swagger 2aaz expose notamment `/stations/`, `/station/{id}`, `/fuels/` et `/fuel/{fid}/price/{period}`
3. le flux officiel `data.economie.gouv.fr` repond en JSON avec des champs exploitables directement par FuelLog

Au demarrage, FuelLog ouvre l'application avec un etat vide. Aucun fichier de seed local n'est requis dans le flux normal. Les donnees utilisateur sont ensuite creees via le formulaire, puis enrichies au besoin par les informations issues de l'API carburants.

## 14. Application de demonstration complete - 1 pt

FuelLog doit demonstrer tous les patterns du framework a travers un cas d'usage concret :

1. creation d'un plein
2. consultation de l'historique
3. modification d'un plein existant
4. suppression d'un plein
5. recalcul automatique des statistiques
6. navigation entre plusieurs pages sans rechargement
7. persistence configurable via les strategies de stockage

L'interface doit rester soignee, lisible et entierement pilotee par le framework maison.

## 15. Tests unitaires et qualite du code - 1 pt

La qualite attendue couvre a la fois le framework et l'application de demonstration.

Tests Vitest a prevoir :

1. au moins un test par methode publique
2. tests pour `Builder`, `Factory`, `Singleton`, `Strategy`, `Observer`
3. tests pour le systeme de composants et leur cycle de vie
4. tests pour le store global et ses actions
5. tests pour le routeur et la navigation
6. tests pour la reactivite Observable vers le DOM
7. tests pour les formulaires, la validation et les messages d'erreur
8. mocks DOM avec `jsdom` lorsque necessaire

Exigences de qualite :

1. JSDoc sur toutes les classes, interfaces et methodes publiques
2. aucun `any`
3. pas de code mort
4. pas de commentaires superflus
5. conventions TypeScript strict respectees
6. architecture coherente et lisible
7. `Dockerfile` et `docker-compose.yml` fonctionnels et verifiables

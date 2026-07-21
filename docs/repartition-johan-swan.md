# Repartition Johan / Swan

Ce document complete [project.md](/home/johanledoux/Documents/esgi/t3/design-patern/project/docs/project.md:1) en proposant une repartition **equilibree**, **sequentielle** et **sans chevauchement fonctionnel** entre **Johan** et **Swan**.

## Principe de decoupage 

Pour eviter les chevauchements, on se fixe une regle simple :

- **Johan livre les abstractions, le runtime de base et les mecanismes generiques du framework**
- **Swan consomme ces mecanismes pour brancher les fonctionnalites avancees, les integrations metier et la finition du projet**

Autrement dit :

- Johan construit le **moteur**
- Swan construit les **extensions et l'application finale**

## Repartition equilibree - 20 points

| Ordre | Attendu du sujet | Points | Responsable | Frontiere anti-chevauchement |
| --- | --- | --- | --- | --- |
| 1 | Infrastructure et application reactive | 1 pt | Johan | Johan prepare le projet Vite, TypeScript strict, Docker, le point d'entree et une app minimale qui tourne |
| 2 | Builder - Construction d'elements DOM | 1 pt | Johan | Johan livre `TagBuilder` et ses operations, Swan ne reimplemente aucune primitive DOM |
| 3 | Factory - Creation rapide d'elements HTML | 1 pt | Johan | Johan livre `TagFactory` et les tags de base, Swan se contente de les utiliser |
| 4 | Singleton - Gestion d'etat et configuration | 1 pt | Johan | Johan livre `AppConfig` et la structure de `AppStore`, avec point d'injection pour une strategy |
| 5 | Observer - Reactivite et evenements | 2 pts | Johan | Johan livre `Observable<T>` et les abonnements, Swan n'y touche pas |
| 6 | Systeme de composants avec cycle de vie | 1 pt | Johan | Johan livre la classe `Component`, le montage, la mise a jour et la destruction |
| 7 | Routage client | 1 pt | Johan | Johan livre le routeur, les routes, l'observable de navigation et le rendu de vues de base |
| 8 | Store global et actions | 1 pt | Johan | Johan livre l'etat global, les actions principales et l'API de store, sans implementer les strategies concretes avancees |
| 9 | Reactivite Observable -> DOM | 1 pt | Johan | Johan livre le mecanisme generique de binding/mise a jour DOM, Swan l'exploite dans les vues |
| 10 | Strategy - stockage et validation | 5 pts | Swan | Swan implemente les strategies concretes de stockage et les strategies de validation de formulaires, sans refaire le store |
| 11 | Gestion de formulaires avec validation | 1 pt | Swan | Swan branche les validations sur le formulaire metier en s'appuyant sur le store et les composants existants |
| 12 | Composition de composants (slots) | 1 pt | Swan | Swan enrichit les composants existants avec les slots et la composition parent-enfant, sans refondre la base `Component` |
| 13 | Client HTTP | 1 pt | Swan | Swan implemente le client `fetch` et les services carburant, sans modifier le coeur du framework |
| 14 | Application de demonstration complete | 1 pt | Swan | Swan assemble dashboard, historique, creation, edition et suppression a partir du socle deja pose |
| 15 | Tests unitaires et qualite du code | 1 pt | Swan | Swan couvre le framework et l'application, harmonise la qualite et finalise la livraison |

## Equilibre des points

| Responsable | Total |
| --- | --- |
| Johan | 10 pts |
| Swan | 10 pts |

## Ce que Johan doit livrer avant le passage a Swan

Johan doit laisser une base deja exploitable, avec :

1. un projet qui demarre avec Vite et Docker
2. un framework DOM minimal fonctionnel (`Builder`, `Factory`, `Observable`, `Component`, `Router`)
3. un `AppStore` deja utilisable avec ses actions principales
4. une application minimale navigable avec rendu reactif
5. des interfaces stables que Swan pourra consommer sans les redefinir

Concretement, Johan peut fournir :

1. `StorageStrategy` comme **contrat**
2. l'API `setStrategy()` sur le store
3. les hooks de cycle de vie
4. les points d'accroche de binding DOM

Mais Johan ne prend pas :

1. les strategies concretes finales `LocalStorageAdapter` et `IndexedDBStorage`
2. les `ValidationStrategy` metier
3. l'integration HTTP carburant
4. les formulaires complets et la demo finale

## Ce que Swan reprend ensuite

Swan reprend une base stable et se concentre uniquement sur ce qui se branche dessus :

1. implementation des strategies concretes de stockage
2. implementation des strategies de validation
3. construction du vrai formulaire FuelLog
4. ajout des slots et de la composition avancee
5. integration du client HTTP et des donnees carburant
6. assemblage de la demonstration complete
7. tests, JSDoc, nettoyage et verification finale
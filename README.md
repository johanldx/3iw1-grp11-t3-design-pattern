# FuelLog

Mini-framework TypeScript orienté DOM et application de démonstration pour le suivi des pleins de carburant.

## Stack

- TypeScript
- Vite
- Docker
- Docker Compose

## Lancer le projet en développement

```bash
docker compose -f docker-compose.dev.yaml up
```

Application disponible sur `http://localhost:5173`.

## Construire et lancer la version de production

```bash
npm install
npm run build
docker compose -f docker-compose.yml up --build
```

Application disponible sur `http://localhost:8080`.

Le fichier attendu par le sujet, `docker-compose.yml`, est présent à la racine pour le service de production.

## Scripts utiles

```bash
npm run dev
npm run build
npm run preview
npm test
```

## Lancer les tests

```bash
npm install
npm test
```

Les tests unitaires sont executes avec `Vitest` en environnement `jsdom`.

## Structure

```text
src/
├── bootstrap/
├── components/
├── core/
├── router/
├── views/
├── app.ts
└── main.ts
```

## Documentation

- Sujet : `docs/sujet.pdf`
- Cadrage du projet : `docs/project.md`
- Répartition Johan / Swan : `docs/repartition-johan-swan.md`

## Notes de demonstration

Trois composants sont volontairement conserves dans le projet meme s'ils ne sont plus branches dans l'interface finale :

- `src/components/reactive-dashboard.component.ts`
- `src/components/lifecycle-panel.component.ts`
- `src/components/stat-card.component.ts`

Ils servaient de support de demonstration pour certains points du mini-framework :

- `ReactiveDashboardComponent` pour la reactivite `Observable -> DOM`
- `LifecyclePanelComponent` pour le cycle de vie des composants
- `StatCardComponent` pour une variante de carte reutilisable

L'interface finale a ensuite ete simplifiee pour ne garder que l'application FuelLog sans panneau de debug ni vue de demonstration additionnelle, mais ces fichiers sont conserves comme reference technique et support oral de presentation.

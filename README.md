# FuelLog

Mini-framework TypeScript orienté DOM et application de démonstration pour le suivi des pleins de carburant.

## Stack

- TypeScript
- Vite
- Docker
- Docker Compose

## Lancer le projet en développement

```bash
docker compose -f compose.dev.yaml up
```

Application disponible sur `http://localhost:5173`.

## Construire et lancer la version de production

```bash
npm install
npm run build
docker compose -f compose.yaml up --build
```

Application disponible sur `http://localhost:8080`.

## Scripts utiles

```bash
npm run dev
npm run build
npm run preview
```

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

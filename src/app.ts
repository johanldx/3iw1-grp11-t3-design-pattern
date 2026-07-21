import { startApp } from './bootstrap/app-runtime.ts';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('Application root "#app" not found.');
}

startApp(appRoot);

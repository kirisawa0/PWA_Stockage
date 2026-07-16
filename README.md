# Ma PWA

PWA vierge prête à être personnalisée et publiée sur GitHub Pages.

## Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── icons/
│   ├── icon-192.svg
│   └── icon-512.svg
├── .gitattributes
├── .gitignore
├── app.js
├── index.html
├── manifest.webmanifest
├── service-worker.js
└── styles.css
```

## Lancement local

Vous pouvez utiliser l'extension **Live Server** dans Visual Studio Code.

Vous pouvez aussi lancer un serveur local avec :

```bash
npx serve .
```

## Ajouter le projet sur GitHub

Dans le terminal ouvert dans le dossier du projet :

```bash
git init
git add .
git commit -m "Initialisation de la PWA"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin main
```

Remplacez `VOTRE-COMPTE` et `VOTRE-DEPOT`.

## Activer GitHub Pages

1. Ouvrez le dépôt GitHub.
2. Allez dans `Settings`.
3. Ouvrez `Pages`.
4. Dans `Source`, choisissez `GitHub Actions`.
5. Faites un push sur la branche `main`.

Le workflow publiera automatiquement la PWA.

## Mise à jour du cache

Après une modification importante, changez cette valeur dans `service-worker.js` :

```js
const CACHE_NAME = "pwa-github-v2";
```

Cela force le navigateur à remplacer l'ancien cache.

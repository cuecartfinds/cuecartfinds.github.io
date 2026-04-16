# CueCart Finds Static Website

Simple GitHub Pages-ready landing page for CueCart Finds.

This site uses only:

- `index.html`
- `style.css`
- `script.js`
- image assets in `assets/`

There is no build step, no backend, no npm install, and no paid service required.

## Recommended File Structure

```text
cuecart-finds-site/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── cuecart-finds-favicon.ico
    ├── cuecart-finds-icon-192.png
    └── cuecart-finds-logo-web-600.png
```

## GitHub Repository Naming

For a main GitHub user site, name the repository:

```text
YOUR-GITHUB-USERNAME.github.io
```

Example:

```text
matodobra.github.io
```

That creates a site at:

```text
https://YOUR-GITHUB-USERNAME.github.io/
```

If you do not want this to be your main GitHub Pages site, you can name the repository:

```text
cuecart-finds
```

That creates a project site at:

```text
https://YOUR-GITHUB-USERNAME.github.io/cuecart-finds/
```

## GitHub Pages Deployment Steps

1. Create a new public GitHub repository.
2. Use `YOUR-GITHUB-USERNAME.github.io` if this should be your main user site.
3. Upload all files from this folder into the repository root.
4. Make sure `index.html` is in the root of the repository, not inside another nested folder.
5. Go to the repository on GitHub.
6. Click `Settings`.
7. Click `Pages` in the left menu.
8. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
9. Click `Save`.
10. Wait a minute or two for GitHub Pages to publish.

## Beginner Editing Guide

Edit `index.html` to change:

- site title
- brand tagline
- section copy
- contact email
- affiliate disclosure
- logo file path

Edit `style.css` to change:

- colors
- spacing
- card styles
- mobile/desktop layout

Edit `script.js` only if you want to change:

- mobile menu behavior
- footer year behavior

## Logo Notes

The current logo path is:

```html
assets/cuecart-finds-logo-web-600.png
```

If you upload a different logo later, place it in `assets/` and update the `src` attribute in `index.html`.


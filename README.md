# CueCart Finds Website

GitHub Pages-ready affiliate brand foundation for CueCart Finds.

This is a static website. It has no backend, no database, no build step, no npm install, and no paid service requirement.

## What This Site Includes

- Homepage trust layer
- Product discovery catalog
- Product detail page template
- Three content lanes
- Affiliate disclosure page
- Editorial standards page
- Privacy page
- Contact page
- Custom 404 page
- Product data file
- SEO files
- Analytics-ready outbound click hooks

## Recommended File Structure

```text
cuecart-finds-site/
├── index.html
├── finds.html
├── product.html
├── smart-buys-under-50.html
├── useful-home-finds.html
├── everyday-problem-solvers.html
├── about.html
├── editorial-standards.html
├── contact.html
├── disclosure.html
├── privacy.html
├── 404.html
├── style.css
├── script.js
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── README.md
├── OPERATIONS.md
├── data/
│   └── products.js
└── assets/
    ├── cuecart-finds-favicon.ico
    ├── cuecart-finds-icon-192.png
    ├── cuecart-finds-logo-web-600.png
    └── product-placeholder.svg
```

## GitHub Repository Name

For the live site URL:

```text
https://cuecartfinds.github.io/
```

the repository should be named:

```text
cuecartfinds.github.io
```

under the GitHub account or organization:

```text
cuecartfinds
```

## Deploy on GitHub Pages

1. Open the repository on GitHub.
2. Click `Add file`.
3. Click `Upload files`.
4. Upload the files and folders from this directory.
5. Make sure `index.html` is in the repository root.
6. Do not upload this whole folder inside another folder.
7. Click `Commit changes`.
8. Go to `Settings`.
9. Click `Pages`.
10. Under `Build and deployment`, choose `Deploy from a branch`.
11. Choose branch `main`.
12. Choose folder `/root`.
13. Click `Save`.

The site should publish at:

```text
https://cuecartfinds.github.io/
```

## How to Add a Real Affiliate Product

Open:

```text
data/products.js
```

Copy one product object and edit:

- `slug`
- `title`
- `category`
- `lane`
- `priceLabel`
- `merchant`
- `affiliateUrl`
- `image`
- `imageAlt`
- `hook`
- `benefit`
- `whyWeLike`
- `bestFor`
- `signals`
- `tags`

When the product has a real approved affiliate link, change:

```js
status: "researching"
```

to:

```js
status: "live"
```

and add the real URL:

```js
affiliateUrl: "https://your-approved-affiliate-link-here"
```

Do not add fake affiliate links.

## Product Lanes

Use one of these lane values:

```text
smart-buys-under-50
useful-home-finds
everyday-problem-solvers
```

The lane controls which category page the product appears on.

## Analytics Notes

Outbound affiliate clicks are ready for analytics.

If you later add Google Analytics, Plausible, or Google Tag Manager, `script.js` will emit an `affiliate_click` event.

Without analytics installed, the site still works normally.

## Affiliate and Compliance Notes

Keep these pages live:

- `disclosure.html`
- `editorial-standards.html`
- `privacy.html`
- `contact.html`

These help the site look more legitimate for affiliate program review and make the brand more trustworthy for visitors.

## Beginner Editing Guide

Edit `index.html` to change:

- homepage headline
- brand tagline
- homepage section copy

Edit `data/products.js` to change:

- products
- affiliate links
- merchant/source info
- product copy

Edit `style.css` to change:

- colors
- spacing
- card styles
- layout

Edit `script.js` only if you want to change:

- product rendering
- filters
- affiliate click tracking behavior

## Important Public Repo Warning

If this repository is public, do not store private information in it.

Do not publish:

- passwords
- API keys
- affiliate account logins
- private commission reports
- private revenue numbers

# CueCart Finds Affiliate Operations

This document explains how to operate the static GitHub Pages version of CueCart Finds.

It is public-safe. Do not add private revenue numbers, passwords, API keys, or private affiliate dashboard data here.

## Current System

The site has three public layers:

- Brand trust pages
- Product discovery catalog
- Product detail pages with affiliate-link readiness

The product catalog is powered by:

```text
data/products.js
```

## Product Statuses

Use these status values:

```text
researching
draft
live
```

Recommended meaning:

- `researching`: product type looks promising, but no exact product or approved affiliate link is live yet.
- `draft`: exact product is selected, but copy, merchant, or disclosure is not ready.
- `live`: exact product has an approved affiliate URL and can be shown as a clickable recommendation.

## Going From Researching to Live

Before changing a product to `live`, confirm:

- exact product name
- exact merchant or affiliate network
- approved affiliate URL
- product price range
- product availability
- product image permission or safe image source
- product page copy
- affiliate disclosure is visible
- no exaggerated claims
- no fake urgency

## Product Data Fields

Each product in `data/products.js` supports:

- `slug`: unique URL-safe product identifier
- `title`: public product name
- `category`: display category
- `lane`: category page routing
- `priceLabel`: public price expectation
- `status`: `researching`, `draft`, or `live`
- `merchant`: merchant or affiliate source label
- `affiliateUrl`: approved affiliate link
- `image`: product image path
- `imageAlt`: image description for accessibility
- `hook`: short product hook
- `benefit`: short benefit statement
- `whyWeLike`: practical product rationale
- `bestFor`: list of ideal use cases
- `signals`: demand, visual, price, and affiliate-fit notes
- `tags`: searchable tags
- `updated`: last update date

## Analytics Event Contract

When a live affiliate link is clicked, `script.js` emits:

```text
affiliate_click
```

Payload fields:

- `product_slug`
- `event_label`
- `merchant`
- `event_category`

The script supports:

- Google Analytics `gtag`
- Plausible `plausible`
- Google Tag Manager `dataLayer`

If no analytics tool is installed, clicks still work.

## Recommended Product Selection Rules

Prioritize products that score well on:

- clear buyer problem
- simple visual demo
- affordable price
- merchant trust
- commission opportunity
- low return risk
- broad audience fit
- repeat content potential

Avoid products that depend on:

- medical claims
- unsafe use
- unrealistic before-and-after claims
- counterfeit or unclear merchant listings
- fake scarcity
- private or sensitive customer data

## Static Site Limits

GitHub Pages cannot privately track revenue, store user data, or run server-side redirects.

For production, add a backend or analytics platform when you need:

- private click database
- conversion import
- revenue dashboard
- A/B tests
- automatic affiliate feed imports
- automatic product scoring
- server-side redirect links

Until then, this static site is a strong public trust and routing foundation.

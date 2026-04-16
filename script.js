/*
  CueCart Finds lightweight JavaScript.

  Handles:
  - mobile navigation
  - current footer year
  - catalog rendering from data/products.js
  - product detail pages
  - affiliate outbound click analytics hooks

  No external libraries are required.
*/

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
const year = document.querySelector("#year");
const products = Array.isArray(window.CUECART_PRODUCTS) ? window.CUECART_PRODUCTS : [];

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStatusLabel(product) {
  if (product.status === "live") {
    return "Live affiliate link";
  }

  if (product.status === "draft") {
    return "Draft";
  }

  return "Affiliate source pending";
}

function getProductDetailUrl(product) {
  return `product.html?product=${encodeURIComponent(product.slug)}`;
}

function withTrackingParams(rawUrl, product) {
  if (!rawUrl) {
    return "";
  }

  try {
    const url = new URL(rawUrl);
    if (!url.searchParams.has("utm_source")) {
      url.searchParams.set("utm_source", "cuecartfinds");
    }
    if (!url.searchParams.has("utm_medium")) {
      url.searchParams.set("utm_medium", "affiliate_site");
    }
    if (!url.searchParams.has("utm_campaign")) {
      url.searchParams.set("utm_campaign", product.slug);
    }
    return url.toString();
  } catch (_error) {
    return rawUrl;
  }
}

function affiliateAction(product) {
  if (!product.affiliateUrl) {
    return '<span class="button button-disabled" aria-disabled="true">Affiliate link pending</span>';
  }

  const href = product.appendUtm === false ? product.affiliateUrl : withTrackingParams(product.affiliateUrl, product);

  return `
    <a
      class="button button-primary"
      href="${escapeHtml(href)}"
      target="_blank"
      rel="sponsored nofollow noopener"
      data-affiliate-click
      data-product-slug="${escapeHtml(product.slug)}"
      data-product-title="${escapeHtml(product.title)}"
      data-merchant="${escapeHtml(product.merchant)}"
    >
      Check availability
    </a>
  `;
}

function productCard(product) {
  const statusClass = product.status === "live" ? "status-badge live" : "status-badge";
  const tags = (product.tags || [])
    .slice(0, 4)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="product-card">
      <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt)}" loading="lazy" />
      <div class="product-card-body">
        <div class="product-meta-row">
          <span class="${statusClass}">${escapeHtml(getStatusLabel(product))}</span>
          <span class="price-pill">${escapeHtml(product.priceLabel)}</span>
        </div>
        <h2>${escapeHtml(product.title)}</h2>
        <p>${escapeHtml(product.hook)}</p>
        <div class="tag-list">${tags}</div>
        <div class="product-actions">
          <a class="button button-secondary" href="${escapeHtml(getProductDetailUrl(product))}">View details</a>
          ${affiliateAction(product)}
        </div>
      </div>
    </article>
  `;
}

function renderProductGrid(target, productList, emptyMessage) {
  if (!target) {
    return;
  }

  if (!productList.length) {
    target.innerHTML = `
      <div class="empty-state">
        <p class="eyebrow">No matches</p>
        <h2>No finds matched that filter.</h2>
        <p>${escapeHtml(emptyMessage || "Try another search or category.")}</p>
      </div>
    `;
    return;
  }

  target.innerHTML = productList.map(productCard).join("");
}

function setupCatalogPage() {
  const page = document.querySelector("[data-catalog-page]");
  if (!page) {
    return;
  }

  const grid = document.querySelector("#product-grid");
  const status = document.querySelector("#catalog-status");
  const search = document.querySelector("#product-search");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  let activeFilter = "all";

  function applyFilters() {
    const query = (search?.value || "").trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesFilter = activeFilter === "all" || product.lane === activeFilter;
      const searchableText = [
        product.title,
        product.category,
        product.hook,
        product.benefit,
        product.whyWeLike,
        product.merchant,
        ...(product.tags || []),
        ...(product.bestFor || [])
      ]
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });

    if (status) {
      status.textContent = `${filtered.length} of ${products.length} finds shown`;
    }

    renderProductGrid(grid, filtered, "Try clearing your search or choosing all finds.");
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      applyFilters();
    });
  });

  search?.addEventListener("input", applyFilters);
  applyFilters();
}

function setupCategoryPage() {
  const page = document.querySelector("[data-category-page]");
  if (!page) {
    return;
  }

  const category = page.dataset.category;
  const grid = document.querySelector("#category-product-grid");
  const status = document.querySelector("#category-status");
  const filtered = products.filter((product) => product.lane === category);

  if (status) {
    status.textContent = `${filtered.length} finds in this lane`;
  }

  renderProductGrid(grid, filtered, "This lane is ready for future product additions.");
}

function setupProductDetailPage() {
  const page = document.querySelector("[data-product-detail]");
  if (!page) {
    return;
  }

  const root = document.querySelector("#product-detail-root");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("product");
  const product = products.find((item) => item.slug === slug);

  if (!root) {
    return;
  }

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <p class="eyebrow">Product not found</p>
        <h1>This find is not available.</h1>
        <p>The product may have moved, or the link may not be active yet.</p>
        <a class="button button-primary" href="finds.html">Back to finds</a>
      </div>
    `;
    return;
  }

  document.title = `${product.title} | CueCart Finds`;

  const bestFor = (product.bestFor || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const tags = (product.tags || [])
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");
  const signals = Object.entries(product.signals || {})
    .map(
      ([label, value]) => `
        <div class="signal-chip">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(value)}</span>
        </div>
      `
    )
    .join("");

  root.innerHTML = `
    <article class="product-detail-card">
      <div class="product-detail-media">
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt)}" />
      </div>
      <div class="product-detail-content">
        <p class="eyebrow">${escapeHtml(product.category)}</p>
        <h1>${escapeHtml(product.title)}</h1>
        <div class="product-meta-row">
          <span class="${product.status === "live" ? "status-badge live" : "status-badge"}">${escapeHtml(getStatusLabel(product))}</span>
          <span class="price-pill">${escapeHtml(product.priceLabel)}</span>
        </div>
        <p class="hero-text">${escapeHtml(product.hook)}</p>
        <p>${escapeHtml(product.benefit)}</p>
        <div class="product-actions">
          ${affiliateAction(product)}
          <a class="button button-secondary" href="finds.html">Back to all finds</a>
        </div>
        <ul class="detail-list">
          <li>
            <strong>Why it fits CueCart</strong>
            ${escapeHtml(product.whyWeLike)}
          </li>
          <li>
            <strong>Merchant status</strong>
            ${escapeHtml(product.merchant)}
          </li>
          <li>
            <strong>Updated</strong>
            ${escapeHtml(product.updated)}
          </li>
        </ul>
        <h2>Best for</h2>
        <ul class="detail-list">${bestFor}</ul>
        <h2>Product signals</h2>
        <div class="signals-grid">${signals}</div>
        <div class="tag-list">${tags}</div>
      </div>
    </article>
  `;
}

function setupAffiliateClickTracking() {
  document.addEventListener("click", (event) => {
    const clickedElement = event.target instanceof Element ? event.target : null;
    const link = clickedElement?.closest("[data-affiliate-click]");
    if (!link) {
      return;
    }

    const payload = {
      event_category: "affiliate",
      event_label: link.dataset.productTitle || link.dataset.productSlug || "unknown",
      product_slug: link.dataset.productSlug || "unknown",
      merchant: link.dataset.merchant || "unknown"
    };

    if (typeof window.gtag === "function") {
      window.gtag("event", "affiliate_click", payload);
    } else if (typeof window.plausible === "function") {
      window.plausible("Affiliate Click", { props: payload });
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "affiliate_click", ...payload });
    }
  });
}

setupCatalogPage();
setupCategoryPage();
setupProductDetailPage();
setupAffiliateClickTracking();

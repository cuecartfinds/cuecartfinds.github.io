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
  if (product.affiliateUrl) {
    return "Live affiliate link";
  }

  if (product.product_url) {
    return "Non-affiliate test link";
  }

  if (product.status === "draft") {
    return "Draft";
  }

  return "Affiliate source pending";
}

function getProductDetailUrl(product) {
  return `product.html?product=${encodeURIComponent(product.slug)}`;
}

function isPlaceholderDestination(rawUrl) {
  if (!rawUrl) {
    return true;
  }

  try {
    const url = new URL(rawUrl);
    return url.hostname === "example.com" || url.hostname === "www.example.com";
  } catch (_error) {
    return true;
  }
}

function laneLabel(product) {
  const lanes = {
    "smart-buys-under-50": "Smart Buy Under $50",
    "useful-home-finds": "Useful Home Find",
    "everyday-problem-solvers": "Everyday Problem-Solver"
  };
  return lanes[product.lane] || product.category || "CueCart Find";
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
      url.searchParams.set("utm_campaign", product.utm_slug || product.slug);
    }
    return url.toString();
  } catch (_error) {
    return rawUrl;
  }
}

function affiliateAction(product) {
  const destination = product.affiliateUrl || product.product_url;
  if (!destination || isPlaceholderDestination(destination)) {
    return '<span class="button button-disabled" aria-disabled="true">Source pending</span>';
  }

  const href = product.appendUtm === false ? destination : withTrackingParams(destination, product);
  const rel = product.affiliateUrl ? "sponsored nofollow noopener" : "noopener";

  return `
    <a
      class="button button-primary"
      href="${escapeHtml(href)}"
      target="_blank"
      rel="${rel}"
      data-affiliate-click
      data-product-slug="${escapeHtml(product.slug)}"
      data-product-title="${escapeHtml(product.product_name || product.title)}"
      data-merchant="${escapeHtml(product.merchant)}"
    >
      ${escapeHtml(product.cta || "View Find")}
    </a>
  `;
}

function productTitle(product) {
  return product.product_name || product.title || "CueCart Find";
}

function productBlurb(product) {
  return product.short_blurb || product.hook || "A practical product find selected by CueCart Finds.";
}

function productWhy(product) {
  return product.why_it_matters || product.benefit || product.whyWeLike || "Chosen for usefulness, clear value, and everyday product discovery.";
}

function productImage(product) {
  return product.image || "assets/product-placeholder.svg";
}

function hasRealProductImage(product) {
  return Boolean(product.image && product.image !== "assets/product-placeholder.svg");
}

function productImageAlt(product) {
  return product.imageAlt || `${productTitle(product)} product image.`;
}

function productCard(product) {
  const statusClass = product.status === "live" ? "status-badge live" : "status-badge";
  const title = productTitle(product);
  const blurb = productBlurb(product);
  const why = productWhy(product);
  const tags = (product.tags || [])
    .slice(0, 4)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="product-card">
      <a class="product-image-link product-visual ${hasRealProductImage(product) ? "" : "image-missing"}" href="${escapeHtml(getProductDetailUrl(product))}" aria-label="View details for ${escapeHtml(title)}">
        ${hasRealProductImage(product) ? `
          <img
            class="product-image"
            src="${escapeHtml(productImage(product))}"
            alt="${escapeHtml(productImageAlt(product))}"
            loading="lazy"
            onerror="this.parentElement.classList.add('image-missing'); this.remove();"
          />
        ` : ""}
        <span class="product-visual-fallback">
          <span>${escapeHtml(laneLabel(product))}</span>
          <strong>${escapeHtml(title)}</strong>
        </span>
      </a>
      <div class="product-card-body">
        <div class="product-meta-row">
          <span class="${statusClass}">${escapeHtml(getStatusLabel(product))}</span>
          <span class="price-pill">${escapeHtml(product.priceLabel)}</span>
        </div>
        <div class="product-context-row">
          <span>${escapeHtml(laneLabel(product))}</span>
          <span>${escapeHtml(product.merchant || "Merchant pending")}</span>
        </div>
        <h2>${escapeHtml(title)}</h2>
        <p class="product-card-blurb">${escapeHtml(blurb)}</p>
        <p class="product-card-why">${escapeHtml(why)}</p>
        <div class="tag-list">${tags}</div>
        <p class="card-disclosure">
          ${product.affiliateUrl ? "Affiliate link disclosure applies." : "Non-affiliate destination may be used while approvals are pending."}
        </p>
        <div class="product-actions">
          <a class="button button-secondary" href="${escapeHtml(getProductDetailUrl(product))}">View details</a>
          ${affiliateAction(product)}
        </div>
      </div>
    </article>
  `;
}

function renderProductGrid(target, productList, emptyMessage, emptyTitle = "No public finds are live yet.") {
  if (!target) {
    return;
  }

  if (!productList.length) {
    target.innerHTML = `
      <div class="empty-state">
        <p class="eyebrow">Coming soon</p>
        <h2>${escapeHtml(emptyTitle)}</h2>
        <p>${escapeHtml(emptyMessage || "Try another search or category.")}</p>
      </div>
    `;
    return;
  }

  target.innerHTML = productList.map(productCard).join("");
}

function setupHomeFinds() {
  const featuredGrid = document.querySelector("#featured-finds-grid");
  const latestGrid = document.querySelector("#latest-finds-grid");
  if (!featuredGrid && !latestGrid) {
    return;
  }

  const liveOrReady = products.filter((product) => product.status === "live" || product.product_url || product.affiliateUrl);
  const source = liveOrReady.length ? liveOrReady : products;
  const featuredLane = source.filter((product) => product.lane === "smart-buys-under-50");
  const featured = (featuredLane.length ? featuredLane : source).slice(0, 3);
  const latest = [...source].slice(0, 3);

  renderProductGrid(
    featuredGrid,
    featured,
    "Featured finds will appear here after products are approved, marked live, and exported from the private CueCart dashboard.",
    "Featured finds are being reviewed."
  );
  renderProductGrid(
    latestGrid,
    latest,
    "Latest finds will appear here after the first public product export.",
    "Latest finds are not published yet."
  );
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
        product.product_name,
        product.category,
        product.hook,
        product.short_blurb,
        product.benefit,
        product.why_it_matters,
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

    renderProductGrid(grid, filtered, "Try clearing your search or choosing all finds.", "No finds matched that filter.");
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

  renderProductGrid(grid, filtered, "This lane is ready for future product additions.", "No finds are live in this lane yet.");
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

  const title = productTitle(product);
  const blurb = productBlurb(product);
  const why = productWhy(product);

  document.title = `${title} | CueCart Finds`;

  const bestFor = (product.bestFor || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("") || "<li>Everyday product discovery</li>";
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
    .join("") || `
      <div class="signal-chip">
        <strong>Selection</strong>
        <span>Approved through the CueCart Finds operator workflow.</span>
      </div>
    `;

  root.innerHTML = `
    <article class="product-detail-card">
      <div class="product-detail-media">
        <div class="product-visual detail-visual ${hasRealProductImage(product) ? "" : "image-missing"}">
          ${hasRealProductImage(product) ? `
            <img
              class="product-image"
              src="${escapeHtml(productImage(product))}"
              alt="${escapeHtml(productImageAlt(product))}"
              onerror="this.parentElement.classList.add('image-missing'); this.remove();"
            />
          ` : ""}
          <span class="product-visual-fallback">
            <span>${escapeHtml(laneLabel(product))}</span>
            <strong>${escapeHtml(title)}</strong>
          </span>
        </div>
      </div>
      <div class="product-detail-content">
        <p class="eyebrow">${escapeHtml(laneLabel(product))}</p>
        <h1>${escapeHtml(title)}</h1>
        <div class="product-meta-row">
          <span class="${product.status === "live" ? "status-badge live" : "status-badge"}">${escapeHtml(getStatusLabel(product))}</span>
          <span class="price-pill">${escapeHtml(product.priceLabel)}</span>
          <span class="merchant-pill">${escapeHtml(product.merchant || "Merchant pending")}</span>
        </div>
        <p class="hero-text">${escapeHtml(blurb)}</p>
        <p>${escapeHtml(why)}</p>
        <div class="product-actions">
          ${affiliateAction(product)}
          <a class="button button-secondary" href="finds.html">Back to all finds</a>
        </div>
        <p class="product-disclosure">
          ${product.affiliateUrl ? "Disclosure: CueCart Finds may earn from qualifying purchases through this link." : "This may use a non-affiliate destination while affiliate approvals are pending."}
        </p>
        <ul class="detail-list">
          <li>
            <strong>Why it fits CueCart</strong>
            ${escapeHtml(product.whyWeLike || why)}
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
setupHomeFinds();
setupAffiliateClickTracking();

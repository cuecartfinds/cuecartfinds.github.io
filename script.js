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
      url.searchParams.set("utm_campaign", product.slug);
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
  return product.why_it_matters || product.benefit || "Chosen for usefulness, clear value, and everyday product discovery.";
}

function productBenefitCards(product) {
  const title = productTitle(product);
  const merchant = product.merchant || "the retailer";
  const price = product.priceLabel || "Price varies";
  const cards = Array.isArray(product.benefitCards) ? product.benefitCards : [];
  const fallbackCards = [
    `${title} has a clear everyday use case, so the value should be quick to understand.`,
    `${price} keeps it in the kind of low-friction range CueCart Finds likes to compare.`,
    `You can check the details at ${merchant} before deciding if it fits your routine.`
  ];

  return [...cards, ...fallbackCards].filter(Boolean).slice(0, 3);
}

function productBestFor(product) {
  const values = Array.isArray(product.bestFor) ? product.bestFor : [];
  return values.length ? values : ["Everyday use", "Quick comparison", "Practical gifting"];
}

function productCueCartTake(product) {
  return product.cuecartTake || "CueCart looks for practical finds that are easy to understand, fairly priced, and useful without needing hype.";
}

function productVideoIdea(product) {
  return product.videoDemoIdea || `Show ${productTitle(product)} in a real everyday setting with one clear before-and-after moment.`;
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
  const title = productTitle(product);
  const blurb = productBlurb(product);
  const why = productWhy(product);

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
          <span class="category-badge">${escapeHtml(laneLabel(product))}</span>
          <span class="price-pill">${escapeHtml(product.priceLabel)}</span>
          <span class="merchant-pill">${escapeHtml(product.merchant || "Merchant pending")}</span>
        </div>
        <h2>${escapeHtml(title)}</h2>
        <p class="product-card-blurb">${escapeHtml(blurb)}</p>
        <p class="product-card-why">${escapeHtml(why)}</p>
        <p class="card-disclosure">
          ${product.disclosureRequired ? "CueCart may earn from qualifying purchases." : "Retailer link. CueCart does not sell this product directly."}
        </p>
        <div class="product-actions">
          <a class="button button-secondary" href="${escapeHtml(getProductDetailUrl(product))}">View Find</a>
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

  const liveOrReady = products.filter((product) => product.product_url || product.affiliateUrl);
  const source = liveOrReady.length ? liveOrReady : products;
  const featuredLane = source.filter((product) => product.lane === "smart-buys-under-50");
  const featured = (featuredLane.length ? featuredLane : source).slice(0, 3);
  const latest = [...source].slice(0, 3);

  renderProductGrid(
    featuredGrid,
    featured,
    "Featured finds will appear here as soon as the next curated picks are ready.",
    "Featured finds are coming soon."
  );
  renderProductGrid(
    latestGrid,
    latest,
    "Latest finds will appear here after the next CueCart update.",
    "Latest finds are coming soon."
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
        product.merchant,
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
  const benefitCards = productBenefitCards(product)
    .map(
      (item) => `
        <article class="benefit-card">
          <span>Worth noting</span>
          <p>${escapeHtml(item)}</p>
        </article>
      `
    )
    .join("");
  const bestFor = productBestFor(product)
    .map((item) => `<span class="use-chip">${escapeHtml(item)}</span>`)
    .join("");
  const relatedMarkup = relatedFindsMarkup(product);

  document.title = `${title} | CueCart Finds`;

  root.innerHTML = `
    <article class="product-detail-card consumer-product-page">
      <nav class="breadcrumb-row" aria-label="Product navigation">
        <a href="finds.html">All finds</a>
        <span>/</span>
        <a href="${escapeHtml(product.lane || "finds")}.html">${escapeHtml(laneLabel(product))}</a>
      </nav>

      <section class="product-detail-hero" aria-label="${escapeHtml(title)} product overview">
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
          <p class="product-value-prop">${escapeHtml(blurb)}</p>
          <div class="shop-meta">
            <span>${escapeHtml(product.priceLabel || "Price varies")}</span>
            <span>${escapeHtml(product.merchant || "Merchant pending")}</span>
          </div>
          <div class="product-actions detail-actions">
            ${affiliateAction(product)}
            <a class="button button-secondary" href="finds.html">Back to finds</a>
          </div>
          <p class="product-disclosure">
            ${product.disclosureRequired ? "Affiliate disclosure: CueCart Finds may earn from qualifying purchases through this link." : "Disclosure: CueCart Finds may earn from qualifying purchases through affiliate links when available. This retailer link is provided for product reference."}
          </p>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-heading compact-heading">
          <p class="section-kicker">Why it is worth a look</p>
          <h2>A practical find with a clear job.</h2>
          <p>${escapeHtml(why)}</p>
        </div>
        <div class="benefit-grid">${benefitCards}</div>
      </section>

      <section class="detail-section detail-note-grid">
        <div class="detail-note-card">
          <p class="section-kicker">Best for</p>
          <div class="use-chip-grid">${bestFor}</div>
        </div>
        <div class="detail-note-card">
          <p class="section-kicker">CueCart take</p>
          <p>${escapeHtml(productCueCartTake(product))}</p>
        </div>
        <div class="detail-note-card">
          <p class="section-kicker">Quick demo idea</p>
          <p>${escapeHtml(productVideoIdea(product))}</p>
        </div>
      </section>

      ${relatedMarkup}
    </article>
  `;
}

function relatedFindsMarkup(product) {
  const relatedSlugs = Array.isArray(product.relatedProducts) ? product.relatedProducts : [];
  const related = relatedSlugs
    .map((slug) => products.find((item) => item.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  if (!related.length) {
    return `
      <section class="related-panel">
        <div>
          <p class="section-kicker">Related finds</p>
          <h2>Browse more practical picks.</h2>
          <p>More related products will appear here as CueCart Finds publishes additional curated picks.</p>
        </div>
        <div class="related-link-row">
          <a class="button button-secondary" href="smart-buys-under-50.html">Smart Buys Under $50</a>
          <a class="button button-secondary" href="finds.html">All Finds</a>
        </div>
      </section>
    `;
  }

  const cards = related
    .map(
      (item) => `
        <a class="related-card linked-card" href="${escapeHtml(getProductDetailUrl(item))}">
          <div class="related-thumb product-visual ${hasRealProductImage(item) ? "" : "image-missing"}">
            ${hasRealProductImage(item) ? `
              <img
                class="product-image"
                src="${escapeHtml(productImage(item))}"
                alt="${escapeHtml(productImageAlt(item))}"
                loading="lazy"
                onerror="this.parentElement.classList.add('image-missing'); this.remove();"
              />
            ` : ""}
            <span class="product-visual-fallback">
              <span>${escapeHtml(laneLabel(item))}</span>
              <strong>${escapeHtml(productTitle(item))}</strong>
            </span>
          </div>
          <span class="category-badge">${escapeHtml(laneLabel(item))}</span>
          <strong>${escapeHtml(productTitle(item))}</strong>
          <small>${escapeHtml(item.priceLabel || "Price varies")} · ${escapeHtml(item.merchant || "Merchant pending")}</small>
        </a>
      `
    )
    .join("");

  return `
    <section class="related-panel">
      <div class="section-heading compact-heading">
        <p class="section-kicker">Related finds</p>
        <h2>More picks worth comparing.</h2>
      </div>
      <div class="related-grid">${cards}</div>
    </section>
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

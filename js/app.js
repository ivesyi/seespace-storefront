const SHOP = "1zgis9-29.myshopify.com";
const CART_KEY = "seespace-cart";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function tidyUrl() {
  if (location.pathname.endsWith("/index.html")) {
    const next = location.pathname.replace(/index\.html$/, "") || "/";
    history.replaceState(null, "", next + location.search + location.hash);
  }
}

export function productHref(handle) {
  return `/product/${handle}/`;
}

export function shopHref(type) {
  if (!type || type === "All") return "/shop/";
  return `/shop/?type=${encodeURIComponent(type)}`;
}

export async function loadCatalog() {
  const res = await fetch("/catalog.json?v=7");
  return res.json();
}

export function money(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

export function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  paintCartCount();
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const n = Math.max(1, Number(qty) || 1);
  const hit = cart.find((i) => i.sku === product.sku);
  if (hit) hit.qty += n;
  else cart.push({ sku: product.sku, handle: product.handle, title: product.title, price: product.price, variantId: product.variantId, image: product.image, qty: n });
  setCart(cart);
}

export function setCartQty(sku, qty) {
  const n = Math.max(0, Number(qty) || 0);
  const next = getCart().map((i) => i.sku === sku ? { ...i, qty: n } : i).filter((i) => i.qty > 0);
  setCart(next);
}

export function cartIcon() {
  return `<svg class="icon-cart" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 4h2l2.2 10.2a1.4 1.4 0 0 0 1.4 1.1h8.7a1.4 1.4 0 0 0 1.4-1.1L20 8H7.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="9.2" cy="19.2" r="1.5" fill="currentColor"/>
    <circle cx="17.2" cy="19.2" r="1.5" fill="currentColor"/>
  </svg>`;
}

export function flash(el, text) {
  if (!el) return;
  const label = el.querySelector(".btn-label") || el;
  const prev = el.dataset.label || label.textContent;
  el.dataset.label = prev;
  label.textContent = text;
  window.setTimeout(() => { label.textContent = el.dataset.label; }, 1400);
}

export function paintCartCount() {
  const n = getCart().reduce((a, i) => a + i.qty, 0);
  $$("[data-cart-count]").forEach((el) => { el.textContent = n; });
}

export function paintCartLinks() {
  $$(".cart-link").forEach((el) => {
    if (el.querySelector(".icon-cart")) return;
    const n = el.querySelector("[data-cart-count]")?.textContent || "0";
    const current = el.getAttribute("aria-current");
    el.innerHTML = `${cartIcon()}<span class="cart-label">Cart</span><span class="cart-count" data-cart-count>${n}</span>`;
    if (current) el.setAttribute("aria-current", current);
  });
}

export function checkout() {
  const cart = getCart();
  const wired = cart.filter((i) => i.variantId);
  if (!cart.length) return;
  if (!wired.length) {
    alert("This rehearsal cart is local. After the SKUs are imported to Shopify and variant IDs are written into catalog.json, Checkout will open Shopify Checkout.");
    return;
  }
  const path = wired.map((i) => `${i.variantId}:${i.qty}`).join(",");
  window.location.href = `https://${SHOP}/cart/${path}`;
}

export function cardHTML(p) {
  if (!p) return "";
  const media = p.image
    ? `<img class="thumb" src="${p.image}" alt="${p.title}" />`
    : `<div class="swatch">${p.sku}</div>`;
  return `<a class="card" href="${productHref(p.handle)}" data-sku="${p.sku}">
    ${media}
    <div class="meta">
      <div class="type">${p.type}</div>
      <h3>${p.title}</h3>
      <div class="price">${money(p.price)}</div>
    </div>
  </a>`;
}

export function paintFooter() {
  const el = $(".site-footer .wrap");
  if (!el) return;
  const year = new Date().getFullYear();
  el.innerHTML = `
    <div class="foot-grid">
      <div>
        <p class="foot-brand">SeeSpace</p>
        <p>Organizers for compact rooms. Orders ship from China with tracking.</p>
      </div>
      <nav class="foot-nav" aria-label="Footer">
        <a href="/shop/">Shop</a>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
      </nav>
      <nav class="foot-nav" aria-label="Policies">
        <a href="/shipping/">Shipping</a>
        <a href="/returns/">Returns</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
      </nav>
    </div>
    <p class="foot-copy">hello@shops.yiqiai.tech · © ${year}</p>`;
}

export function mountChrome() {
  tidyUrl();
  paintCartLinks();
  paintCartCount();
  paintFooter();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountChrome);
else mountChrome();

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
  const res = await fetch("/catalog.json?v=5");
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

export function flash(el, text) {
  if (!el) return;
  const prev = el.dataset.label || el.textContent;
  el.dataset.label = prev;
  el.textContent = text;
  window.setTimeout(() => { el.textContent = el.dataset.label; }, 1400);
}

export function paintCartCount() {
  const n = getCart().reduce((a, i) => a + i.qty, 0);
  $$("[data-cart-count]").forEach((el) => { el.textContent = n; });
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

export function mountChrome() {
  tidyUrl();
  paintCartCount();
  $("#year") && ($("#year").textContent = new Date().getFullYear());
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountChrome);
else mountChrome();

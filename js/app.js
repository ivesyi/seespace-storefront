const SHOP = "1zgis9-29.myshopify.com";
const CART_KEY = "seespace-cart";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export async function loadCatalog() {
  const res = await fetch("./catalog.json");
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
  const hit = cart.find((i) => i.sku === product.sku);
  if (hit) hit.qty += qty;
  else cart.push({ sku: product.sku, handle: product.handle, title: product.title, price: product.price, variantId: product.variantId, qty });
  setCart(cart);
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
  const media = p.image
    ? `<img class="thumb" src="${p.image}" alt="${p.title}" />`
    : `<div class="swatch">${p.sku}</div>`;
  return `<a class="card" href="./product.html?handle=${encodeURIComponent(p.handle)}" data-sku="${p.sku}">
    ${media}
    <div class="meta">
      <div class="type">${p.type}</div>
      <h3>${p.title}</h3>
      <div class="price">${money(p.price)}</div>
    </div>
  </a>`;
}

export function mountChrome() {
  paintCartCount();
  $("#year") && ($("#year").textContent = new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", mountChrome);

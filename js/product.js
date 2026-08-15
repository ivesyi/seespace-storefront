import { loadCatalog, money, addToCart, flash, cardHTML } from "/js/app.js?v=6";

function handleFromPath() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts[0] === "product" && parts[1]) return parts[1];
  return new URLSearchParams(location.search).get("handle");
}

const handle = handleFromPath();
const products = await loadCatalog();
const p = products.find((x) => x.handle === handle);
const root = document.getElementById("pdp");

if (!p) {
  root.innerHTML = `<p class="muted">This SKU is not on the store. <a href="/shop/">Back to shop</a></p>`;
} else {
  document.title = `${p.title} (${p.sku}) — SeeSpace`;
  const raw = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
  const gallery = [...new Set(raw.filter(Boolean))];
  const thumbs = gallery.map((src, i) =>
    `<button type="button" data-src="${src}" class="${i === 0 ? "on" : ""}"><img src="${src}" alt="" /></button>`
  ).join("");
  root.innerHTML = `
    <div class="gallery">
      <div class="gallery-main">
        ${gallery[0] ? `<img id="main-photo" src="${gallery[0]}" alt="${p.title}" />` : `<div class="swatch">${p.sku}</div>`}
      </div>
      ${gallery.length > 1 ? `<div class="thumbs" id="thumbs">${thumbs}</div>` : ""}
    </div>
    <div>
      <p class="crumb"><a href="/shop/">Shop</a> / ${p.type} / ${p.sku}</p>
      <p class="type muted small">${p.type}</p>
      <h1>${p.title}</h1>
      <p class="price">${money(p.price)} <span class="small muted">USD</span></p>
      <p>${p.lead || p.summary}</p>
      <table class="specs">
        <tr><th>SKU</th><td>${p.sku}</td></tr>
        <tr><th>Materials</th><td>${p.materials || "—"}</td></tr>
        <tr><th>In the box</th><td>${p.inbox || "—"}</td></tr>
        <tr><th>Use</th><td>${p.use || "—"}</td></tr>
        <tr><th>Weight</th><td>${p.grams} g</td></tr>
        <tr><th>Care</th><td>${p.care || "—"}</td></tr>
        <tr><th>Shipping</th><td>${p.ship || "Tracked international parcel."}</td></tr>
      </table>
      <div class="actions">
        <div class="qty">
          <button type="button" id="minus" aria-label="Decrease">−</button>
          <input id="qty" type="number" min="1" value="1" />
          <button type="button" id="plus" aria-label="Increase">+</button>
        </div>
        <button class="btn" type="button" id="add">Add to cart</button>
        <a class="btn ghost" href="/shop/">Keep shopping</a>
      </div>
      <p class="note">Checkout is Shopify Checkout with PayPal. Defects can be refunded with photos. Change-of-mind returns are on the buyer.</p>
    </div>`;
  const qty = document.getElementById("qty");
  document.getElementById("minus").onclick = () => { qty.value = Math.max(1, Number(qty.value) - 1); };
  document.getElementById("plus").onclick = () => { qty.value = Math.max(1, Number(qty.value) + 1); };
  const add = document.getElementById("add");
  add.onclick = () => {
    addToCart(p, qty.value);
    flash(add, "Added");
  };
  const strip = document.getElementById("thumbs");
  if (strip) {
    strip.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      document.getElementById("main-photo").src = btn.dataset.src;
      strip.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === btn));
    });
  }
  const others = products.filter((x) => x.sku !== p.sku);
  if (others.length) {
    document.getElementById("related").hidden = false;
    document.getElementById("related-grid").innerHTML = others.map(cardHTML).join("");
  }
}

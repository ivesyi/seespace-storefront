# 模拟客户交付包

当作客户只交了这些：

- `index.html` / `shop.html` / `product.html` / `about.html` 视觉页
- `catalog.json`：16 个 SKU 的名称、价、重、分类（对应 `seespace-products.csv`）
- 没有实拍图（用 SKU 色块占位）
- 没有购物车、没有结账、没有 Shopify

我方加上的接线在 `js/app.js`：

- `data-sku` 加购
- 本地购物车
- `Checkout`：有 `variantId` 时跳 `https://1zgis9-29.myshopify.com/cart/{id}:{qty}`

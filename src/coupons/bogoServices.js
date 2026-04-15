// services/bogoService.js

export const applyBOGO = (coupon, cartItems) => {
  const buyQty = coupon.bogo_buy_qty || 1;
  const getQty = coupon.bogo_get_qty || 1;

  // 🛡 Safety checks
  if (!cartItems || cartItems.length === 0) {
    return {
      success: false,
      message: "Cart is empty",
    };
  }

  if (buyQty < 1 || getQty < 1) {
    return {
      success: false,
      message: "Invalid BOGO configuration",
    };
  }

  // 🎯 Optional: filter applicable products
  let applicableItems = cartItems;

  if (coupon.applicable_product_ids) {
    const allowedIds = coupon.applicable_product_ids
      .split(",")
      .map((id) => id.trim());

    applicableItems = cartItems.filter((item) =>
      allowedIds.includes(String(item.productId))
    );
  }

  // 🧮 Total quantity
  const totalQty = applicableItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // ✅ CORRECT LOGIC (Industry standard)
  let freeItems = Math.floor(totalQty / buyQty) * getQty;

  // 🛑 Apply max cap (if exists)
  if (coupon.max_free_items) {
    freeItems = Math.min(freeItems, coupon.max_free_items);
  }

  if (freeItems === 0) {
    return {
      success: false,
      message: `Add at least ${buyQty} items to unlock this offer`,
    };
  }

  // 💰 Sort by cheapest first (maximize customer benefit)
  const sorted = [...applicableItems].sort(
    (a, b) => (a.price || 0) - (b.price || 0)
  );

  let discount = 0;
  let freeCount = 0;

  for (let item of sorted) {
    const qty = item.quantity || 0;

    for (let i = 0; i < qty; i++) {
      if (freeCount < freeItems) {
        discount += item.price || 0;
        freeCount++;
      } else {
        break;
      }
    }

    if (freeCount >= freeItems) break;
  }

  return {
    success: true,
    discount: parseFloat(discount.toFixed(2)),
    freeItems,
    message: `🎁 Buy ${buyQty} Get ${getQty} applied! You got ${freeItems} item(s) free`,
  };
};
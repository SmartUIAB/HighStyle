const fs = require("fs");
const path = require("path");
const CustomError = require("./CustomError");

async function deleteImageFromStorage(imagePath) {
  const fullPath = path.join(__dirname, "../", imagePath); // Adjust path as needed
  return new Promise((resolve, reject) => {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Failed to delete image: ${fullPath}`, err);
        reject(new CustomError("Failed to delete image from storage", 500));
      } else {
        resolve();
      }
    });
  });
}

/* ---------------- Function to calculate total order amount ---------------- */
const calculateOrderTotalWithCoupon = (products, productDetails, coupon) => {
  let isRestrictedProduct = false;

  // Step 1: Calculate product-specific discounted total and check for restricted products
  const orderTotal = products.reduce((total, item) => {
    const product = productDetails.find(
      (p) => p._id.toString() === item.productId
    );

    if (!product) {
      throw new Error(`Product not found for ID: ${item.productId}`);
    }

    // Check if the product is in the coupon restriction list
    if (
      coupon &&
      coupon.restrictionProducts.some(
        (restrictedProductId) =>
          restrictedProductId.toString() === product._id.toString()
      )
    ) {
      isRestrictedProduct = true;
    }

    const productPrice = product.price;
    const discount = product.discount || 0;
    const discountedPrice = productPrice - productPrice * (discount / 100);
    return total + discountedPrice * item.quantity;
  }, 0);

  // Step 2: Handle restricted product case
  if (isRestrictedProduct) {
    throw new Error(`One or more products are restricted. Coupon not applied`);
  }

  // Step 3: Apply coupon discount if applicable
  let finalTotal = orderTotal;
  let couponApplied = false; // Track whether the coupon was applied
  let appliedCouponCode = ""; // Store the applied coupon code

  if (coupon) {
    // Check if coupon conditions are met (e.g., min/max spend)
    if (coupon.minSpend && orderTotal < coupon.minSpend) {
      throw new Error(`Coupon requires a minimum spend of $${coupon.minSpend}`);
    }
    if (coupon.maxSpend && orderTotal > coupon.maxSpend) {
      throw new Error(
        `Coupon can only be applied to orders up to $${coupon.maxSpend}`
      );
    }

    // Apply the coupon discount
    couponApplied = true; // Set to true since we're applying the coupon
    appliedCouponCode = coupon.code; // Store the coupon code

    if (coupon.discountType === "percentage") {
      finalTotal = orderTotal - orderTotal * (coupon.discountValue / 100);
    } else if (coupon.discountType === "fixed") {
      finalTotal = orderTotal - coupon.discountValue;
    }

    // Ensure total doesn't drop below 0
    finalTotal = Math.max(finalTotal, 0);
  }

  return {
    orderTotal,
    finalTotal,
    discountApplied: orderTotal - finalTotal,
    couponApplied,
    appliedCouponCode,
  };
};

//order total is after calculating dicounted then final amount is calculating both coupon and discount
module.exports = { deleteImageFromStorage, calculateOrderTotalWithCoupon };

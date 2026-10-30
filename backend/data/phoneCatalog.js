/*
=========================================================
 FIXHUB PHONE CATALOGUE
 Coverage: major India-launched phone models, 2018–2026
 Brand -> Model -> Indicative MRP -> Fixing Charge -> Image
=========================================================

IMPORTANT:
1. MRPs are indicative reference values, not verified prices.
2. Verify model, storage variant and original launch MRP.
3. Never accept MRP or service fee from the customer.
4. Service fees are calculated on the backend.
5. Image URLs are optional; missing images return null.
6. This catalogue covers major models, not every regional variant.
7. iPhone 18 Pro is intentionally excluded.
*/

const PHONE_DATA = {
  Apple: [
    ["iPhone 18 Pro", 134900],
    ["iPhone 18", 79900],
    ["iPhone 17 Pro Max", 149900],
    ["iPhone 17 Pro", 134900],
    ["iPhone 17", 79900],
    ["iPhone Air", 99900],
    ["iPhone 16 Pro Max", 144900],
    ["iPhone 16 Pro", 119900],
    ["iPhone 16 Plus", 89900],
    ["iPhone 16", 79900],
    ["iPhone 16e", 59900],
    ["iPhone 15 Pro Max", 159900],
    ["iPhone 15 Pro", 134900],
    ["iPhone 15 Plus", 89900],
    ["iPhone 15", 79900],
    ["iPhone 14 Pro Max", 139900],
    ["iPhone 14 Pro", 129900],
    ["iPhone 14 Plus", 89900],
    ["iPhone 14", 79900],
    ["iPhone SE (2022)", 49900],
    ["iPhone 13 Pro Max", 129900],
    ["iPhone 13 Pro", 119900],
    ["iPhone 13", 79900],
    ["iPhone 13 mini", 69900],
    ["iPhone 12 Pro Max", 129900],
    ["iPhone 12 Pro", 119900],
    ["iPhone 12", 79900],
    ["iPhone 12 mini", 69900],
    ["iPhone SE (2020)", 42500],
    ["iPhone 11 Pro Max", 109900],
    ["iPhone 11 Pro", 99900],
    ["iPhone 11", 64900],
  ],

  Samsung: [
    ["Galaxy S26 Ultra", 139999],
    ["Galaxy S26+", 109999],
    ["Galaxy S26", 89999],
    ["Galaxy Z Fold7", 174999],
    ["Galaxy Z Flip7", 109999],
    ["Galaxy Z Flip7 FE", 89999],
    ["Galaxy S25 Ultra", 129999],
    ["Galaxy S25+", 99999],
    ["Galaxy S25", 80999],
    ["Galaxy Z Fold6", 164999],
    ["Galaxy Z Flip6", 109999],
    ["Galaxy S24 Ultra", 129999],
    ["Galaxy S24+", 99999],
    ["Galaxy S24", 79999],
    ["Galaxy Z Fold5", 154999],
    ["Galaxy Z Flip5", 99999],
    ["Galaxy S23 Ultra", 124999],
    ["Galaxy S23+", 94999],
    ["Galaxy S23", 74999],
    ["Galaxy Z Fold4", 154999],
    ["Galaxy Z Flip4", 89999],
    ["Galaxy S22 Ultra", 109999],
    ["Galaxy S22+", 84999],
    ["Galaxy S22", 72999],
    ["Galaxy Z Fold3", 149999],
    ["Galaxy Z Flip3", 84999],
    ["Galaxy S21 Ultra", 105999],
    ["Galaxy S21+", 81999],
    ["Galaxy S21", 69999],
    ["Galaxy S20 Ultra", 92999],
    ["Galaxy S20+", 73999],
    ["Galaxy S20", 66999],

    ["Galaxy A56 5G", 41999],
    ["Galaxy A55 5G", 39999],
    ["Galaxy A54 5G", 38999],
    ["Galaxy A53 5G", 34999],
    ["Galaxy A52s 5G", 35999],
    ["Galaxy A52", 26999],
    ["Galaxy A35 5G", 33999],
    ["Galaxy A25 5G", 26999],
    ["Galaxy A16", 18999],
    ["Galaxy A15", 17999],
    ["Galaxy A14 5G", 16999],
    ["Galaxy A08", 18499],
    ["Galaxy A05s", 14999],
    ["Galaxy A05", 12499],

    ["Galaxy F70 5G", 21999],
    ["Galaxy F36 5G", 17499],
    ["Galaxy F55 5G", 26999],
    ["Galaxy F34 5G", 18999],
    ["Galaxy F15 5G", 15999],

    ["Galaxy M55 5G", 26999],
    ["Galaxy M35 5G", 24999],
    ["Galaxy M34 5G", 24999],
    ["Galaxy M33 5G", 24999],
    ["Galaxy M31", 15999],

    ["Galaxy Note20 Ultra", 104999],
    ["Galaxy Note20", 77999],
    ["Galaxy Note10+", 79900],
    ["Galaxy Note10", 69900],
  ],

  OnePlus: [
    ["OnePlus 15", 72999],
    ["OnePlus 13", 69999],
    ["OnePlus 13R", 42999],
    ["OnePlus 12", 64999],
    ["OnePlus 12R", 39999],
    ["OnePlus 11", 56999],
    ["OnePlus 11R", 39999],
    ["OnePlus 10T", 49999],
    ["OnePlus 10 Pro", 66999],
    ["OnePlus 10R", 34999],
    ["OnePlus 9 Pro", 64999],
    ["OnePlus 9", 49999],
    ["OnePlus 9R", 39999],
    ["OnePlus 8 Pro", 54999],
    ["OnePlus 8T", 42999],
    ["OnePlus 8", 41999],
    ["OnePlus 7T Pro", 53999],
    ["OnePlus 7T", 37999],
    ["OnePlus 7 Pro", 48999],
    ["OnePlus 7", 32999],

    ["OnePlus Nord 5", 31999],
    ["OnePlus Nord CE5", 24999],
    ["OnePlus Nord 4", 29999],
    ["OnePlus Nord CE4", 24999],
    ["OnePlus Nord CE4 Lite", 19999],
    ["OnePlus Nord 3", 33999],
    ["OnePlus Nord CE3", 26999],
    ["OnePlus Nord CE3 Lite", 19999],
    ["OnePlus Nord 2T", 28999],
    ["OnePlus Nord 2", 27999],
    ["OnePlus Nord CE2", 23999],
    ["OnePlus Nord CE2 Lite", 19999],
    ["OnePlus Nord", 24999],
  ],

  Xiaomi: [
    ["Xiaomi 17 Ultra", 109999],
    ["Xiaomi 17", 69999],
    ["Xiaomi 15 Ultra", 109999],
    ["Xiaomi 15", 64999],
    ["Xiaomi 14 Ultra", 99999],
    ["Xiaomi 14", 69999],
    ["Xiaomi 13 Pro", 79999],
    ["Xiaomi 12 Pro", 62999],
    ["Xiaomi 11T Pro", 39999],
    ["Mi 11 Ultra", 69999],
    ["Mi 11X Pro", 39999],
    ["Mi 11X", 29999],
    ["Mi 10T Pro", 39999],
    ["Mi 10T", 35999],
    ["Mi 10", 49999],
  ],

  Redmi: [
    ["Redmi 17C 5G", 20999],
    ["Redmi Note 15 Pro+", 34999],
    ["Redmi Note 15 Pro", 29999],
    ["Redmi Note 15", 19999],
    ["Redmi Note 14 Pro+ 5G", 30999],
    ["Redmi Note 14 Pro 5G", 24999],
    ["Redmi Note 14 5G", 18999],
    ["Redmi 14C", 9999],
    ["Redmi 13 5G", 13999],
    ["Redmi 13C", 8999],
    ["Redmi 12", 11999],
    ["Redmi Note 13 Pro+ 5G", 31999],
    ["Redmi Note 13 Pro 5G", 25999],
    ["Redmi Note 13 5G", 17999],
    ["Redmi Note 12 Pro+ 5G", 29999],
    ["Redmi Note 12 Pro 5G", 24999],
    ["Redmi Note 12 5G", 16999],
    ["Redmi Note 11 Pro+", 20999],
    ["Redmi Note 11", 13999],
    ["Redmi Note 10 Pro Max", 18999],
    ["Redmi Note 10 Pro", 15999],
    ["Redmi Note 10", 11999],
    ["Redmi 10 Power", 10999],
    ["Redmi 10A", 8499],
    ["Redmi 10", 10999],
    ["Redmi 9 Power", 10999],
    ["Redmi 9A", 6799],
    ["Redmi 9", 8999],
    ["Redmi 8A", 6499],
    ["Redmi 8", 9999],
    ["Redmi 7A", 5999],
    ["Redmi 7", 7999],
  ],

  POCO: [
    ["POCO X8 Pro", 29999],
    ["POCO X8 5G", 24999],
    ["POCO F7", 31999],
    ["POCO F6", 29999],
    ["POCO F6 Pro", 39999],
    ["POCO X6 Pro 5G", 26999],
    ["POCO X6 5G", 21999],
    ["POCO M6 Pro", 11999],
    ["POCO M6 5G", 9999],
    ["POCO F5 Pro", 39999],
    ["POCO F5", 29999],
    ["POCO X5 Pro 5G", 22999],
    ["POCO X5 5G", 18999],
    ["POCO F4", 27999],
    ["POCO X4 Pro 5G", 18999],
    ["POCO M4 Pro", 14999],
    ["POCO M3", 10999],
    ["POCO X3 Pro", 18999],
    ["POCO X3", 16999],
    ["POCO M2 Pro", 13999],
    ["POCO M2", 10999],
    ["POCO X2", 15999],
    ["POCO F1", 20999],
  ],

  Vivo: [
    ["Vivo X Fold6", 219999],
    ["Vivo V80", 62999],
    ["Vivo S2 FE 5G", 38999],
    ["Vivo X200 FE", 54999],
    ["Vivo X200", 65999],
    ["Vivo X100", 63999],
    ["Vivo X90", 59999],
    ["Vivo X80", 54999],
    ["Vivo X70 Pro", 46990],
    ["Vivo X60", 37990],
    ["Vivo X50", 34990],

    ["Vivo V80", 62999],
    ["Vivo V40 Pro", 49999],
    ["Vivo V40", 34999],
    ["Vivo V30", 33999],
    ["Vivo V29", 32999],
    ["Vivo V27", 32999],
    ["Vivo V25 Pro", 35999],
    ["Vivo V23 5G", 29990],
    ["Vivo V21 5G", 29990],
    ["Vivo V20", 24990],
    ["Vivo V19", 27990],
    ["Vivo V17 Pro", 29990],
    ["Vivo V15 Pro", 28990],
    ["Vivo V11 Pro", 25990],
    ["Vivo V9", 22990],

    ["Vivo Y200", 21999],
    ["Vivo Y100", 24999],
    ["Vivo Y56 5G", 19999],
    ["Vivo Y35", 18999],
    ["Vivo Y33s", 17990],
    ["Vivo Y28", 13999],
    ["Vivo Y21", 13990],
    ["Vivo Y20", 12990],
  ],

  OPPO: [
    ["OPPO F35 Pro", 45999],
    ["OPPO F35", 38999],
    ["OPPO Find X8", 69999],
    ["OPPO Reno14 Pro", 49999],
    ["OPPO Reno14", 37999],
    ["OPPO Reno13", 37999],
    ["OPPO Reno12", 32999],
    ["OPPO Reno11", 29999],
    ["OPPO Reno10 Pro", 39999],
    ["OPPO Reno8 Pro", 45999],
    ["OPPO Reno7 Pro", 39999],
    ["OPPO Reno6 Pro", 39990],
    ["OPPO Reno5 Pro", 35990],
    ["OPPO Reno4 Pro", 34990],
    ["OPPO Reno3 Pro", 29990],
    ["OPPO Reno2", 36990],
    ["OPPO Find X5 Pro", 99990],
    ["OPPO Find X2", 64990],

    ["OPPO F27 Pro+", 27999],
    ["OPPO F25 Pro", 23999],
    ["OPPO F23 5G", 24999],
    ["OPPO F21 Pro", 22999],
    ["OPPO F19 Pro", 21990],
    ["OPPO F17 Pro", 22990],
    ["OPPO F15", 19990],
    ["OPPO F11 Pro", 24990],
    ["OPPO F9 Pro", 23990],
    ["OPPO F7", 21990],

    ["OPPO A5 Pro", 24999],
    ["OPPO A3x", 8999],
  ],

  Realme: [
    ["Realme 16 Pro+", 39999],
    ["Realme 16 Pro", 32999],
    ["Realme 16", 25999],
    ["Realme 15 Pro", 31999],
    ["Realme 15", 25999],
    ["Realme 14 Pro+", 29999],
    ["Realme 14 Pro", 24999],
    ["Realme 13 Pro+", 32999],
    ["Realme 13 Pro", 26999],
    ["Realme 12 Pro+", 29999],
    ["Realme 12 Pro", 25999],
    ["Realme 11 Pro+", 27999],
    ["Realme 10 Pro+", 24999],
    ["Realme 9 Pro+", 24999],
    ["Realme 8 Pro", 17999],
    ["Realme 7 Pro", 19999],
    ["Realme 6 Pro", 16999],
    ["Realme 5 Pro", 13999],
    ["Realme 3 Pro", 13999],

    ["Realme GT 7 Pro", 59999],
    ["Realme GT 6", 40999],
    ["Realme GT Neo 3", 36999],
    ["Realme GT 2 Pro", 49999],

    ["Realme Narzo 80 Lite", 7299],
    ["Realme Narzo 70 Pro", 19999],
    ["Realme Narzo 60 Pro", 23999],
    ["Realme Narzo 50 Pro", 21999],
    ["Realme Narzo 30 Pro", 16999],
    ["Realme Narzo 20 Pro", 14999],

    ["Realme C71", 7699],
    ["Realme C65 5G", 10999],
    ["Realme C55", 10999],
    ["Realme C35", 10999],
    ["Realme C33", 8999],
    ["Realme C30", 7499],
    ["Realme C25", 9999],
    ["Realme C21", 7999],
    ["Realme C15", 9999],
    ["Realme C11", 7499],
  ],

  Google: [
    ["Pixel 10 Pro XL", 124999],
    ["Pixel 10 Pro", 109999],
    ["Pixel 10", 79999],
    ["Pixel 9 Pro XL", 124999],
    ["Pixel 9 Pro", 109999],
    ["Pixel 9a", 49999],
    ["Pixel 9", 79999],
    ["Pixel 8 Pro", 106999],
    ["Pixel 8a", 52999],
    ["Pixel 8", 75999],
    ["Pixel 7 Pro", 84999],
    ["Pixel 7a", 43999],
    ["Pixel 7", 59999],
    ["Pixel 6 Pro", 89999],
    ["Pixel 6a", 43999],
    ["Pixel 6", 59999],
    ["Pixel 5", 69999],
    ["Pixel 4a", 29999],
    ["Pixel 4", 69999],
    ["Pixel 3a", 39999],
    ["Pixel 3 XL", 83000],
    ["Pixel 3", 71000],
  ],

  Motorola: [
    ["Motorola Edge 70 Fusion", 34999],
    ["Moto G96 5G", 17999],
    ["Moto G85 5G", 17999],
    ["Moto G84 5G", 19999],
    ["Moto G73 5G", 18999],
    ["Moto G62 5G", 17999],
    ["Moto G52", 14999],
    ["Moto G45 5G", 10999],
    ["Moto G34 5G", 11999],
    ["Moto G40 Fusion", 13999],

    ["Motorola Edge 50 Ultra", 59999],
    ["Motorola Edge 50 Pro", 31999],
    ["Motorola Edge 50 Fusion", 22999],
    ["Motorola Edge 40 Neo", 23999],
    ["Motorola Edge 30", 27999],
    ["Motorola Edge 20", 29999],

    ["Motorola Razr 60 Ultra", 99999],
    ["Motorola Razr 60", 64999],
    ["Motorola Razr 50 Ultra", 99999],
    ["Motorola Razr 50", 64999],
    ["Motorola Razr 40 Ultra", 89999],
    ["Motorola Razr 40", 59999],
  ],

  Nothing: [
    ["Nothing Phone (3)", 79999],
    ["Nothing Phone (3a) Pro", 29999],
    ["Nothing Phone (3a)", 24999],
    ["Nothing Phone (2a) Plus", 27999],
    ["Nothing Phone (2a)", 23999],
    ["Nothing Phone (2)", 44999],
    ["Nothing Phone (1)", 32999],
  ],

  iQOO: [
    ["iQOO 15", 69999],
    ["iQOO 13", 54999],
    ["iQOO 12", 52999],
    ["iQOO 11", 59999],
    ["iQOO 9 Pro", 64990],
    ["iQOO 9", 42990],
    ["iQOO 9 SE", 33990],
    ["iQOO 7 Legend", 39990],
    ["iQOO 7", 31990],
    ["iQOO 3", 36990],

    ["iQOO Neo 10", 31999],
    ["iQOO Neo 9 Pro", 35999],
    ["iQOO Neo 7 Pro", 34999],
    ["iQOO Neo 7", 29999],
    ["iQOO Neo 6", 29999],

    ["iQOO Z10R", 19499],
    ["iQOO Z9", 19999],
    ["iQOO Z9x", 12999],
    ["iQOO Z7", 18999],
    ["iQOO Z6", 15999],
    ["iQOO Z5", 23990],
    ["iQOO Z3", 19990],
  ],

  Infinix: [
    ["Infinix GT 50 Pro", 69999],
    ["Infinix Hot 70 Pro", 24999],
    ["Infinix GT 20 Pro", 24999],
    ["Infinix GT 10 Pro", 24999],
    ["Infinix Zero 40", 27999],
    ["Infinix Zero 30", 23999],
    ["Infinix Zero 5G", 19999],
    ["Infinix Note 40 Pro", 21999],
    ["Infinix Note 40", 15999],
    ["Infinix Note 30", 14999],
    ["Infinix Note 12", 11999],
    ["Infinix Note 10 Pro", 16999],
    ["Infinix Hot 60 5G+", 10499],
    ["Infinix Hot 40i", 8999],
    ["Infinix Hot 30", 10999],
    ["Infinix Hot 12", 10999],
    ["Infinix Hot 11", 9999],
    ["Infinix Hot 10", 9999],
  ],

  Tecno: [
    ["Tecno Spark 50s 5G", 19999],
    ["Tecno Pova 7 Pro", 16999],
    ["Tecno Pova 7", 12999],
    ["Tecno Phantom V Flip2", 79999],
    ["Tecno Phantom X2", 39999],
    ["Tecno Camon 30 Pro", 29999],
    ["Tecno Camon 30", 22999],
    ["Tecno Camon 20 Pro", 19999],
    ["Tecno Camon 19 Pro", 21999],
    ["Tecno Camon 18", 14999],
    ["Tecno Camon 17", 12999],
    ["Tecno Camon 16", 10999],
    ["Tecno Camon 15", 10999],
    ["Tecno Spark 20", 10999],
    ["Tecno Spark 10", 10999],
    ["Tecno Spark 8", 9999],
    ["Tecno Spark 6", 9999],
    ["Tecno Pova 6 Pro", 19999],
    ["Tecno Pova 5 Pro", 14999],
    ["Tecno Pova 2", 10999],
  ],

  Huawei: [
    ["Huawei P40 Pro", 79999],
    ["Huawei P30 Pro", 71999],
    ["Huawei P20 Pro", 64999],
    ["Huawei Mate 40 Pro", 89999],
    ["Huawei Mate 30 Pro", 89999],
    ["Huawei Mate 20 Pro", 69999],
    ["Huawei Nova 5T", 39999],
    ["Huawei Nova 3", 34999],
  ],

  Sony: [
    ["Sony Xperia 1 VI", 139999],
    ["Sony Xperia 1 V", 129999],
    ["Sony Xperia 1 IV", 109999],
    ["Sony Xperia 1 III", 79990],
    ["Sony Xperia 1 II", 89990],
    ["Sony Xperia 1", 79990],
    ["Sony Xperia 5 V", 89999],
    ["Sony Xperia 5 IV", 89999],
    ["Sony Xperia 5 III", 79990],
    ["Sony Xperia 5 II", 59990],
    ["Sony Xperia 10 VI", 39999],
    ["Sony Xperia 10 V", 39999],
    ["Sony Xperia 10 IV", 34999],
  ],

  ASUS: [
    ["ASUS Zenfone 11 Ultra", 89999],
    ["ASUS Zenfone 10", 69999],
    ["ASUS Zenfone 9", 64999],
    ["ASUS Zenfone 8", 49999],
    ["ASUS Zenfone 7", 49999],
    ["ASUS Zenfone 6", 39999],
    ["ASUS ROG Phone 8", 99999],
    ["ASUS ROG Phone 7", 74999],
    ["ASUS ROG Phone 6", 71999],
    ["ASUS ROG Phone 5", 49999],
    ["ASUS ROG Phone 3", 49999],
    ["ASUS ROG Phone 2", 37999],
  ],

  Nokia: [
    ["Nokia X30 5G", 36999],
    ["Nokia X20", 31999],
    ["Nokia G60 5G", 19999],
    ["Nokia G42 5G", 12999],
    ["Nokia G21", 12999],
    ["Nokia G20", 12999],
    ["Nokia G10", 11999],
    ["Nokia 8.3 5G", 47999],
    ["Nokia 7.2", 18599],
    ["Nokia 6.1 Plus", 15999],
    ["Nokia 5.4", 13999],
    ["Nokia 5.3", 13999],
  ],

  Lenovo: [
    ["Lenovo Legion Phone Duel 2", 69999],
    ["Lenovo Legion Phone Duel", 49999],
    ["Lenovo Z5 Pro GT", 34999],
    ["Lenovo K9", 8999],
    ["Lenovo K8 Note", 12999],
  ],

  Lava: [
    ["Lava Aura Curve", 17999],
    ["Lava Shark 2 Pro 5G", 12999],
    ["Lava Agni 3", 20999],
    ["Lava Agni 2 5G", 21999],
    ["Lava Blaze Dragon", 9999],
    ["Lava Blaze Curve 5G", 17999],
    ["Lava Blaze 5G", 10999],
    ["Lava Blaze Pro", 10999],
    ["Lava Blaze 2", 8999],
    ["Lava Yuva 3", 6999],
    ["Lava Z4", 8999],
    ["Lava Z2", 6999],
  ],

  Itel: [
    ["itel City 300 5G", 14999],
    ["itel Zeno 300", 9999],
    ["itel Zeno 100 Lite", 7999],
    ["itel A80", 6999],
    ["itel S24", 9999],
    ["itel S23", 8999],
    ["itel P55 5G", 9999],
    ["itel P40", 7999],
    ["itel A70", 7999],
  ],

  Other: [],
};

// =========================================================
// PHONE IMAGE URLS
// =========================================================
// Add exact image URLs for your downloaded phone images.
// Example:
// "OnePlus 13": "/images/phones/oneplus/oneplus-13.webp"
//
// The image value is optional. Unlisted models return null.

const PHONE_IMAGES = {
  // Apple
  // "iPhone 17 Pro Max": "/images/phones/apple/iphone-17-pro-max.webp",
  // "iPhone 16": "/images/phones/apple/iphone-16.webp",
  // Samsung
  // "Galaxy S25 Ultra": "/images/phones/samsung/galaxy-s25-ultra.webp",
  // OnePlus
  // "OnePlus 13": "/images/phones/oneplus/oneplus-13.webp",
};

// =========================================================
// BRANDS
// =========================================================

export const PHONE_BRANDS = Object.keys(PHONE_DATA);

// =========================================================
// FIXING CHARGE
// =========================================================

export function chargeForMRP(mrp) {
  const value = Number(mrp);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid phone MRP.");
  }

  if (value <= 20000) return 499;
  if (value <= 50000) return 699;
  if (value <= 90000) return 999;
  if (value <= 130000) return 1299;

  return 1699;
}

// =========================================================
// COMPLETE CATALOGUE
// =========================================================

export function getPhoneCatalog() {
  return PHONE_BRANDS.map((brand) => ({
    brand,
    models: PHONE_DATA[brand].map(([model, mrp]) => ({
      model,
      mrp,
      fee: chargeForMRP(mrp),
      image: PHONE_IMAGES[model] || null,
    })),
  }));
}

// =========================================================
// FIND A PHONE
// =========================================================

export function findPhone(brand, model) {
  const normalizedBrand = String(brand || "").trim();

  const normalizedModel = String(model || "")
    .trim()
    .toLowerCase();

  const entry = PHONE_DATA[normalizedBrand]?.find(
    ([name]) => name.toLowerCase() === normalizedModel,
  );

  if (!entry) return null;

  const [matchedModel, mrp] = entry;

  return {
    brand: normalizedBrand,
    model: matchedModel,
    mrp,
    fee: chargeForMRP(mrp),
    image: PHONE_IMAGES[matchedModel] || null,
  };
}

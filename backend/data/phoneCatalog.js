const PHONE_DATA = {
  Apple: [
    ["iPhone 11", 49900],
    ["iPhone 12", 59900],
    ["iPhone 13", 59900],
    ["iPhone 14", 69900],
    ["iPhone 15", 79900],
    ["iPhone 15 Plus", 89900],
    ["iPhone 15 Pro", 134900],
    ["iPhone 15 Pro Max", 159900],
    ["iPhone 16", 79900],
    ["iPhone 16 Plus", 89900],
    ["iPhone 16 Pro", 119900],
    ["iPhone 16 Pro Max", 144900],
    ["iPhone 17", 79900],
    ["iPhone 17 Pro", 134900],
    ["iPhone 17 Pro Max", 149900],
  ],

  Samsung: [
    ["Galaxy A15", 17999],
    ["Galaxy A16", 18999],
    ["Galaxy A25 5G", 26999],
    ["Galaxy A35 5G", 33999],
    ["Galaxy A55 5G", 39999],
    ["Galaxy S23", 74999],
    ["Galaxy S23 Ultra", 124999],
    ["Galaxy S24", 79999],
    ["Galaxy S24+", 99999],
    ["Galaxy S24 Ultra", 129999],
    ["Galaxy S25", 80999],
    ["Galaxy S25+", 99999],
    ["Galaxy S25 Ultra", 129999],
    ["Galaxy Z Flip6", 109999],
    ["Galaxy Z Fold6", 164999],
  ],

  OnePlus: [
    ["OnePlus 10R", 34999],
    ["OnePlus 11", 56999],
    ["OnePlus 11R", 39999],
    ["OnePlus 12", 64999],
    ["OnePlus 12R", 39999],
    ["OnePlus 13", 69999],
    ["OnePlus 13R", 42999],
    ["OnePlus Nord CE 3 Lite", 19999],
    ["OnePlus Nord CE4", 24999],
    ["OnePlus Nord 4", 29999],
  ],

  Xiaomi: [
    ["Xiaomi 12 Pro", 62999],
    ["Xiaomi 13 Pro", 79999],
    ["Xiaomi 14", 69999],
    ["Xiaomi 14 Ultra", 99999],
    ["Xiaomi 15", 64999],
  ],

  Redmi: [
    ["Redmi 12", 11999],
    ["Redmi 13C", 8999],
    ["Redmi 13 5G", 13999],
    ["Redmi Note 12", 16999],
    ["Redmi Note 13 5G", 17999],
    ["Redmi Note 13 Pro 5G", 25999],
    ["Redmi Note 13 Pro+ 5G", 31999],
    ["Redmi Note 14 5G", 18999],
    ["Redmi Note 14 Pro 5G", 24999],
    ["Redmi Note 14 Pro+ 5G", 30999],
  ],

  POCO: [
    ["POCO C65", 8499],
    ["POCO M6 5G", 9999],
    ["POCO X6 5G", 21999],
    ["POCO X6 Pro 5G", 26999],
    ["POCO F6", 29999],
    ["POCO F7", 31999],
  ],

  Vivo: [
    ["Vivo Y28", 13999],
    ["Vivo Y200", 21999],
    ["Vivo V29", 32999],
    ["Vivo V30", 33999],
    ["Vivo V40", 34999],
    ["Vivo V40 Pro", 49999],
    ["Vivo X100", 63999],
    ["Vivo X200", 65999],
  ],

  OPPO: [
    ["OPPO A3x", 8999],
    ["OPPO A5 Pro", 24999],
    ["OPPO F25 Pro", 23999],
    ["OPPO F27 Pro+", 27999],
    ["OPPO Reno11", 29999],
    ["OPPO Reno12", 32999],
    ["OPPO Reno13", 37999],
    ["OPPO Find X8", 69999],
  ],

  Realme: [
    ["Realme C55", 10999],
    ["Realme C65 5G", 10999],
    ["Realme Narzo 70 Pro", 19999],
    ["Realme 12 Pro", 25999],
    ["Realme 12 Pro+", 29999],
    ["Realme 13 Pro", 26999],
    ["Realme 13 Pro+", 32999],
    ["Realme GT 6", 40999],
    ["Realme GT 7 Pro", 59999],
  ],

  Google: [
    ["Pixel 7", 59999],
    ["Pixel 7 Pro", 84999],
    ["Pixel 8", 75999],
    ["Pixel 8 Pro", 106999],
    ["Pixel 8a", 52999],
    ["Pixel 9", 79999],
    ["Pixel 9 Pro", 109999],
    ["Pixel 9 Pro XL", 124999],
    ["Pixel 9a", 49999],
    ["Pixel 10", 79999],
  ],

  Motorola: [
    ["Moto G34 5G", 11999],
    ["Moto G45 5G", 10999],
    ["Edge 40 Neo", 23999],
    ["Edge 50 Fusion", 22999],
    ["Edge 50 Pro", 31999],
    ["Edge 50 Ultra", 59999],
    ["Razr 50", 64999],
    ["Razr 50 Ultra", 99999],
  ],

  Nothing: [
    ["Phone (1)", 32999],
    ["Phone (2)", 44999],
    ["Phone (2a)", 23999],
    ["Phone (2a) Plus", 27999],
    ["Phone (3a)", 24999],
    ["Phone (3a) Pro", 29999],
    ["Phone (3)", 79999],
  ],

  iQOO: [
    ["iQOO Z9", 19999],
    ["iQOO Z9x", 12999],
    ["iQOO Neo 9 Pro", 35999],
    ["iQOO Neo 10", 31999],
    ["iQOO 12", 52999],
    ["iQOO 13", 54999],
  ],

  Infinix: [
    ["Infinix Hot 40i", 8999],
    ["Infinix Note 40", 15999],
    ["Infinix Note 40 Pro", 21999],
    ["Infinix GT 20 Pro", 24999],
    ["Infinix Zero 40", 27999],
  ],

  Tecno: [
    ["Tecno Spark 20", 10999],
    ["Tecno Pova 6 Pro", 19999],
    ["Tecno Camon 30", 22999],
    ["Tecno Camon 30 Pro", 29999],
    ["Tecno Phantom V Flip2", 79999],
  ],

  Huawei: [
    ["Huawei P30 Pro", 71999],
    ["Huawei P40 Pro", 79999],
    ["Huawei Mate 40 Pro", 89999],
  ],

  Sony: [
    ["Xperia 1 V", 129999],
    ["Xperia 1 VI", 139999],
    ["Xperia 5 V", 89999],
    ["Xperia 10 VI", 39999],
  ],

  Asus: [
    ["ROG Phone 7", 74999],
    ["ROG Phone 8", 99999],
    ["Zenfone 10", 69999],
    ["Zenfone 11 Ultra", 89999],
  ],

  Nokia: [
    ["Nokia G42 5G", 12999],
    ["Nokia G60 5G", 19999],
    ["Nokia X30 5G", 36999],
  ],

  Lenovo: [
    ["Legion Phone Duel", 49999],
    ["Legion Phone Duel 2", 69999],
  ],
};

export const PHONE_BRANDS = Object.keys(PHONE_DATA);

export function chargeForMRP(mrp) {
  if (!Number.isFinite(mrp) || mrp <= 0) {
    throw new Error("Invalid phone MRP.");
  }

  if (mrp <= 20000) return 499;
  if (mrp <= 50000) return 699;
  if (mrp <= 90000) return 999;
  if (mrp <= 130000) return 1299;

  return 1699;
}

export function getPhoneCatalog() {
  return PHONE_BRANDS.map((brand) => ({
    brand,
    models: PHONE_DATA[brand].map(([model, mrp]) => ({
      model,
      mrp,
      fee: chargeForMRP(mrp),
    })),
  }));
}

export function findPhone(brand, model) {
  const normalizedModel = String(model || "")
    .trim()
    .toLowerCase();

  const entry = PHONE_DATA[brand]?.find(
    ([name]) => name.toLowerCase() === normalizedModel,
  );

  if (!entry) return null;

  const [matchedModel, mrp] = entry;

  return {
    brand,
    model: matchedModel,
    mrp,
    fee: chargeForMRP(mrp),
  };
}

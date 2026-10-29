// ==========================================
// FIXHUB PHONE CATALOGUE
// BRAND → MODEL → PHONE MRP → FIXING CHARGE
// ==========================================

// IMPORTANT:
// MRPs are indicative values.
// Verify prices before enabling production pricing.
// Customers must never enter their own MRP.

// ==========================================
// PHONE DATABASE
// ==========================================

const records = {
  Apple: [
    ["iPhone 13", 79900],
    ["iPhone 14", 79900],
    ["iPhone 14 Plus", 89900],
    ["iPhone 15", 79900],
    ["iPhone 15 Plus", 89900],
    ["iPhone 15 Pro", 134900],
    ["iPhone 15 Pro Max", 159900],
    ["iPhone 16", 79900],
    ["iPhone 16 Plus", 89900],
    ["iPhone 16 Pro", 119900],
    ["iPhone 16 Pro Max", 144900],
    ["iPhone 16e", 59900],
  ],

  Samsung: [
    ["Galaxy A15 5G", 19499],
    ["Galaxy A25 5G", 26999],
    ["Galaxy A35 5G", 30999],
    ["Galaxy A55 5G", 39999],
    ["Galaxy A56 5G", 41999],
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
    ["OnePlus 8", 41999],
    ["OnePlus 8T", 42999],
    ["OnePlus 9", 49999],
    ["OnePlus 9R", 39999],
    ["OnePlus 9RT", 42999],
    ["OnePlus 10R", 38999],
    ["OnePlus 10 Pro", 66999],
    ["OnePlus 11R", 39999],
    ["OnePlus 11", 56999],
    ["OnePlus 12R", 39999],
    ["OnePlus 12", 64999],
    ["OnePlus 13R", 42999],
    ["OnePlus 13", 69999],
    ["OnePlus Nord CE 3 Lite", 19999],
    ["OnePlus Nord CE 4", 24999],
    ["OnePlus Nord 3", 33999],
    ["OnePlus Nord 4", 29999],
    ["OnePlus Nord 5", 31999],
  ],

  OPPO: [
    ["OPPO A59 5G", 14999],
    ["OPPO A79 5G", 19999],
    ["OPPO F25 Pro", 23999],
    ["OPPO F27 Pro+", 27999],
    ["OPPO Reno 10", 32999],
    ["OPPO Reno 11", 29999],
    ["OPPO Reno 12", 32999],
    ["OPPO Reno 13", 37999],
    ["OPPO Find X8", 69999],
  ],

  Vivo: [
    ["vivo Y28 5G", 13999],
    ["vivo Y200", 21999],
    ["vivo V29", 32999],
    ["vivo V30", 33999],
    ["vivo V30 Pro", 41999],
    ["vivo V40", 34999],
    ["vivo V40 Pro", 49999],
    ["vivo X100", 63999],
    ["vivo X200", 65999],
  ],

  Realme: [
    ["realme C67", 13999],
    ["realme 12 Pro", 25999],
    ["realme 12 Pro+", 29999],
    ["realme 13 Pro", 26999],
    ["realme 13 Pro+", 32999],
    ["realme GT 6", 40999],
    ["realme GT 6T", 30999],
    ["realme P1", 15999],
  ],

  Xiaomi: [
    ["Xiaomi 12 Pro", 62999],
    ["Xiaomi 13 Pro", 79999],
    ["Xiaomi 14", 69999],
    ["Xiaomi 14 Ultra", 99999],
    ["Xiaomi 15", 64999],
  ],

  Redmi: [
    ["Redmi 12 5G", 11999],
    ["Redmi 13 5G", 13999],
    ["Redmi Note 12", 17999],
    ["Redmi Note 13", 17999],
    ["Redmi Note 13 Pro", 25999],
    ["Redmi Note 13 Pro+", 31999],
    ["Redmi Note 14", 17999],
    ["Redmi Note 14 Pro", 24999],
  ],

  POCO: [
    ["POCO C65", 8499],
    ["POCO M6 Pro 5G", 10999],
    ["POCO X6", 21999],
    ["POCO X6 Pro", 26999],
    ["POCO F5", 29999],
    ["POCO F6", 29999],
    ["POCO F6 Pro", 39999],
  ],

  Motorola: [
    ["moto g54", 15999],
    ["moto g64", 14999],
    ["motorola edge 40", 29999],
    ["motorola edge 50 fusion", 22999],
    ["motorola edge 50 pro", 31999],
    ["motorola edge 50 ultra", 54999],
    ["motorola razr 50", 64999],
  ],

  Nothing: [
    ["Nothing Phone (1)", 32999],
    ["Nothing Phone (2)", 44999],
    ["Nothing Phone (2a)", 23999],
    ["Nothing Phone (2a) Plus", 27999],
    ["Nothing Phone (3a)", 24999],
  ],

  iQOO: [
    ["iQOO Z9", 19999],
    ["iQOO Z9x", 12999],
    ["iQOO Neo 7 Pro", 34999],
    ["iQOO Neo 9 Pro", 35999],
    ["iQOO 12", 52999],
    ["iQOO 13", 54999],
  ],

  Infinix: [
    ["Infinix Hot 40i", 9999],
    ["Infinix Note 40 Pro", 21999],
    ["Infinix GT 20 Pro", 24999],
  ],

  Tecno: [
    ["Tecno Spark 20", 10499],
    ["Tecno Pova 6 Pro", 19999],
    ["Tecno Camon 30", 22999],
  ],

  Itel: [
    ["itel A70", 6999],
    ["itel S24", 10999],
    ["itel P55 5G", 9999],
  ],

  Other: [],
};

// ==========================================
// FIXHUB REPAIR PRICING
// ==========================================

export function chargeForMRP(mrp) {
  if (!Number.isFinite(mrp) || mrp <= 0) {
    return null;
  }

  if (mrp <= 20000) return 499;
  if (mrp <= 50000) return 699;
  if (mrp <= 90000) return 999;
  if (mrp <= 130000) return 1299;

  return 1699;
}

// ==========================================
// GET ALL BRANDS AND MODELS
// ==========================================

export function getPhoneCatalog() {
  return Object.entries(records).map(([brand, items]) => ({
    brand,
    models: items.map(([model, mrp]) => ({
      model,
      mrp,
      fee: chargeForMRP(mrp),
    })),
  }));
}

// ==========================================
// FIND ONE PHONE
// ==========================================

export function findPhone(brand, model) {
  const normalizedBrand = String(brand || "").trim();
  const normalizedModel = String(model || "").trim();

  const models = records[normalizedBrand];

  if (!models) {
    return null;
  }

  const record = models.find(
    ([name]) =>
      name.toLowerCase() === normalizedModel.toLowerCase()
  );

  if (!record) {
    return null;
  }

  const mrp = record[1];

  return {
    brand: normalizedBrand,
    model: record[0],
    mrp,
    fee: chargeForMRP(mrp),
  };
}

// ==========================================
// EXPORT BRANDS
// ==========================================

export const PHONE_BRANDS = Object.keys(records);

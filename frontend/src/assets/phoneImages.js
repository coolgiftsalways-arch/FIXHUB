// =====================================================
// FIXHUB PHONE IMAGE DATABASE
// APPLE + SAMSUNG + ONEPLUS + XIAOMI + REDMI
// =====================================================

// =====================================================
// AUTOMATIC IMAGE IMPORT
// =====================================================

const ALL_PHONE_FILES = import.meta.glob("./**/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

// =====================================================
// IMAGE FINDER
// =====================================================

function findImage(filename) {
  if (!filename) return null;

  const candidates = Array.isArray(filename) ? filename : [filename];

  for (const name of candidates) {
    const target = name.split("/").pop().toLowerCase();

    const foundPath = Object.keys(ALL_PHONE_FILES).find(
      (path) => path.split("/").pop().toLowerCase() === target,
    );

    if (foundPath) {
      return ALL_PHONE_FILES[foundPath];
    }
  }

  return null;
}

// =====================================================
// APPLE IPHONE DATABASE
// =====================================================

const APPLE_IMAGES = {
  "iPhone 18 Pro": "18promax.png",
  "iPhone 18": "18pro.png",

  "iPhone 17 Pro Max": "apple-iphone-17-pro-max-1.jpg",
  "iPhone 17 Pro": "apple-iphone-17-pro-1.jpg",
  "iPhone 17": "apple-iphone-17-1.jpg",
  "iPhone Air": "apple-iphone-air-1.jpg",

  "iPhone 16 Pro Max": "apple-iphone-16-pro-max-1.jpg",
  "iPhone 16 Pro": "apple-iphone-16-pro-1.jpg",
  "iPhone 16 Plus": "apple-iphone-16-plus-1.jpg",
  "iPhone 16": "apple-iphone-16-1.jpg",
  "iPhone 16e": "apple-iphone-16e-1.jpg",

  "iPhone 15 Pro Max": "apple-iphone-15-pro-max-1.jpg",
  "iPhone 15 Pro": "apple-iphone-15-pro-1.jpg",
  "iPhone 15 Plus": "apple-iphone-15-plus-1.jpg",
  "iPhone 15": "apple-iphone-15-1.jpg",

  "iPhone 14 Pro Max": "apple-iphone-14-pro-max-1.jpg",
  "iPhone 14 Pro": "apple-iphone-14-pro-3.jpg",
  "iPhone 14 Plus": "14pluse.png",
  "iPhone 14": "apple-iphone-14-3.jpg",

  "iPhone SE (2022)": "apple-iphone-se-2022-0.jpg",

  "iPhone 13 Pro Max": "apple-iphone-13-pro-max-01.jpg",
  "iPhone 13 Pro": "apple-iphone-13-pro-01.jpg",
  "iPhone 13": "apple-iphone-13-01.jpg",
  "iPhone 13 mini": "apple-iphone-13-mini-01.jpg",

  "iPhone 12 Pro Max": "apple-iphone-12-pro-max-1.jpg",
  "iPhone 12 Pro": "apple-iphone-12-pro-r1.jpg",
  "iPhone 12": "apple-iphone-12-r1.jpg",
  "iPhone 12 mini": "apple-iphone-12-mini-r1.jpg",

  "iPhone SE (2020)": "apple-iphone-se-2020-2.jpg",

  "iPhone 11 Pro Max": "apple-iphone-11-pro-max-4.jpg",
  "iPhone 11 Pro": "11pro.png",
  "iPhone 11": "apple-iphone-11-2.jpg",
};

// =====================================================
// SAMSUNG DATABASE
// =====================================================

const SAMSUNG_IMAGES = {
  // S26 SERIES
  "Galaxy S26 Ultra": "samsung-galaxy-s26-ultra-1.jpg",
  "Galaxy S26+": "samsung-galaxy-s26-plus-1.jpg",
  "Galaxy S26": "samsung-galaxy-s26-1.jpg",

  // Z7 SERIES
  "Galaxy Z Fold7": "Fold7.png",
  "Galaxy Z Flip7": "samsung-galaxy-z-flip7-03.jpg",
  "Galaxy Z Flip7 FE": "samsung-galaxy-z-flip7-fe-1.jpg",

  // S25 SERIES
  "Galaxy S25 Ultra": "samsung-galaxy-s25-ultra-sm-s938-1.jpg",
  "Galaxy S25+": "samsung-galaxy-s25-plus-sm-s936-1.jpg",
  "Galaxy S25": "samsung-galaxy-s25-sm-s931-1.jpg",

  // Z6 SERIES
  "Galaxy Z Fold6": "samsung-galaxy-z-fold6-2.jpg",
  "Galaxy Z Flip6": "samsung-galaxy-z-flip6-1.jpg",

  // S24 SERIES
  "Galaxy S24 Ultra": "samsung-galaxy-s24-ultra-5g-sm-s928-0.jpg",
  "Galaxy S24+": "samsung-galaxy-s24-plus-5g-sm-s926-1.jpg",
  "Galaxy S24": "samsung-galaxy-s24-5g-sm-s921-1.jpg",

  // Z5 SERIES
  "Galaxy Z Fold5": "samsung-galaxy-z-fold5-5g-r3.jpg",
  "Galaxy Z Flip5": "samsung-galaxy-z-flip5-5g-r1.jpg",

  // S23 SERIES
  "Galaxy S23 Ultra": "samsung-galaxy-s23-ultra-5g-1.jpg",
  "Galaxy S23+": "samsung-galaxy-s23-plus-5g-3.jpg",
  "Galaxy S23": "S23.png",

  // Z4 SERIES
  "Galaxy Z Fold4": "samsung-galaxy-z-fold4-5g-2.jpg",
  "Galaxy Z Flip4": "samsung-galaxy-z-flip4-5g-01.jpg",

  // S22 SERIES
  "Galaxy S22 Ultra": "samsung-galaxy-s22-ultra-5g-2.jpg",
  "Galaxy S22+": "samsung-galaxy-s22-plus-5g-2.jpg",
  "Galaxy S22": "samsung-galaxy-s22-5g-2.jpg",

  // Z3 SERIES
  "Galaxy Z Fold3": "galaxy-z-fold-3-1.jpg",
  "Galaxy Z Flip3": "galaxy-z-flip3-1.jpg",

  // S21 SERIES
  "Galaxy S21 Ultra": "samsung-galaxy-s21-ultra-5g-1.jpg",
  "Galaxy S21+": "samsung-galaxy-s21-plus-5g-1.jpg",
  "Galaxy S21": "samsung-galaxy-s21-5g-0.jpg",

  // S20 SERIES
  "Galaxy S20 Ultra": "samsung-galaxy-s20-ultra-10.jpg",
  "Galaxy S20+": "samsung-galaxy-s20-plus-1.jpg",
  "Galaxy S20": "samsung-galaxy-s20-5g-r1.jpg",

  // A SERIES
  "Galaxy A56 5G": "samsung-galaxy-a56-1.jpg",
  "Galaxy A55 5G": "samsung-galaxy-a55-1.jpg",
  "Galaxy A54 5G": "samsung-galaxy-a54-5.jpg",
  "Galaxy A53 5G": "samsung-galaxy-a53-5g-1.jpg",
  "Galaxy A52s 5G": "galaxy-a52s-1.jpg",
  "Galaxy A52": "samsung-galaxy-a52-4g-10.jpg",
  "Galaxy A35 5G": "samsung-galaxy-a35-1.jpg",
  "Galaxy A25 5G": "samsung-galaxy-a25-1.jpg",
  "Galaxy A16": "samsung-galaxy-a16-lte-1.jpg",
  "Galaxy A15": "samsung-galaxy-a15-lte-1.jpg",
  "Galaxy A14 5G": "samsung-galaxy-a14-5g-1.jpg",
  "Galaxy A08": "samsung-galaxy-a08-4g-1.jpg",
  "Galaxy A05s": "samsung-galaxy-a05s-1.jpg",
  "Galaxy A05": "samsung-galaxy-a05-1.jpg",

  // F SERIES
  "Galaxy F70 5G": "samsung-galaxy-f70-11.jpg",
  "Galaxy F36 5G": "samsung-galaxy-f36-1.jpg",
  "Galaxy F55 5G": "samsung-galaxy-f55-1.jpg",
  "Galaxy F34 5G": "samsung-galaxy-f34-1.jpg",
  "Galaxy F15 5G": "samsung-galaxy-f15-5g-1.jpg",

  // M SERIES
  "Galaxy M55 5G": "samsung-galaxy-m55-1.jpg",
  "Galaxy M35 5G": "samsung-galaxy-m35-1.jpg",
  "Galaxy M34 5G": "samsung-galaxy-m34-5g-3.jpg",
  "Galaxy M33 5G": "samsung-galaxy-m33-1.jpg",
  "Galaxy M31": "samsung-galaxy-m31-sm-m315f-2.jpg",

  // NOTE SERIES
  "Galaxy Note20 Ultra": "samsung-galaxy-note20-ultra-1.jpg",
  "Galaxy Note20": "samsung-galaxy-note20-1.jpg",
  "Galaxy Note10+": "samsung-galaxy-note10-plus-aura-glow.jpg",
  "Galaxy Note10": "samsung-galaxy-note10-aura-glow.jpg",
};

// =====================================================
// ONEPLUS DATABASE
// =====================================================

const ONEPLUS_IMAGES = {
  // 7 SERIES
  "OnePlus 7": "oneplus-7-1.jpg",
  "OnePlus 7 Pro": "oneplus-7-pro-1.jpg",
  "OnePlus 7T": "oneplus-7t-1.jpg",
  "OnePlus 7T Pro": "oneplus-7t-pro-0.jpg",

  // 8 SERIES
  "OnePlus 8": "oneplus-8-1.jpg",
  "OnePlus 8 Pro": "oneplus-8-pro-1.jpg",
  "OnePlus 8T": "oneplus-8t-1.jpg",

  // 9 SERIES
  "OnePlus 9": "oneplus-9-1.jpg",
  "OnePlus 9 Pro": "oneplus-9-pro-1.jpg",
  "OnePlus 9R": "oneplus-9r-2.jpg",

  // 10 SERIES
  "OnePlus 10 Pro": "oneplus-10-pro-1.jpg",
  "OnePlus 10R": "oneplus-10r-1.jpg",
  "OnePlus 10T": "oneplus-10t-5g-1.jpg",

  // 11 TO 16
  "OnePlus 11": "oneplus-11-2.jpg",
  "OnePlus 12": "oneplus-12-1.jpg",
  "OnePlus 12R": "oneplus-12r-1.jpg",
  "OnePlus 13": "oneplus-13-1.jpg",
  "OnePlus 13R": "oneplus-13r-1.jpg",
  "OnePlus 15": "oneplus-15-1.jpg",
  "OnePlus 16": "oneplus-16-1.jpg",

  // ACE
  "OnePlus Ace 2": "oneplus-ace2-1.jpg",

  // NORD
  "OnePlus Nord": "oneplus-nord-1.jpg",
  "OnePlus Nord 2": "oneplus-nord-2-5g-1.jpg",
  "OnePlus Nord 2T": "oneplus-nord-2t-5g-1.jpg",
  "OnePlus Nord 3": "oneplus-nord-3-5g-1.jpg",
  "OnePlus Nord 4": "oneplus-nord4-1.jpg",
  "OnePlus Nord 5": "oneplus-nord5-2.jpg",

  // NORD CE
  "OnePlus Nord CE 3": "oneplus-nord-ce3-5g-1.jpg",
  "OnePlus Nord CE 3 Lite": "oneplus-nord-ce-3-lite-1.jpg",
  "OnePlus Nord CE 4": "oneplus-nord-ce4-11.jpg",
  "OnePlus Nord CE 4 Lite": "oneplus-nord-ce4-lite-intl-1.jpg",
  "OnePlus Nord CE 5": "oneplus-nord-ce5-3.jpg",
};

// =====================================================
// XIAOMI DATABASE
// =====================================================

const XIAOMI_IMAGES = {
  "Xiaomi 11T Pro": "xiaomi-11t-pro-1.jpg",

  "Xiaomi 12": "xiaomi-12-1.jpg",

  // No separate Xiaomi 12 Pro image was supplied.
  // This entry uses the Xiaomi 12 image as a fallback.
  "Xiaomi 12 Pro": "xiaomi-12-1.jpg",

  "Xiaomi 13 Pro": "xiaomi-13-pro-black-1.jpg",

  "Xiaomi 14": "xiaomi-14-01.jpg",
  "Xiaomi 14 Ultra": "xiaomi-14-ultra-01.jpg",

  "Xiaomi 15": "xiaomi-15-1.jpg",
  "Xiaomi 15 Ultra": "xiaomi-15-ultra-5.jpg",

  "Xiaomi 17": "xiaomi-17-b.jpg",
  "Xiaomi 17 Ultra": "xiaomi-17-ultra-global-1.jpg",

  "Xiaomi Mi 10T 5G": "xiaomi-mi-10t-5g-1.jpg",
  "Xiaomi Mi 10T Pro": "xiaomi-mi-10t-pro-02.jpg",

  "Xiaomi Mi 11 Ultra": "xiaomi-mi11-ultra-5g-k1-1.jpg",
  "Xiaomi Mi 11 Ultra 5G": "xiaomi-mi11-ultra-5g-k1-1.jpg",

  "Xiaomi Mi 11X": "xiaomi-mi11x-1.jpg",
  "Xiaomi Mi 11X Pro": "xiaomi-mi11x-pro-0.jpg",

  "Mi 11X": "xiaomi-mi11x-1.jpg",
  "Mi 11X Pro": "xiaomi-mi11x-pro-0.jpg",
};

// =====================================================
// REDMI DATABASE
// =====================================================

const REDMI_IMAGES = {
  "Redmi 9 Power": "redmi-9-power-0.jpg",

  "Redmi 10": "redmi-10-1.jpg",
  "Redmi 10A": "redmi-10a-2.jpg",
  "Redmi 10 Power": "redmi-10-power-05.jpg",

  "Redmi 12": "-redmi-12-1.jpg",

  "Redmi 13C": "redmi-13c-1.jpg",
  "Redmi 13C 5G": "redmi-13c-5g-1.jpg",

  "Redmi 14C": "redmi-14c-1.jpg",
  "Redmi 17C": "redmi-17c-11.jpg",

  "Redmi Note 10 Pro": "redmi-note10-pro-1.jpg",

  "Redmi Note 13 Pro 5G": "redmi-note-13-pro-5g-1.jpg",
  "Redmi Note 13 Pro+": "redmi-note-13-pro-plus-01.jpg",

  "Redmi Note 14 Pro 5G": "xiaomi-redmi-note-14-pro-5g-gl-1.jpg",
  "Redmi Note 14 Pro+ 5G": "xiaomi-redmi-note-14-pro-plus-5g-gl-1.jpg",

  "Redmi Note 15": "xiaomi-redmi-note-15-global-1.jpg",
  "Redmi Note 15 Pro": "xiaomi-redmi-note-15-pro-global-1.jpg",
  "Redmi Note 15 Pro+": "xiaomi-redmi-note-15-pro-plus-global-1.jpg",
};

// =====================================================
// NORMALIZE MODEL NAME
// =====================================================

function normalizeModel(model) {
  return String(model || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// =====================================================
// GET PHONE IMAGE
// IMPORTANT: NAMED EXPORT
// =====================================================

export function getPhoneImage(model) {
  if (!model) return null;

  const normalized = normalizeModel(model);

  // APPLE

  const appleKey = Object.keys(APPLE_IMAGES).find(
    (key) => normalizeModel(key) === normalized,
  );

  if (appleKey) {
    return findImage(APPLE_IMAGES[appleKey]);
  }

  // SAMSUNG

  const samsungKey = Object.keys(SAMSUNG_IMAGES).find(
    (key) => normalizeModel(key) === normalized,
  );

  if (samsungKey) {
    return findImage(SAMSUNG_IMAGES[samsungKey]);
  }

  // Samsung aliases

  const samsungAlias = normalized
    .replace(/^samsung\s+/, "")
    .replace(/^galaxy\s+/, "");

  const samsungMatch = Object.keys(SAMSUNG_IMAGES).find(
    (key) => normalizeModel(key).replace(/^galaxy\s+/, "") === samsungAlias,
  );

  if (samsungMatch) {
    return findImage(SAMSUNG_IMAGES[samsungMatch]);
  }

  // ONEPLUS

  const oneplusKey = Object.keys(ONEPLUS_IMAGES).find(
    (key) => normalizeModel(key) === normalized,
  );

  if (oneplusKey) {
    return findImage(ONEPLUS_IMAGES[oneplusKey]);
  }

  // XIAOMI

  const xiaomiKey = Object.keys(XIAOMI_IMAGES).find(
    (key) => normalizeModel(key) === normalized,
  );

  if (xiaomiKey) {
    return findImage(XIAOMI_IMAGES[xiaomiKey]);
  }

  // REDMI

  const redmiKey = Object.keys(REDMI_IMAGES).find(
    (key) => normalizeModel(key) === normalized,
  );

  if (redmiKey) {
    return findImage(REDMI_IMAGES[redmiKey]);
  }

  // FINAL FALLBACK: SEARCH BY MODEL NAME

  const allDatabases = [
    APPLE_IMAGES,
    SAMSUNG_IMAGES,
    ONEPLUS_IMAGES,
    XIAOMI_IMAGES,
    REDMI_IMAGES,
  ];

  for (const database of allDatabases) {
    const match = Object.keys(database).find(
      (key) => normalizeModel(key) === normalized,
    );

    if (match) {
      return findImage(database[match]);
    }
  }

  console.warn("[FIXHUB] Image not found:", model);

  return null;
}

// =====================================================
// EXPORT DATABASES
// =====================================================

export {
  APPLE_IMAGES,
  SAMSUNG_IMAGES,
  ONEPLUS_IMAGES,
  XIAOMI_IMAGES,
  REDMI_IMAGES,
};

// =====================================================
// DEBUG FUNCTION
// =====================================================

export function checkPhoneImages() {
  console.log("========== FIXHUB IMAGE TEST ==========");

  console.log("Total images detected:", Object.keys(ALL_PHONE_FILES).length);

  const testModels = [
    "iPhone 11",
    "iPhone 15 Pro Max",

    "Galaxy A05",
    "Galaxy A05s",
    "Galaxy S26 Ultra",

    "OnePlus 7",
    "OnePlus 12",
    "OnePlus Nord 5",

    "Mi 11X Pro",
    "Xiaomi 11T Pro",
    "Xiaomi 12 Pro",
    "Xiaomi 13 Pro",
    "Xiaomi 14",
    "Xiaomi 14 Ultra",
    "Xiaomi 15",
    "Xiaomi 17",

    "Redmi 10",
    "Redmi 13C",
    "Redmi Note 13 Pro 5G",
    "Redmi Note 15 Pro",
  ];

  testModels.forEach((model) => {
    const image = getPhoneImage(model);

    console.log(image ? "✅ IMAGE FOUND" : "❌ IMAGE MISSING", model, image);
  });

  console.log("======================================");
}

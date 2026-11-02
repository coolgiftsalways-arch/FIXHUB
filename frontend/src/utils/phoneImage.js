
// ==========================================
// FIXHUB PHONE IMAGE UTILITY
// Catalogue Image → Wikimedia Commons Fallback
// ==========================================

const imageCache = new Map();
const pendingRequests = new Map();

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const BLOCKED_TERMS = [
  "logo",
  "icon",
  "screenshot",
  "wallpaper",
  "advertisement",
  "advert",
  "banner",
  "poster",
  "drawing",
  "illustration",
];

const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;

// ==========================================
// NORMALIZE TEXT
// ==========================================

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// ==========================================
// CHECK IMAGE URL
// ==========================================

function isValidImageUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      /\.(jpe?g|png|webp)(\?.*)?$/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

// ==========================================
// CHECK COMMONS IMAGE TITLE
// ==========================================

function isLikelyPhonePhoto(title = "") {
  const lower = title.toLowerCase();

  if (BLOCKED_TERMS.some((word) => lower.includes(word))) {
    return false;
  }

  return IMAGE_EXTENSION.test(lower);
}

// ==========================================
// CHECK WHETHER RESULT MATCHES PHONE MODEL
// ==========================================

function matchesPhoneModel(title, brand, model) {
  const normalizedTitle = normalize(title);
  const normalizedBrand = normalize(brand);
  const normalizedModel = normalize(model);

  if (!normalizedTitle || !normalizedModel) {
    return false;
  }

  const modelWords = normalizedModel
    .split(" ")
    .filter(Boolean);

  const modelMatches = modelWords.every((word) =>
    normalizedTitle.includes(word),
  );

  const brandMatches =
    !normalizedBrand || normalizedTitle.includes(normalizedBrand);

  return modelMatches && brandMatches;
}

// ==========================================
// SEARCH WIKIMEDIA COMMONS
// ==========================================

async function searchCommons(query, brand, model) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "700",
    format: "json",
    origin: "*",
  });

  const response = await fetch(
    `${COMMONS_API}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Wikimedia image search failed");
  }

  const data = await response.json();

  const pages = Object.values(data.query?.pages || {});

  const candidates = pages
    .map((page) => {
      const info = page.imageinfo?.[0];

      return {
        title: page.title || "",
        url: info?.thumburl || info?.url || "",
        mime: info?.mime || "",
      };
    })
    .filter((image) => {
      return (
        image.url.startsWith("https://") &&
        image.mime.startsWith("image/") &&
        isLikelyPhonePhoto(image.title) &&
        matchesPhoneModel(image.title, brand, model)
      );
    });

  return candidates[0]?.url || null;
}

// ==========================================
// GET PHONE IMAGE
//
// Supported calls:
// getPhoneImage(brand, model)
// getPhoneImage(brand, model, catalogueImage)
// getPhoneImage(brand, model, null, true)
//
// ==========================================

export async function getPhoneImage(
  brand,
  model,
  catalogueImage = null,
  forceFallback = false,
) {
  const safeBrand = String(brand || "").trim();
  const safeModel = String(model || "").trim();

  if (!safeBrand || !safeModel) {
    return null;
  }

  // Use catalogue image first unless fallback is requested.
  if (!forceFallback && isValidImageUrl(catalogueImage)) {
    return catalogueImage;
  }

  const key = `${normalize(safeBrand)} ${normalize(safeModel)}`;

  // Return cached result.
  if (imageCache.has(key)) {
    return imageCache.get(key);
  }

  // Reuse an existing request.
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = (async () => {
    const searches = [
      `"${safeBrand} ${safeModel}" smartphone`,
      `"${safeBrand} ${safeModel}" mobile phone`,
      `${safeBrand} ${safeModel} smartphone`,
      `${safeBrand} ${safeModel} phone front back`,
    ];

    for (const query of searches) {
      try {
        const image = await searchCommons(
          query,
          safeBrand,
          safeModel,
        );

        if (image) {
          imageCache.set(key, image);
          return image;
        }
      } catch (error) {
        console.warn(
          `[FIXHUB] Image search failed for ${safeBrand} ${safeModel}:`,
          error,
        );
      }
    }

    imageCache.set(key, null);

    console.warn(
      `[FIXHUB] No matching phone image found: ${safeBrand} ${safeModel}`,
    );

    return null;
  })();

  pendingRequests.set(key, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

// ==========================================
// CLEAR IMAGE CACHE
// ==========================================

export function clearPhoneImageCache() {
  imageCache.clear();
  pendingRequests.clear();
}

// ==========================================
// CLEAR ONE PHONE IMAGE
// ==========================================

export function clearPhoneImage(brand, model) {
  const key = `${normalize(brand)} ${normalize(model)}`;

  imageCache.delete(key);
  pendingRequests.delete(key);
}

// ==========================================
// GET CACHE INFORMATION
// ==========================================

export function getPhoneImageCacheInfo() {
  return {
    cachedImages: imageCache.size,
    pendingRequests: pendingRequests.size,
  };
}
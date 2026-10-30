const imageCache = new Map();
const pendingRequests = new Map();

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const BLOCKED_TERMS = [
  "logo",
  "icon",
  "screenshot",
  "wallpaper",
  "advertisement",
];


function isLikelyPhonePhoto(title = "") {
  const lower = title.toLowerCase();

  if (BLOCKED_TERMS.some((word) => lower.includes(word))) {
    return false;
  }

  return /\.(jpe?g|png|webp)$/i.test(lower);
}

async function searchCommons(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "600",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`${COMMONS_API}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Phone image search failed");
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
        isLikelyPhonePhoto(image.title)
      );
    });

  return candidates[0]?.url || null;
}

/**
 * Find an image for a phone model.
 * Returns a URL or null if no suitable result is found.
 */
export async function getPhoneImage(brand, model) {
  const key = `${brand} ${model}`.trim().toLowerCase();

  if (imageCache.has(key)) {
    return imageCache.get(key);
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = (async () => {
    const searches = [
      `"${brand} ${model}" smartphone`,
      `${brand} ${model} mobile phone`,
      `${brand} ${model} phone back front`,
    ];

    for (const query of searches) {
      try {
        const image = await searchCommons(query);

        if (image) {
          imageCache.set(key, image);
          return image;
        }
      } catch (error) {
        console.warn(`Image search failed for ${brand} ${model}:`, error);
      }
    }

    imageCache.set(key, null);
    return null;
  })();

  pendingRequests.set(key, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(key);
  }
}

/**
 * Use when an existing component needs to clear its cache.
 */
export function clearPhoneImageCache() {
  imageCache.clear();
  pendingRequests.clear();
}

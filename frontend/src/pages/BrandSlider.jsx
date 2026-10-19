import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/BrandSlider.css";

// =============================================
// MOBILE BRANDS
// =============================================

const brands = [
  { name: "Apple", slug: "apple", color: "FFFFFF", short: "Apple" },
  { name: "Samsung", slug: "samsung", color: "4169FF", short: "SAMSUNG" },
  { name: "OnePlus", slug: "oneplus", color: "F5010C", short: "1+" },
  { name: "OPPO", slug: "oppo", color: "31C56E", short: "OPPO" },
  { name: "vivo", slug: "vivo", color: "5993FF", short: "vivo" },
  { name: "realme", slug: "realme", color: "FFD400", short: "realme" },
  { name: "Xiaomi", slug: "xiaomi", color: "FF6900", short: "mi" },
  { name: "Redmi", slug: "redmi", color: "FF6900", short: "Redmi" },
  { name: "POCO", slug: "poco", color: "FFD700", short: "POCO" },
  { name: "Motorola", slug: "motorola", color: "6EB6FF", short: "M" },
  { name: "Nothing", slug: "nothing", color: "FFFFFF", short: "NOTHING" },
  { name: "Google Pixel", slug: "google", color: "4285F4", short: "G" },
  { name: "iQOO", slug: "iqoo", color: "FFCC00", short: "iQOO" },
  { name: "Infinix", slug: "infinix", color: "54D88A", short: "Infinix" },
  { name: "TECNO", slug: "tecno", color: "28A9FF", short: "TECNO" },
  { name: "itel", slug: "itel", color: "FF6D2D", short: "itel" },
  { name: "Nokia", slug: "nokia", color: "55A7FF", short: "NOKIA" },
  { name: "Sony", slug: "sony", color: "FFFFFF", short: "SONY" },
  { name: "ASUS", slug: "asus", color: "70C7FF", short: "ASUS" },
  { name: "Huawei", slug: "huawei", color: "FF4B52", short: "HUAWEI" },
  { name: "HONOR", slug: "honor", color: "65E1C5", short: "HONOR" },
  { name: "Lenovo", slug: "lenovo", color: "FF4A56", short: "Lenovo" },
  { name: "LG", slug: "lg", color: "F34C7D", short: "LG" },
  { name: "HTC", slug: "htc", color: "98D947", short: "htc" },
];

// =============================================
// SINGLE BRAND CARD
// =============================================

function BrandCard({ brand, clone = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Link
      className="fh-brands__card"
      to="/brands"
      aria-label={clone ? undefined : `View ${brand.name} repair services`}
      tabIndex={clone ? -1 : 0}
      style={{
        "--brand-accent": `#${brand.color}`,
      }}
    >
      <span className="fh-brands__logo" aria-hidden="true">
        {imageFailed ? (
          <svg viewBox="0 0 120 42" className="fh-brands__fallback">
            <text
              x="60"
              y="27"
              textAnchor="middle"
              fill="currentColor"
              fontSize={brand.short.length > 6 ? "17" : "23"}
              fontWeight="800"
              fontFamily="Arial, sans-serif"
            >
              {brand.short}
            </text>
          </svg>
        ) : (
          <img
            src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`}
            alt=""
            width="35"
            height="35"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}
      </span>

      <span className="fh-brands__name">{brand.name}</span>
    </Link>
  );
}

// =============================================
// INFINITE BRAND SLIDER
// =============================================

export default function BrandSlider() {
  return (
    <div className="fh-brands" aria-label="Mobile brands we service">
      <div className="fh-brands__viewport">
        <div className="fh-brands__track">
          {/* ORIGINAL BRAND LIST */}

          <div className="fh-brands__group">
            {brands.map((brand) => (
              <BrandCard brand={brand} key={brand.name} />
            ))}
          </div>

          {/* DUPLICATE FOR SEAMLESS LOOP */}

          <div className="fh-brands__group" aria-hidden="true" inert={true}>
            {brands.map((brand) => (
              <BrandCard brand={brand} key={`duplicate-${brand.name}`} clone />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Info,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Wrench,
  ClipboardList,
  Search,
  X,
} from "lucide-react";

import "../styles/Membership.css";
import { getPhoneImage } from "../assets/phoneImages.js";

import One from "../images/One.png";
import Two from "../images/Two.png";
import Three from "../images/Three.png";
import Four from "../images/Four.png";
import Five from "../images/Five.png";
import Six from "../images/Six.png";
import Seven from "../images/Seven.png";
import Eight from "../images/Eate.png";

// ==========================================
// HERO IMAGES
// ==========================================

const HERO_IMAGES = [One, Two, Three, Four, Five, Six, Seven, Eight];

// ==========================================
// PRICE TIERS
// ==========================================

const PRICE_TIERS = [
  { label: "Up to ₹20,000", price: 499, max: 20000 },
  { label: "₹20,001 – ₹50,000", price: 699, max: 50000 },
  { label: "₹50,001 – ₹90,000", price: 999, max: 90000 },
  { label: "₹90,001 – ₹1,30,000", price: 1299, max: 130000 },
  { label: "Above ₹1,30,000", price: 1699, max: Infinity },
];

// ==========================================
// BRAND ORDER
// ==========================================

const BRAND_ORDER = [
  "Apple",
  "Samsung",
  "OnePlus",
  "OPPO",
  "Vivo",
  "Realme",
  "Xiaomi",
  "Redmi",
  "POCO",
  "Motorola",
  "Nothing",
  "iQOO",
  "Google",
  "Infinix",
  "Tecno",
  "Itel",
  "Nokia",
  "Lava",
  "ASUS",
  "Other",
];

// ==========================================
// MODEL PRIORITY
// ==========================================

const MODEL_PRIORITY = {
  OnePlus: [
    "OnePlus 13",
    "OnePlus 13R",
    "OnePlus 12",
    "OnePlus 12R",
    "OnePlus 11",
    "OnePlus 11R",
    "OnePlus Nord 4",
  ],
};

// ==========================================
// REPAIR ISSUES
// ==========================================

const REPAIR_ISSUES = [
  "Display / Touch",
  "Battery",
  "Charging Port",
  "Camera",
  "Speaker / Mic",
  "Water Damage",
  "Software / Performance",
  "General Service",
  "Other",
];

// ==========================================
// HELPERS
// ==========================================

const money = (value) =>
  value == null
    ? "Price review needed"
    : `₹${Number(value).toLocaleString("en-IN")}`;

function matchingTier(mrp) {
  if (!Number.isFinite(Number(mrp)) || Number(mrp) <= 0) {
    return null;
  }

  return PRICE_TIERS.find((tier) => Number(mrp) <= tier.max) || null;
}

// ==========================================
// BRAND LOGO
// ==========================================

function BrandMark({ brand }) {
  const text = {
    Apple: "●",
    Samsung: "S",
    OnePlus: "1+",
    OPPO: "oppo",
    Vivo: "vivo",
    Realme: "realme",
    Xiaomi: "mi",
    Redmi: "Redmi",
    POCO: "POCO",
    Motorola: "M",
    Nothing: "(1)",
    iQOO: "iQOO",
    Google: "G",
    Infinix: "Infinix",
    Tecno: "TECNO",
    Itel: "itel",
    Nokia: "NOKIA",
    Lava: "LAVA",
    ASUS: "ASUS",
    Other: "•••",
  };

  return (
    <span className="fhm-brand-mark">
      <span
        className={`fhm-brand-logo fhm-brand-logo--${brand
          .toLowerCase()
          .replace(/[^a-z]/g, "")}`}
      >
        {text[brand] || brand.slice(0, 3)}
      </span>
    </span>
  );
}

// ==========================================
// STEP PANEL
// ==========================================

function NumberedPanel({ number, title, subtitle, children }) {
  return (
    <section className="fhm-step">
      <div className="fhm-step-head">
        <span className="fhm-step-number">{number}</span>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

// ==========================================
// LOCAL PHONE IMAGE
// ==========================================

function PhoneModelImage({ brand, model, className = "" }) {
  // getPhoneImage handles both Apple and Samsung models.
  const image = getPhoneImage(model);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image, model]);

  if (!image || imageFailed) {
    return (
      <div className={`fhm-model-image-placeholder ${className}`}>
        <Smartphone size={48} strokeWidth={1.3} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      className={`fhm-model-image ${className}`}
      src={image}
      alt={`${brand} ${model}`}
      loading="lazy"
      onError={() => {
        console.error(
          `[FIXHUB] Failed to load image for ${brand} ${model}:`,
          image,
        );
        setImageFailed(true);
      }}
    />
  );
}

// ==========================================
// MAIN MEMBERSHIP PAGE
// ==========================================

export default function Membership() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [unlisted, setUnlisted] = useState(false);

  const [issue, setIssue] = useState("");
  const [notes, setNotes] = useState("");

  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPriceInfo, setShowPriceInfo] = useState(false);

  // ==========================================
  // LOAD PHONE CATALOGUE
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const response = await fetch("/api/membership-requests/catalog", {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !Array.isArray(data.brands)) {
          throw new Error(
            data.message || "Phone catalogue could not be loaded.",
          );
        }

        if (!controller.signal.aborted) {
          setCatalog(data.brands);
          setCatalogError("");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setCatalogError(error.message || "Unable to load phone catalogue.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, []);

  // ==========================================
  // SORT BRANDS
  // ==========================================

  const sortedBrands = useMemo(() => {
    const brands = [...catalog];

    if (!brands.some((entry) => entry.brand === "Other")) {
      brands.push({ brand: "Other", models: [] });
    }

    return brands.sort((a, b) => {
      const ai = BRAND_ORDER.indexOf(a.brand);
      const bi = BRAND_ORDER.indexOf(b.brand);

      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
  }, [catalog]);

  // ==========================================
  // SHOW BRANDS
  // ==========================================

  const visibleBrands = useMemo(() => {
    if (!brand) return sortedBrands;

    return sortedBrands.filter((entry) => entry.brand === brand);
  }, [sortedBrands, brand]);

  // ==========================================
  // GET MODELS
  // ==========================================

  const models = useMemo(() => {
    const entries =
      catalog.find((entry) => entry.brand === brand)?.models || [];

    const priority = MODEL_PRIORITY[brand] || [];

    return [...entries].sort((a, b) => {
      const ai = priority.indexOf(a.model);
      const bi = priority.indexOf(b.model);

      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;

      return a.model.localeCompare(b.model);
    });
  }, [catalog, brand]);

  // ==========================================
  // FILTER MODELS
  // ==========================================

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();

    if (!query) return models;

    return models.filter((entry) => entry.model.toLowerCase().includes(query));
  }, [models, modelSearch]);

  // ==========================================
  // SELECTED PHONE AND PRICE
  // ==========================================

  const selectedPhone = !unlisted
    ? models.find((entry) => entry.model === model)
    : null;

  const selectedTier = matchingTier(selectedPhone?.mrp);

  const selectedPrice = selectedPhone?.fee ?? selectedTier?.price ?? null;

  // ==========================================
  // SELECT BRAND
  // ==========================================

  function selectBrand(value) {
    const brandModels =
      catalog.find((entry) => entry.brand === value)?.models || [];

    setBrand(value);
    setModel("");
    setModelSearch("");
    setUnlisted(value === "Other" || brandModels.length === 0);
    setReceipt(null);
    setSubmitError("");
  }

  // ==========================================
  // CHANGE BRAND
  // ==========================================

  function changeBrand() {
    setBrand("");
    setModel("");
    setModelSearch("");
    setUnlisted(false);
    setReceipt(null);
    setSubmitError("");
  }

  // ==========================================
  // SELECT MODEL
  // ==========================================

  function selectModel(value) {
    if (value === "__unlisted__") {
      setModel("");
      setUnlisted(true);
    } else {
      setModel(value);
      setUnlisted(false);
    }

    setModelSearch("");
    setReceipt(null);
    setSubmitError("");
  }

  // ==========================================
  // CHANGE MODEL
  // ==========================================

  function changeModel() {
    setModel("");
    setModelSearch("");
    setUnlisted(false);
    setReceipt(null);
    setSubmitError("");
  }

  // ==========================================
  // COPY REQUEST ID
  // ==========================================

  async function copyId() {
    const requestId = receipt?.requestId || receipt?._id || receipt?.id;

    if (!requestId) return;

    try {
      await navigator.clipboard.writeText(String(requestId));

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  // ==========================================
  // SUBMIT REQUEST
  // ==========================================

  async function submit(event) {
    event.preventDefault();

    if (sending) return;

    setSubmitError("");

    if (!user) {
      setSubmitError("Please log in before continuing.");
      return;
    }

    if (!brand || !model.trim()) {
      setSubmitError("Choose your phone brand and model.");
      return;
    }

    if (!unlisted && !selectedPhone) {
      setSubmitError("Choose a listed phone model.");
      return;
    }

    if (!unlisted && selectedPrice == null) {
      setSubmitError("The service charge is not available for this model yet.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/membership-requests", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneBrand: brand,
          phoneModel: model.trim(),
          modelNotListed: unlisted,
          repairIssue: issue || "General Service",
          notes: notes.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.request) {
        throw new Error(data.message || "Unable to create your request.");
      }

      const savedRequest = data.request;

      setReceipt(savedRequest);

      const requestId =
        savedRequest.requestId || savedRequest._id || savedRequest.id;

      if (!requestId) {
        throw new Error(
          "Your request was saved, but no request ID was returned. Contact FIXHUB before paying.",
        );
      }

      setNotes("");

      navigate("/payment", {
        state: {
          source: "membership",
          requestId,
          phoneBrand: brand,
          phoneModel: model.trim(),
          displayedPrice: selectedPrice,
          modelNotListed: unlisted,
        },
      });
    } catch (error) {
      setSubmitError(error.message || "Please try again.");
    } finally {
      setSending(false);
    }
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="fhm-page">
      {/* HERO */}

      <section className="fhm-hero">
        <div className="fhm-shell fhm-hero-inner">
          <div className="fhm-hero-copy">
            <span className="fhm-eyebrow">MEMBERSHIP REQUEST</span>

            <h1>
              Get Your Mobile
              <br />
              <span>Membership Today</span>
            </h1>

            <p>
              Select your phone, get the correct plan automatically
              <br className="fhm-desktop-break" />
              and enjoy exclusive service benefits.
            </p>
          </div>

          <div className="fhm-hero-phones" aria-hidden="true">
            <div className="fhm-hero-slideshow">
              {HERO_IMAGES.map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className="fhm-hero-slide"
                  style={{
                    animationDelay: `${index * 4}s`,
                  }}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="fhm-shell fhm-flow">
        {/* STEP 1: BRAND */}

        <NumberedPanel
          number="1"
          title="Select Your Mobile Brand"
          subtitle={
            brand
              ? `Selected brand: ${brand}`
              : "Choose the brand of your phone."
          }
        >
          {catalogLoading && (
            <p className="fhm-loading">
              <LoaderCircle size={17} className="fhm-spinner" />
              Loading mobile brands...
            </p>
          )}

          {catalogError && (
            <p className="fhm-error">
              {catalogError}

              <button type="button" onClick={() => window.location.reload()}>
                <RotateCcw size={14} />
                Retry
              </button>
            </p>
          )}

          <div
            className={`fhm-brand-list ${
              brand ? "fhm-brand-list--selected" : ""
            }`}
            role="group"
            aria-label="Mobile brands"
          >
            {visibleBrands.map((entry) => (
              <button
                type="button"
                className={`fhm-brand-tile ${
                  brand === entry.brand ? "is-selected" : ""
                }`}
                key={entry.brand}
                onClick={() => selectBrand(entry.brand)}
                aria-pressed={brand === entry.brand}
                disabled={catalogLoading}
              >
                {brand === entry.brand && (
                  <span className="fhm-selected-tick">
                    <Check size={12} />
                  </span>
                )}

                <BrandMark brand={entry.brand} />

                <span className="fhm-brand-name">{entry.brand}</span>
              </button>
            ))}
          </div>

          {brand && (
            <button
              type="button"
              className="fhm-change-brand"
              onClick={changeBrand}
            >
              <RotateCcw size={15} />
              Change Brand
            </button>
          )}
        </NumberedPanel>

        {/* STEP 2: MODEL */}

        {brand && (
          <NumberedPanel
            number="2"
            title={`Select Your ${brand} Model`}
            subtitle={
              model && !unlisted
                ? "Your selected phone model."
                : "Search or select your phone model."
            }
          >
            {model && !unlisted ? (
              <div className="fhm-selected-model">
                <div className="fhm-selected-model-card">
                  <span className="fhm-model-selected">
                    <Check size={13} />
                  </span>

                  <div className="fhm-model-card-image">
                    <PhoneModelImage brand={brand} model={model} />
                  </div>

                  <span className="fhm-model-card-name">{model}</span>

                  <span className="fhm-selected-label">Selected Model</span>
                </div>

                <button
                  type="button"
                  className="fhm-change-model"
                  onClick={changeModel}
                >
                  <RotateCcw size={15} />
                  Change Model
                </button>
              </div>
            ) : (
              <>
                {/* SEARCH BAR */}

                {brand !== "Other" && models.length > 0 && (
                  <div className="fhm-model-search">
                    <Search size={19} />

                    <input
                      type="search"
                      value={modelSearch}
                      onChange={(event) => setModelSearch(event.target.value)}
                      placeholder={`Search ${brand} models...`}
                      aria-label={`Search ${brand} models`}
                    />

                    {modelSearch && (
                      <button
                        type="button"
                        onClick={() => setModelSearch("")}
                        aria-label="Clear model search"
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>
                )}

                {/* MODEL IMAGE CARDS */}

                {brand !== "Other" && models.length > 0 && (
                  <div className="fhm-model-grid">
                    {filteredModels.map((entry) => (
                      <button
                        type="button"
                        key={entry.model}
                        className={`fhm-model-card ${
                          model === entry.model ? "is-selected" : ""
                        }`}
                        onClick={() => selectModel(entry.model)}
                        aria-pressed={model === entry.model}
                      >
                        <div className="fhm-model-card-image">
                          <PhoneModelImage brand={brand} model={entry.model} />
                        </div>

                        <span className="fhm-model-card-name">
                          {entry.model}
                        </span>
                      </button>
                    ))}

                    {filteredModels.length === 0 && (
                      <p className="fhm-no-models">
                        No models found for "{modelSearch}". Try another search
                        or enter your model manually.
                      </p>
                    )}

                    <button
                      type="button"
                      className="fhm-model-card fhm-unlisted-card"
                      onClick={() => selectModel("__unlisted__")}
                    >
                      <div className="fhm-model-card-image fhm-unlisted-image">
                        <Smartphone size={47} strokeWidth={1.4} />
                        <span>Not listed</span>
                      </div>

                      <span className="fhm-model-card-name">
                        My model is not listed
                      </span>
                    </button>
                  </div>
                )}

                {/* MANUAL MODEL ENTRY */}

                {(unlisted || brand === "Other" || models.length === 0) && (
                  <div className="fhm-manual-model">
                    <label htmlFor="fhm-custom-model">
                      Enter your exact phone model
                    </label>

                    <input
                      id="fhm-custom-model"
                      className="fhm-input"
                      value={model}
                      onChange={(event) => {
                        setModel(event.target.value.slice(0, 90));
                        setSubmitError("");
                      }}
                      placeholder="Example: OnePlus 11 5G"
                    />

                    {brand !== "Other" && models.length > 0 && (
                      <button
                        type="button"
                        className="fhm-change-model"
                        onClick={changeModel}
                      >
                        <RotateCcw size={15} />
                        Back to model list
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </NumberedPanel>
        )}

        {/* STEP 3: PRICE */}

        {brand && model.trim() && (
          <NumberedPanel
            number="3"
            title="Automatic Fixing Charge"
            subtitle="Your stored phone MRP determines the service-fee bracket."
          >
            <div className="fhm-plan-layout">
              <div className="fhm-recommendation">
                <div className="fhm-recommendation-phone">
                  <PhoneModelImage
                    brand={brand}
                    model={model}
                    className="fhm-recommendation-image"
                  />
                </div>

                <div className="fhm-recommendation-name">
                  <h3>
                    {`${brand} ${
                      model.startsWith(brand)
                        ? model.slice(brand.length).trim()
                        : model
                    }`}
                  </h3>

                  <p>
                    Original MRP:
                    <strong>{money(selectedPhone?.mrp)}</strong>
                    {selectedPhone && (
                      <Info
                        size={14}
                        title="Reference price; verify the variant"
                      />
                    )}
                  </p>
                </div>

                <div className="fhm-recommendation-price">
                  <span className="fhm-recommended-badge">
                    <CheckCircle2 size={16} />

                    {selectedPhone
                      ? "Automatic Service Charge"
                      : "Price Review"}
                  </span>

                  <strong>
                    {selectedPrice == null ? "—" : money(selectedPrice)}
                  </strong>

                  <small>
                    {selectedTier?.label || "Our team will confirm the bracket"}
                  </small>
                </div>
              </div>

              <div className="fhm-price-explainer">
                <div className="fhm-explainer-heading">
                  <span>⚙</span>
                  <strong>How is the price calculated?</strong>
                </div>

                <p>
                  We use the phone's stored original MRP to select its price
                  bracket.
                </p>

                <a href="#fhm-price-ranges">
                  View all price ranges
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </NumberedPanel>
        )}

        {/* STEP 4: PAYMENT */}

        {brand && model.trim() && (
          <NumberedPanel
            number="4"
            title="Continue to Payment"
            subtitle="Confirm your account details and continue to the payment screen."
          >
            {!authLoading && !user ? (
              <div className="fhm-need-login">
                <ShieldCheck size={24} />

                <div>
                  <strong>Login required</strong>

                  <p>
                    Log in to save your request to your FIXHUB customer account.
                  </p>
                </div>

                <Link
                  to="/login"
                  state={{ from: "/membership" }}
                  className="fhm-primary-button"
                >
                  Login to Continue
                  <ArrowRight size={17} />
                </Link>
              </div>
            ) : authLoading ? (
              <p className="fhm-loading">
                <LoaderCircle size={18} className="fhm-spinner" />
                Checking your FIXHUB account...
              </p>
            ) : (
              <form className="fhm-request-form" onSubmit={submit}>
                <div className="fhm-customer-fields">
                  <div className="fhm-field">
                    <label htmlFor="fhm-name">Full Name</label>

                    <div className="fhm-readonly">
                      <Smartphone size={16} />

                      <input
                        id="fhm-name"
                        value={user.fullName || ""}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="fhm-field">
                    <label htmlFor="fhm-address">Address</label>

                    <div className="fhm-readonly">
                      <MapPin size={17} />

                      <input
                        id="fhm-address"
                        value={user.address || ""}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="fhm-field">
                    <label htmlFor="fhm-email">Email Address</label>

                    <div className="fhm-readonly">
                      <Mail size={17} />

                      <input id="fhm-email" value={user.email || ""} readOnly />
                    </div>
                  </div>

                  <div className="fhm-field">
                    <label htmlFor="fhm-issue">Repair Issue (Optional)</label>

                    <div className="fhm-select-wrap fhm-select-small">
                      <Wrench size={16} />

                      <select
                        id="fhm-issue"
                        value={issue}
                        onChange={(event) => setIssue(event.target.value)}
                      >
                        <option value="">Choose an issue</option>

                        {REPAIR_ISSUES.map((entry) => (
                          <option key={entry} value={entry}>
                            {entry}
                          </option>
                        ))}
                      </select>

                      <span className="fhm-select-chevron">⌄</span>
                    </div>
                  </div>

                  <div className="fhm-field">
                    <label htmlFor="fhm-phone">Phone Number</label>

                    <div className="fhm-readonly">
                      <Phone size={16} />

                      <input id="fhm-phone" value={user.phone || ""} readOnly />
                    </div>
                  </div>

                  <div className="fhm-field">
                    <label htmlFor="fhm-notes">
                      Additional Notes (Optional)
                    </label>

                    <textarea
                      id="fhm-notes"
                      value={notes}
                      onChange={(event) =>
                        setNotes(event.target.value.slice(0, 1000))
                      }
                      rows={2}
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>

                {/* REQUEST SUMMARY */}

                <aside className="fhm-summary">
                  <h3>
                    <ClipboardList size={23} />
                    Request Summary
                  </h3>

                  <dl>
                    <div>
                      <dt>Brand</dt>
                      <dd>{brand || "—"}</dd>
                    </div>

                    <div>
                      <dt>Model</dt>
                      <dd>{model || "—"}</dd>
                    </div>

                    <div>
                      <dt>Original MRP</dt>
                      <dd>{money(selectedPhone?.mrp)}</dd>
                    </div>

                    <div>
                      <dt>Price Range</dt>
                      <dd>{selectedTier?.label || "Pending review"}</dd>
                    </div>

                    <div>
                      <dt>Automatic Fixing Charge</dt>

                      <dd className="fhm-summary-price">
                        {selectedPrice == null
                          ? "Review"
                          : money(selectedPrice)}
                      </dd>
                    </div>

                    <div>
                      <dt>Status</dt>

                      <dd>
                        <span className="fhm-pending-badge">Pending</span>
                      </dd>
                    </div>
                  </dl>
                </aside>

                {/* FORM ACTIONS */}

                <div className="fhm-form-actions">
                  {submitError && (
                    <p className="fhm-error" role="alert">
                      {submitError}
                    </p>
                  )}

                  {receipt && (
                    <div className="fhm-receipt" role="status">
                      <CheckCircle2 size={21} />

                      <div>
                        <strong>Request saved</strong>

                        <small>
                          Request ID:{" "}
                          <code>
                            {receipt.requestId || receipt._id || receipt.id}
                          </code>
                        </small>
                      </div>

                      <button type="button" onClick={copyId}>
                        <Copy size={14} />
                        {copied ? "Copied" : "Copy ID"}
                      </button>
                    </div>
                  )}

                  <button
                    className="fhm-primary-button fhm-submit"
                    type="submit"
                    disabled={
                      sending ||
                      catalogLoading ||
                      Boolean(catalogError) ||
                      !brand ||
                      !model.trim() ||
                      (!unlisted && (!selectedPhone || selectedPrice == null))
                    }
                  >
                    {sending ? (
                      <LoaderCircle size={19} className="fhm-spinner" />
                    ) : (
                      <ArrowRight size={19} />
                    )}

                    {sending ? "Preparing Payment..." : "Continue to Payment"}
                  </button>

                  <span className="fhm-privacy">
                    <LockKeyhole size={13} />
                    Payment is not confirmed until FIXHUB verifies the
                    transaction.
                  </span>
                </div>
              </form>
            )}
          </NumberedPanel>
        )}

        {/* PRICE RANGES */}

        <section className="fhm-price-section" id="fhm-price-ranges">
          <div className="fhm-range-head">
            <div>
              <h2>₹ &nbsp;One Fixing Charge</h2>

              <p>
                Based on your phone's original MRP (not current market price).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPriceInfo((value) => !value)}
            >
              <Info size={15} />

              {showPriceInfo ? "Show Less" : "Learn More"}
            </button>
          </div>

          <div className="fhm-range-grid">
            {PRICE_TIERS.map((tier) => (
              <div
                key={tier.price}
                className={`fhm-range-card ${
                  selectedTier?.price === tier.price ? "is-active" : ""
                }`}
              >
                <span>{tier.label}</span>

                <strong>{money(tier.price)}</strong>

                <small>per service charge</small>
              </div>
            ))}
          </div>

          <p className="fhm-range-note">
            <Info size={16} />
            These are FIXHUB service/labour charges. Replacement parts, if
            required, are billed separately. Final quotation is confirmed before
            repair.
          </p>

          {showPriceInfo && (
            <p className="fhm-more-info">
              Your phone's original launch MRP determines its range. For a model
              missing from our catalogue, FIXHUB checks the price before
              confirming a charge. A submitted request is not payment or active
              membership.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

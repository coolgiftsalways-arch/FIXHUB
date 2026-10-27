
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Copy,
  Info,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Mail,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";
import "../styles/Membership.css";

// Server returns the authoritative phone MRP and the matching price bracket.
// Do not let the customer type their own MRP or send a calculated price to the API.
const PRICE_TIERS = [
  { label: "Up to ₹20,000", price: 499, max: 20000 },
  { label: "₹20,001 – ₹50,000", price: 699, max: 50000 },
  { label: "₹50,001 – ₹90,000", price: 999, max: 90000 },
  { label: "₹90,001 – ₹1,30,000", price: 1299, max: 130000 },
  { label: "Above ₹1,30,000", price: 1699, max: Infinity },
];

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
  "Infinix",
  "Tecno",
  "Itel",
  "Other",
];

const MODEL_PRIORITY = {
  OnePlus: [
    "OnePlus 11R",
    "OnePlus 12R",
    "OnePlus 11",
    "OnePlus 12",
    "OnePlus 13R",
    "OnePlus Nord 4",
  ],
};

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

const money = (value) =>
  value == null
    ? "Price review needed"
    : `₹${Number(value).toLocaleString("en-IN")}`;

function matchingTier(mrp) {
  if (!Number.isFinite(mrp) || mrp <= 0) return null;
  return PRICE_TIERS.find((tier) => mrp <= tier.max) || null;
}

function BrandMark({ brand }) {
  const styles = {
    Apple: "fhm-brand-logo--apple",
    Samsung: "fhm-brand-logo--samsung",
    OnePlus: "fhm-brand-logo--oneplus",
    OPPO: "fhm-brand-logo--oppo",
    Vivo: "fhm-brand-logo--vivo",
    Realme: "fhm-brand-logo--realme",
    Xiaomi: "fhm-brand-logo--xiaomi",
    Redmi: "fhm-brand-logo--redmi",
    POCO: "fhm-brand-logo--poco",
    Motorola: "fhm-brand-logo--moto",
  };
  const text = {
    Apple: "●",
    Samsung: "SAMSUNG",
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
    Infinix: "Infinix",
    Tecno: "TECNO",
    Itel: "itel",
    Other: "•••",
  };
  return (
    <span
      aria-hidden="true"
      className={`fhm-brand-logo ${styles[brand] || ""}`}
    >
      {text[brand] || brand.slice(0, 3)}
    </span>
  );
}

// Lightweight thumbnail until exact licensed phone-model images are added to
// the API response as model.image. This deliberately avoids fake product photos.
function PhoneArtwork({ model, image, large = false, index = 0 }) {
  return (
    <div
      className={`fhm-phone-art fhm-phone-art--${index % 6} ${large ? "fhm-phone-art--large" : ""}`}
    >
      {image ? (
        <img src={image} alt={model} loading="lazy" />
      ) : (
        <>
          <div className="fhm-device-back">
            <div className="fhm-device-camera">
              <i />
              <i />
              <i />
            </div>
            <span className="fhm-device-logo">✦</span>
          </div>
          <div className="fhm-device-front">
            <div className="fhm-device-punch" />
          </div>
        </>
      )}
    </div>
  );
}

function NumberedPanel({ number, title, subtitle, children, className = "" }) {
  return (
    <section className={`fhm-step ${className}`}>
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

export default function Membership() {
  const { user, loading: authLoading } = useAuth();
  const modelListRef = useRef(null);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [unlisted, setUnlisted] = useState(false);
  const [issue, setIssue] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPriceInfo, setShowPriceInfo] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
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
        if (controller.signal.aborted) return;
        setCatalog(data.brands);
        setCatalogError("");
        // Begin with no brand or model selected; customer chooses both.
        setBrand("");
        setModel("");
      } catch (error) {
        if (!controller.signal.aborted) setCatalogError(error.message);
      } finally {
        if (!controller.signal.aborted) setCatalogLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const sortedBrands = useMemo(
    () =>
      [...catalog].sort((a, b) => {
        const rank = (item) => {
          const index = BRAND_ORDER.indexOf(item.brand);
          return index < 0 ? 999 : index;
        };
        return rank(a) - rank(b);
      }),
    [catalog],
  );

  const models = useMemo(() => {
    const fromCatalog =
      catalog.find((entry) => entry.brand === brand)?.models || [];
    const featured = MODEL_PRIORITY[brand] || [];
    return [...fromCatalog].sort((a, b) => {
      const ai = featured.indexOf(a.model);
      const bi = featured.indexOf(b.model);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.model.localeCompare(b.model);
    });
  }, [catalog, brand]);

  const selectedPhone = !unlisted
    ? models.find((entry) => entry.model === model)
    : null;
  const selectedTier = matchingTier(selectedPhone?.mrp);
  const selectedPrice = selectedPhone?.fee ?? selectedTier?.price ?? null;

  function selectBrand(value) {
    const available =
      catalog.find((entry) => entry.brand === value)?.models || [];
    setBrand(value);
    setModel("");
    setUnlisted(available.length === 0);
    setReceipt(null);
    setSubmitError("");
    if (modelListRef.current) modelListRef.current.scrollLeft = 0;
  }

  function selectModel(value) {
    if (value === "__unlisted__") {
      setModel("");
      setUnlisted(true);
    } else {
      setModel(value);
      setUnlisted(false);
    }
    setReceipt(null);
    setSubmitError("");
  }

  async function copyId() {
    if (!receipt?.requestId) return;
    try {
      await navigator.clipboard.writeText(receipt.requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    setSubmitError("");
    if (!user) return setSubmitError("Please log in before submitting.");
    if (!brand || !model.trim())
      return setSubmitError("Choose your phone brand and model.");
    if (!unlisted && !selectedPhone)
      return setSubmitError("Choose a listed phone model.");

    setSending(true);
    setReceipt(null);
    try {
      const response = await fetch("/api/membership-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(data.message || "Unable to send your request.");
      }
      setReceipt(data.request);
      setNotes("");
    } catch (error) {
      setSubmitError(error.message || "Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="fhm-page">
      {/* The existing FIXHUB Navbar is already rendered by App.jsx. */}
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
              <br className="fhm-desktop-break" /> and enjoy exclusive service
              benefits.
            </p>
          </div>
          <div className="fhm-hero-phones" aria-hidden="true">
            <div className="fhm-hero-phone fhm-hero-phone--left">
              <div className="fhm-hero-camera">● ● ●</div>
            </div>
            <div className="fhm-hero-phone fhm-hero-phone--mid">
              <div className="fhm-hero-screen" />
            </div>
            <div className="fhm-hero-phone fhm-hero-phone--right">
              <div className="fhm-hero-camera">● ●</div>
            </div>
          </div>
        </div>
      </section>

      <div className="fhm-shell fhm-flow">
        <NumberedPanel
          number="1"
          title="Select Your Mobile Brand"
          subtitle="Choose the brand of your phone."
        >
          {catalogLoading && (
            <p className="fhm-loading">
              <LoaderCircle size={17} className="fhm-spinner" /> Loading mobile
              brands...
            </p>
          )}
          {catalogError && (
            <p className="fhm-error">
              {catalogError}{" "}
              <button type="button" onClick={() => window.location.reload()}>
                <RotateCcw size={14} /> Retry
              </button>
            </p>
          )}
          <div
            className="fhm-brand-list"
            role="group"
            aria-label="Mobile brands"
          >
            {sortedBrands.map((entry) => (
              <button
                type="button"
                className={`fhm-brand-tile ${brand === entry.brand ? "is-selected" : ""}`}
                key={entry.brand}
                onClick={() => selectBrand(entry.brand)}
                aria-pressed={brand === entry.brand}
              >
                {brand === entry.brand && (
                  <span className="fhm-selected-tick">
                    <Check size={12} />
                  </span>
                )}
                <BrandMark brand={entry.brand} />
                <span className="fhm-brand-name">
                  {entry.brand === "OPPO"
                    ? "Oppo"
                    : entry.brand === "Vivo"
                      ? "vivo"
                      : entry.brand === "Realme"
                        ? "realme"
                        : entry.brand}
                </span>
              </button>
            ))}
          </div>
          {sortedBrands.length > 10 && (
            <span className="fhm-scroll-help">
              Scroll sideways to see more brands →
            </span>
          )}
        </NumberedPanel>

        <NumberedPanel
          number="2"
          title="Select Your Mobile Model"
          subtitle="Choose the exact model of your phone."
        >
          <div className="fhm-model-layout">
            <div className="fhm-model-picker">
              <label className="fhm-visually-hidden" htmlFor="fhm-model-select">
                Mobile model
              </label>
              <div className="fhm-select-wrap">
                <select
                  id="fhm-model-select"
                  value={unlisted ? "__unlisted__" : model}
                  onChange={(event) => selectModel(event.target.value)}
                  disabled={!brand}
                >
                  <option value="">Choose your phone model</option>
                  {models.map((entry) => (
                    <option value={entry.model} key={entry.model}>
                      {entry.model}
                    </option>
                  ))}
                  <option value="__unlisted__">
                    My phone model is not listed
                  </option>
                </select>
                <ChevronDown size={20} />
              </div>
              {unlisted && (
                <input
                  className="fhm-input fhm-custom-model"
                  value={model}
                  onChange={(event) => {
                    setModel(event.target.value.slice(0, 90));
                    setSubmitError("");
                  }}
                  placeholder="Enter your exact phone model"
                  aria-label="Unlisted phone model name"
                />
              )}
            </div>
            <div
              className="fhm-model-tiles"
              ref={modelListRef}
              aria-label="Popular phone models"
            >
              {models.map((entry, index) => (
                <button
                  type="button"
                  className={`fhm-model-tile ${model === entry.model && !unlisted ? "is-selected" : ""}`}
                  key={entry.model}
                  onClick={() => selectModel(entry.model)}
                  aria-pressed={model === entry.model && !unlisted}
                >
                  {model === entry.model && !unlisted && (
                    <span className="fhm-selected-tick">
                      <Check size={11} />
                    </span>
                  )}
                  <PhoneArtwork
                    model={entry.model}
                    image={entry.image}
                    index={index}
                  />
                  <span title={entry.model}>{entry.model}</span>
                </button>
              ))}
              {!models.length && (
                <p className="fhm-model-empty">
                  Select a brand with listed models, or enter the model
                  manually.
                </p>
              )}
            </div>
          </div>
        </NumberedPanel>

        <NumberedPanel
          number="3"
          title="Automatic Fixing Charge"
          subtitle="We use your selected phone's stored original price to determine its service-fee bracket."
        >
          <div className="fhm-plan-layout">
            <div className="fhm-recommendation">
              <div className="fhm-recommendation-phone">
                <PhoneArtwork
                  model={model}
                  image={selectedPhone?.image}
                  large
                  index={2}
                />
              </div>
              <div className="fhm-recommendation-name">
                <h3>
                  {model
                    ? `${brand} ${model.startsWith(brand) ? model.slice(brand.length).trim() : model}`
                    : "Select your phone"}
                </h3>
                <p>
                  Original MRP: <strong>{money(selectedPhone?.mrp)}</strong>{" "}
                  {selectedPhone && (
                    <Info
                      size={14}
                      title="Stored reference price; may differ by variant"
                    />
                  )}
                </p>
              </div>
              <div className="fhm-recommendation-price">
                <span className="fhm-recommended-badge">
                  <CheckCircle2 size={16} />{" "}
                  {selectedPhone ? "Automatic Service Charge" : "Price Review"}
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
                We use the original launch price (MRP) of your phone model to
                select the correct price bracket.
              </p>
              <a href="#fhm-price-ranges">
                View all price ranges <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </NumberedPanel>

        <NumberedPanel
          number="4"
          title="Complete Your Membership Request"
          subtitle="Your details are filled automatically from your account. Just confirm and submit."
        >
          {!authLoading && !user ? (
            <div className="fhm-need-login">
              <ShieldCheck size={24} />
              <div>
                <strong>Login required</strong>
                <p>
                  Log in to save this request to your FIXHUB customer account.
                </p>
              </div>
              <Link
                to="/login"
                state={{ from: "/membership" }}
                className="fhm-primary-button"
              >
                Login to Continue <ArrowRight size={17} />
              </Link>
            </div>
          ) : authLoading ? (
            <p className="fhm-loading">
              <LoaderCircle size={18} className="fhm-spinner" /> Checking your
              FIXHUB account...
            </p>
          ) : (
            <form className="fhm-request-form" onSubmit={submit}>
              <div className="fhm-customer-fields">
                <div className="fhm-field">
                  <label htmlFor="fhm-name">Full Name</label>
                  <div className="fhm-readonly">
                    <Smartphone size={16} />
                    <input id="fhm-name" value={user.fullName || ""} readOnly />
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
                    <ChevronDown size={16} />
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
                  <label htmlFor="fhm-notes">Additional Notes (Optional)</label>
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

              <aside className="fhm-summary">
                <h3>
                  <ClipboardList size={23} /> Request Summary
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
                      {selectedPrice == null ? "Review" : money(selectedPrice)}
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
                      <strong>Request submitted successfully!</strong>
                      <small>
                        Pending review · Your request ID:{" "}
                        <code>{receipt.requestId}</code>
                      </small>
                    </div>
                    <button type="button" onClick={copyId}>
                      <Copy size={14} /> {copied ? "Copied" : "Copy ID"}
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
                    !model.trim()
                  }
                >
                  {sending ? (
                    <LoaderCircle size={19} className="fhm-spinner" />
                  ) : (
                    <Send size={19} />
                  )}
                  {sending
                    ? "Submitting Request..."
                    : "Submit Membership Request"}
                </button>
                <span className="fhm-privacy">
                  <LockKeyhole size={13} /> Your information is secure and used
                  for FIXHUB repair and membership enquiries.
                </span>
              </div>
            </form>
          )}
        </NumberedPanel>

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
              <Info size={15} /> {showPriceInfo ? "Show Less" : "Learn More"}
            </button>
          </div>
          <div className="fhm-range-grid">
            {PRICE_TIERS.map((tier) => (
              <div
                key={tier.price}
                className={`fhm-range-card ${selectedTier?.price === tier.price ? "is-active" : ""}`}
              >
                <span>{tier.label}</span>
                <strong>{money(tier.price)}</strong>
                <small>per service charge</small>
              </div>
            ))}
          </div>
          <p className="fhm-range-note">
            <Info size={16} /> These are FIXHUB service/labour charges.
            Replacement parts, if required, are billed separately. Final
            quotation is confirmed before repair.
          </p>
          {showPriceInfo && (
            <p className="fhm-more-info">
              Your phone's original launch MRP determines its range. For a model
              missing from our catalogue, we do not guess the price: FIXHUB will
              check it before confirming any charge. A submitted request is not
              payment or active membership, and free-service eligibility must be
              confirmed separately.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Camera,
  Check,
  ChevronDown,
  CircuitBoard,
  Droplets,
  Fingerprint,
  Grid2X2,
  House,
  MonitorSmartphone,
  PlugZap,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Volume2,
  Wifi,
  Wrench,
  X,
  Zap,
  Settings2,
  Power,
  Tablet,
  MessageCircle,
} from "lucide-react";
import "../styles/Services.css";

gsap.registerPlugin(ScrollTrigger);

// 34 DIFFERENT online photos, one unique URL per repair service.
// Sourced from Unsplash images marked free to use; verify licensing before launch.
// IMPORTANT: These URLs load at runtime; internet access is required.
const servicePhotos = {
  display:
    "https://images.unsplash.com/photo-1746006084491-95423925b699?auto=format&fit=crop&w=920&h=600&q=82",
  touch:
    "https://images.unsplash.com/photo-1731391747629-fbcba9014453?auto=format&fit=crop&w=920&h=600&q=82",
  "display-lines":
    "https://images.unsplash.com/photo-1746006084492-24a8fd02710a?auto=format&fit=crop&w=920&h=600&q=82",
  battery:
    "https://images.unsplash.com/photo-1776107483944-a4dc59c3fcd3?auto=format&fit=crop&w=920&h=600&q=82",
  "battery-drain":
    "https://images.unsplash.com/photo-1607027340685-3e1ae9a54a93?auto=format&fit=crop&w=920&h=600&q=82",
  "rear-camera":
    "https://images.unsplash.com/photo-1776107477726-96bacb852f7b?auto=format&fit=crop&w=920&h=600&q=82",
  "front-camera":
    "https://images.unsplash.com/photo-1768228102831-9409732c9f62?auto=format&fit=crop&w=920&h=600&q=82",
  "camera-glass":
    "https://images.unsplash.com/photo-1775839700200-804627f67c66?auto=format&fit=crop&w=920&h=600&q=82",
  "charging-port":
    "https://images.unsplash.com/photo-1724322664367-5cc0f47b5d9d?auto=format&fit=crop&w=920&h=600&q=82",
  "charging-ic":
    "https://images.unsplash.com/photo-1746005514009-892e6105fb5f?auto=format&fit=crop&w=920&h=600&q=82",
  "no-power":
    "https://images.unsplash.com/photo-1746005514014-2637647a26ee?auto=format&fit=crop&w=920&h=600&q=82",
  earpiece:
    "https://images.unsplash.com/photo-1697120168267-aa1167eb73c9?auto=format&fit=crop&w=920&h=600&q=82",
  loudspeaker:
    "https://images.unsplash.com/photo-1700805810965-bfea8f8109ad?auto=format&fit=crop&w=920&h=600&q=82",
  microphone:
    "https://images.unsplash.com/photo-1769763227060-726b7b926bf2?auto=format&fit=crop&w=920&h=600&q=82",
  "power-button":
    "https://images.unsplash.com/photo-1724323192353-f80f38e91b9d?auto=format&fit=crop&w=920&h=600&q=82",
  "volume-buttons":
    "https://images.unsplash.com/photo-1709178295004-893b38ec2a4b?auto=format&fit=crop&w=920&h=600&q=82",
  "back-panel":
    "https://images.unsplash.com/photo-1675246286211-14684dea99c6?auto=format&fit=crop&w=920&h=600&q=82",
  frame:
    "https://images.unsplash.com/photo-1692729928780-dc35089aaaa1?auto=format&fit=crop&w=920&h=600&q=82",
  software:
    "https://images.unsplash.com/photo-1772182125359-e472ca9b27c2?auto=format&fit=crop&w=920&h=600&q=82",
  "system-update":
    "https://images.unsplash.com/photo-1772683828867-197c7de098b0?auto=format&fit=crop&w=920&h=600&q=82",
  data: "https://images.unsplash.com/photo-1746005514009-48ac6c7fe300?auto=format&fit=crop&w=920&h=600&q=82",
  network:
    "https://images.unsplash.com/photo-1561474119-1b76f3a79816?auto=format&fit=crop&w=920&h=600&q=82",
  wifi: "https://images.unsplash.com/photo-1755182334060-1578c6cac201?auto=format&fit=crop&w=920&h=600&q=82",
  water:
    "https://images.unsplash.com/photo-1505616784093-32fb4f9b1bf7?auto=format&fit=crop&w=920&h=600&q=82",
  motherboard:
    "https://images.unsplash.com/photo-1672165407773-20262ff6ab13?auto=format&fit=crop&w=920&h=600&q=82",
  "board-component":
    "https://images.unsplash.com/photo-1687468047998-75435bdfd132?auto=format&fit=crop&w=920&h=600&q=82",
  fingerprint:
    "https://images.unsplash.com/photo-1676139033943-9b2eedde56d2?auto=format&fit=crop&w=920&h=600&q=82",
  face: "https://images.unsplash.com/photo-1761906975713-326457551c3a?auto=format&fit=crop&w=920&h=600&q=82",
  proximity:
    "https://images.unsplash.com/photo-1764050200027-c502a0eca0a4?auto=format&fit=crop&w=920&h=600&q=82",
  sim: "https://images.unsplash.com/photo-1766241632296-aebf4c0c3a27?auto=format&fit=crop&w=920&h=600&q=82",
  "sim-tray":
    "https://images.unsplash.com/photo-1676315487585-ccddc7934f50?auto=format&fit=crop&w=920&h=600&q=82",
  vibration:
    "https://images.unsplash.com/photo-1746005718015-a59f6fde6c65?auto=format&fit=crop&w=920&h=600&q=82",
  overheating:
    "https://images.unsplash.com/photo-1521372557841-004496c23b26?auto=format&fit=crop&w=920&h=600&q=82",
  other:
    "https://images.unsplash.com/photo-1746005847013-13291f371f0f?auto=format&fit=crop&w=920&h=600&q=82",
};

const categories = [
  { name: "All Services", icon: Grid2X2 },
  { name: "Display & Screen", icon: MonitorSmartphone },
  { name: "Battery", icon: BatteryCharging },
  { name: "Camera", icon: Camera },
  { name: "Charging & Power", icon: PlugZap },
  { name: "Audio", icon: Volume2 },
  { name: "Buttons & Keys", icon: Power },
  { name: "Body & Back Panel", icon: Smartphone },
  { name: "Software", icon: Settings2 },
  { name: "Network & Connectivity", icon: Wifi },
  { name: "Water Damage", icon: Droplets },
  { name: "Motherboard", icon: CircuitBoard },
  { name: "Sensors", icon: Fingerprint },
  { name: "SIM & Card Slot", icon: Tablet },
  { name: "Vibration", icon: Zap },
  { name: "Other Repairs", icon: Wrench },
];

// Catalogue: adjust which repairs you actually offer before launch.
const services = [
  [
    "display",
    "Display Replacement",
    "Display & Screen",
    "Broken or black screen? Screen replacement and testing.",
  ],
  [
    "touch",
    "Touchscreen Repair",
    "Display & Screen",
    "Ghost touch, dead touch areas or an unresponsive screen.",
  ],
  [
    "display-lines",
    "Display Lines & Flicker",
    "Display & Screen",
    "Diagnose flickering, green lines and display faults.",
  ],
  [
    "battery",
    "Battery Replacement",
    "Battery",
    "Fast battery drain, swelling or reduced battery backup.",
  ],
  [
    "battery-drain",
    "Battery Drain Diagnosis",
    "Battery",
    "Unusual overnight drain and battery health checks.",
  ],
  [
    "rear-camera",
    "Rear Camera Repair",
    "Camera",
    "Blurry photos, focus problems or failed rear camera.",
  ],
  [
    "front-camera",
    "Front Camera Repair",
    "Camera",
    "Selfie camera not working or showing a black screen.",
  ],
  [
    "camera-glass",
    "Camera Lens Glass",
    "Camera",
    "Scratched or cracked outer camera lens glass.",
  ],
  [
    "charging-port",
    "Charging Port Repair",
    "Charging & Power",
    "Loose connector, broken port or interrupted charging.",
  ],
  [
    "charging-ic",
    "Charging IC Diagnosis",
    "Charging & Power",
    "Charging circuit and power input fault diagnosis.",
  ],
  [
    "no-power",
    "Phone Not Turning On",
    "Charging & Power",
    "Dead phone, boot failure or no-power diagnosis.",
  ],
  [
    "earpiece",
    "Earpiece Repair",
    "Audio",
    "Call audio low, distorted or not working.",
  ],
  [
    "loudspeaker",
    "Speaker Repair",
    "Audio",
    "Low ringtone, crackling sound or speaker failure.",
  ],
  [
    "microphone",
    "Microphone Repair",
    "Audio",
    "People cannot hear you on calls or voice recordings.",
  ],
  [
    "power-button",
    "Power Button Repair",
    "Buttons & Keys",
    "Stuck, damaged or unresponsive power button.",
  ],
  [
    "volume-buttons",
    "Volume Button Repair",
    "Buttons & Keys",
    "Broken volume rocker or unresponsive keys.",
  ],
  [
    "back-panel",
    "Back Panel Replacement",
    "Body & Back Panel",
    "Cracked back cover or damaged glass panel.",
  ],
  [
    "frame",
    "Frame & Housing Repair",
    "Body & Back Panel",
    "Bent frame, housing damage or loose fittings.",
  ],
  [
    "software",
    "Software Troubleshooting",
    "Software",
    "Crashes, glitches, lagging and app issues.",
  ],
  [
    "system-update",
    "OS Update & Restore",
    "Software",
    "Update issues, boot loops and software restoration.",
  ],
  [
    "data",
    "Data Backup Assistance",
    "Software",
    "Help with backup, transfer and recovery assessment.",
  ],
  [
    "network",
    "Network & Signal Repair",
    "Network & Connectivity",
    "No network, weak signal and calling problems.",
  ],
  [
    "wifi",
    "Wi-Fi & Bluetooth Repair",
    "Network & Connectivity",
    "Wi-Fi, hotspot or Bluetooth not connecting.",
  ],
  [
    "water",
    "Water Damage Treatment",
    "Water Damage",
    "Liquid exposure inspection and corrosion treatment.",
  ],
  [
    "motherboard",
    "Motherboard Repair",
    "Motherboard",
    "Board-level repair assessment and faulty circuits.",
  ],
  [
    "board-component",
    "IC & Component Repair",
    "Motherboard",
    "Diagnosis of damaged connectors, ICs and micro-parts.",
  ],
  [
    "fingerprint",
    "Fingerprint Sensor Repair",
    "Sensors",
    "Fingerprint unlock not detecting your finger.",
  ],
  [
    "face",
    "Face Unlock & Sensors",
    "Sensors",
    "Face recognition, proximity and other sensor problems.",
  ],
  [
    "proximity",
    "Proximity Sensor Repair",
    "Sensors",
    "Screen not turning off during calls.",
  ],
  [
    "sim",
    "SIM Slot Repair",
    "SIM & Card Slot",
    "SIM not detected or a damaged SIM connector.",
  ],
  [
    "sim-tray",
    "SIM Tray Replacement",
    "SIM & Card Slot",
    "Lost, stuck or bent SIM tray.",
  ],
  [
    "vibration",
    "Vibration Motor Repair",
    "Vibration",
    "Phone not vibrating during calls or alerts.",
  ],
  [
    "overheating",
    "Overheating Diagnosis",
    "Other Repairs",
    "Unusual phone heating or thermal shutdowns.",
  ],
  [
    "other",
    "Other Mobile Repairs",
    "Other Repairs",
    "Tell us your phone issue for a custom assessment.",
  ],
].map(([id, name, category, description]) => ({
  id,
  name,
  category,
  description,
  image: servicePhotos[id],
}));

const brands = [
  "Apple",
  "Samsung",
  "OnePlus",
  "OPPO",
  "vivo",
  "realme",
  "Xiaomi",
  "Redmi",
  "POCO",
  "iQOO",
  "Motorola",
  "Nothing",
  "Google Pixel",
  "Infinix",
  "TECNO",
  "Nokia",
  "HONOR",
  "Huawei",
  "ASUS",
  "Other",
];

const modelsByBrand = {
  Apple: [
    "iPhone 16",
    "iPhone 15",
    "iPhone 14",
    "iPhone 13",
    "iPhone 12",
    "Other model",
  ],
  Samsung: [
    "Galaxy S24",
    "Galaxy S23",
    "Galaxy A55",
    "Galaxy A35",
    "Galaxy M Series",
    "Other model",
  ],
  OnePlus: [
    "OnePlus 11R",
    "OnePlus 12R",
    "OnePlus 12",
    "OnePlus Nord",
    "Other model",
  ],
  OPPO: ["Reno Series", "F Series", "A Series", "Other model"],
  vivo: ["V Series", "Y Series", "X Series", "Other model"],
  realme: ["Number Series", "Narzo Series", "GT Series", "Other model"],
  Xiaomi: ["Xiaomi 14", "Xiaomi 13", "Xiaomi Series", "Other model"],
  Redmi: ["Redmi Note Series", "Redmi Number Series", "Other model"],
  POCO: ["POCO X Series", "POCO F Series", "POCO M Series", "Other model"],
  "Google Pixel": ["Pixel 9", "Pixel 8", "Pixel 7", "Other model"],
  Nothing: ["Phone (1)", "Phone (2)", "Phone (2a)", "Other model"],
};

function bookingLink(service, brand, model, otherModel) {
  const params = new URLSearchParams({ service: service.name });
  if (brand) params.set("brand", brand);
  if (model && (model !== "Other model" || otherModel.trim())) {
    params.set("model", model === "Other model" ? otherModel.trim() : model);
  }
  return `/book-repair?${params.toString()}`;
}

function ServiceCard({ service, brand, model, otherModel }) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="svc-card">
      <div className="svc-card__photo">
        {!failed ? (
          <img
            src={service.image}
            alt={`${service.name} repair reference photo`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="svc-card__fallback">
            <Wrench size={42} />
          </div>
        )}
      </div>
      <div className="svc-card__body">
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <Link
          className="svc-card__button"
          to={bookingLink(service, brand, model, otherModel)}
        >
          Book Repair <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default function Services() {
  const rootRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Services");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [otherModel, setOtherModel] = useState("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const models = brand ? modelsByBrand[brand] || ["Other model"] : [];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return services.filter((item) => {
      const matchesCategory =
        category === "All Services" || item.category === category;
      const haystack =
        `${item.name} ${item.description} ${item.category}`.toLowerCase();
      return matchesCategory && (!term || haystack.includes(term));
    });
  }, [category, query]);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".svc-hero__text > *", {
        y: 28,
        opacity: 0,
        stagger: 0.09,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".svc-hero__visual", {
        x: 46,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
      });
      gsap.from(".svc-filterbar", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        delay: 0.25,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Recalculate scroll markers when filtering changes.
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [filtered.length]);

  const clearFilters = () => {
    setSearchText("");
    setQuery("");
    setCategory("All Services");
  };

  return (
    <div className="svc-page" ref={rootRef}>
      {/* EXISTING NAVBAR IS ALREADY RENDERED IN APP.JSX */}
      <section className="svc-hero" aria-labelledby="svc-title">
        <div className="svc-wrap svc-hero__layout">
          <div className="svc-hero__text">
            <span className="svc-kicker">
              <Wrench size={14} /> OUR SERVICES
            </span>
            <h1 id="svc-title">
              Complete Mobile <span>Repair Services</span>
            </h1>
            <p>
              From cracked screens to motherboard problems, find professional
              mobile repair options with convenient doorstep pickup, repair and
              return.
            </p>
            <div className="svc-hero__perks">
              <div>
                <ShieldCheck />
                <span>
                  <b>Original Part Options</b>
                  <small>Subject to device availability</small>
                </span>
              </div>
              <div>
                <Wrench />
                <span>
                  <b>Skilled Technicians</b>
                  <small>Careful diagnosis</small>
                </span>
              </div>
              <div>
                <House />
                <span>
                  <b>Doorstep Service</b>
                  <small>Pickup, repair & return</small>
                </span>
              </div>
              <div>
                <Check />
                <span>
                  <b>Clear Quotations</b>
                  <small>Before work begins</small>
                </span>
              </div>
            </div>
          </div>
          <div className="svc-hero__visual" aria-hidden="true">
            <span className="svc-hero__halo" />
            <img
              className="svc-hero__phone svc-hero__phone--back"
              src={servicePhotos["rear-camera"]}
              alt=""
            />
            <img
              className="svc-hero__phone svc-hero__phone--front"
              src={servicePhotos.display}
              alt=""
            />
            <div className="svc-hero__seal">
              <ShieldCheck size={27} />
              <b>ORIGINAL PARTS</b>
              <small>Where available</small>
            </div>
          </div>
        </div>
      </section>

      <div className="svc-wrap">
        <form
          className="svc-filterbar"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(searchText);
          }}
        >
          <label className="svc-search">
            <Search size={21} />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search a repair (display, battery, camera...)"
              aria-label="Search repair services"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setQuery("");
                }}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </label>
          <div className="svc-select-wrap">
            <select
              aria-label="Select mobile brand"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
                setOtherModel("");
              }}
            >
              <option value="">Select Brand</option>
              {brands.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={17} />
          </div>
          <div className="svc-select-wrap">
            <select
              aria-label="Select mobile model"
              value={model}
              disabled={!brand}
              onChange={(e) => {
                setModel(e.target.value);
                setOtherModel("");
              }}
            >
              <option value="">Select Device</option>
              {models.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={17} />
          </div>
          <button type="submit" className="svc-filterbar__submit">
            Search <ArrowRight size={17} />
          </button>
          {model === "Other model" && (
            <input
              className="svc-other-model"
              value={otherModel}
              onChange={(e) => setOtherModel(e.target.value)}
              aria-label="Enter your exact phone model"
              placeholder="Type your exact phone model"
            />
          )}
        </form>

        <div className="svc-catalog">
          <aside className="svc-sidebar" aria-label="Service categories">
            <h2>Service Categories</h2>
            <button
              type="button"
              className="svc-sidebar__mobile-toggle"
              onClick={() => setCategoryMenuOpen((value) => !value)}
              aria-expanded={categoryMenuOpen}
            >
              {category} <ChevronDown size={18} />
            </button>
            <div
              className={`svc-sidebar__items ${categoryMenuOpen ? "svc-sidebar__items--open" : ""}`}
            >
              {categories.map(({ name, icon: Icon }) => (
                <button
                  type="button"
                  key={name}
                  className={`svc-sidebar__item ${category === name ? "svc-sidebar__item--active" : ""}`}
                  onClick={() => {
                    setCategory(name);
                    setCategoryMenuOpen(false);
                  }}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="svc-results" aria-labelledby="svc-results-title">
            <div className="svc-results__heading">
              <div>
                <span className="svc-kicker svc-kicker--small">
                  <Sparkles size={13} /> ALL REPAIR OPTIONS
                </span>
                <h2 id="svc-results-title">
                  All Mobile <span>Repair Services</span>
                </h2>
              </div>
              <div className="svc-results__counter">
                {filtered.length}{" "}
                {filtered.length === 1 ? "service" : "services"} available
              </div>
            </div>
            {filtered.length ? (
              <div className="svc-grid">
                {filtered.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    brand={brand}
                    model={model}
                    otherModel={otherModel}
                  />
                ))}
              </div>
            ) : (
              <div className="svc-empty">
                <Search size={40} />
                <h3>No matching repair found</h3>
                <p>Try a different search or choose All Services.</p>
                <button type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="svc-note">
          <ShieldCheck size={22} />
          <p>
            <strong>Parts & warranty:</strong> Original manufacturer parts can
            be requested where available. Exact part type, availability, cost,
            repair eligibility and any warranty will be confirmed before
            service. We are not claiming manufacturer-authorized service.
          </p>
        </section>
        <section className="svc-cta">
          <div className="svc-cta__icon">
            <MessageCircle size={28} />
          </div>
          <div>
            <span>NEED HELP WITH YOUR PHONE?</span>
            <h2>We come to you. Your phone gets the care it needs.</h2>
            <p>Tell us the problem and we'll help you arrange an assessment.</p>
          </div>
          <Link to="/book-repair">
            Book Your Repair <ArrowUpRight size={19} />
          </Link>
        </section>
      </div>
    </div>
  );
}

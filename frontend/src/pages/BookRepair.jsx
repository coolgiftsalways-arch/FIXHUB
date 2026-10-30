import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardCopy,
  Clock3,
  Home,
  MapPin,
  ShieldCheck,
  Smartphone,
  Wrench,
  Search,
  RefreshCw,
  UserRound,
  AlertCircle,
  Gift,
  Crown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/BookRepair.css";

const PRICE_TIERS = [
  { label: "Up to ₹20,000", price: 499 },
  { label: "₹20,001 – ₹50,000", price: 699 },
  { label: "₹50,001 – ₹90,000", price: 999 },
  { label: "₹90,001 – ₹1,30,000", price: 1299 },
  { label: "Above ₹1,30,000", price: 1699 },
];

const ISSUES = [
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

const rupees = (amount) => `₹${amount.toLocaleString("en-IN")}`;

const emptyForm = () => ({
  phoneBrand: "",
  phoneModel: "",
  modelNotListed: false,
  repairIssue: "",
  serviceAddress: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
});

export default function BookRepair() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();

  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/repair-bookings/catalog", {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok || !Array.isArray(data.brands)) {
          throw new Error(data.message || "Unable to load phone catalogue.");
        }

        return data.brands;
      })
      .then((brands) => {
        if (!controller.signal.aborted) {
          setCatalog(brands);

          const requestedBrand = searchParams.get("brand");
          const requestedModel = searchParams.get("model");

          if (brands.some((b) => b.brand === requestedBrand)) {
            const record = brands.find((b) => b.brand === requestedBrand);

            setForm((old) => ({
              ...old,
              phoneBrand: requestedBrand,
              phoneModel: record.models.some((m) => m.model === requestedModel)
                ? requestedModel
                : "",
            }));
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setCatalogError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchParams]);

  useEffect(() => {
    if (user?.address) {
      setForm((old) => ({
        ...old,
        serviceAddress: old.serviceAddress || user.address,
      }));
    }
  }, [user?.address]);

  async function loadBookings() {
    if (!user) return;

    setRefreshing(true);

    try {
      const response = await fetch("/api/repair-bookings/my", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMyBookings(Array.isArray(data.bookings) ? data.bookings : []);
      }
    } catch {
      // Booking submission is independent of history loading.
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setMyBookings([]);
      return;
    }

    let cancelled = false;

    fetch("/api/repair-bookings/my", {
      credentials: "include",
    })
      .then(async (res) => ({
        ok: res.ok,
        data: await res.json(),
      }))
      .then(({ ok, data }) => {
        if (!cancelled && ok) {
          setMyBookings(data.bookings || []);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const selectedBrand = catalog.find((item) => item.brand === form.phoneBrand);

  const selectedPhone = selectedBrand?.models?.find(
    (item) => item.model === form.phoneModel,
  );

  const fixingCharge = form.modelNotListed
    ? null
    : (selectedPhone?.fee ?? null);

  const shownModels = useMemo(() => {
    const models = selectedBrand?.models || [];

    return models.filter((m) =>
      m.model.toLowerCase().includes(modelSearch.toLowerCase()),
    );
  }, [selectedBrand, modelSearch]);

  const today = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  }, []);

  function changeBrand(event) {
    setForm((old) => ({
      ...old,
      phoneBrand: event.target.value,
      phoneModel: "",
      modelNotListed: false,
    }));

    setModelSearch("");
    setReceipt(null);
    setError("");
  }

  function changeModel(event) {
    const notListed = event.target.value === "__OTHER__";

    setForm((old) => ({
      ...old,
      modelNotListed: notListed,
      phoneModel: notListed ? "" : event.target.value,
    }));

    setReceipt(null);
    setError("");
  }

  function changeField(event) {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));

    setError("");
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (busy) return;

    setError("");
    setReceipt(null);

    if (!user) {
      setError("Please log in before booking.");
      return;
    }

    if (
      !form.phoneBrand ||
      !form.phoneModel.trim() ||
      !form.repairIssue ||
      (!form.modelNotListed && !selectedPhone)
    ) {
      setError("Please select a valid mobile brand, model, and repair issue.");
      return;
    }

    if (form.serviceAddress.trim().length < 10) {
      setError("Enter your full doorstep service address.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/repair-bookings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to create booking.");
      }

      setReceipt(data.booking);

      setForm((old) => ({
        ...emptyForm(),
        serviceAddress: old.serviceAddress,
      }));

      setModelSearch("");

      await loadBookings();
    } catch (err) {
      setError(err.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fbr-page">
      {/* HERO */}
     

      {/* MEMBERSHIP OFFER */}
      <section className="fbr-container fbr-membership">
        <div className="fbr-membership__content">
          <div className="fbr-membership__icon">
            <Crown size={30} />
          </div>

          <div className="fbr-membership__text">
            <span className="fbr-membership__eyebrow">
              <Sparkles size={14} />
              FIXHUB MEMBERSHIP BENEFIT
            </span>

            <h2>
              Your First Repair Service <span>FREE!</span>
            </h2>

            <p>
              Purchase an eligible FIXHUB membership plan starting at ₹499 and
              enjoy your first eligible repair service without a service/labour
              charge.
            </p>

            <small>
              Replacement parts, additional services and exclusions may be
              chargeable. Membership must be active and the repair must meet
              plan terms.
            </small>
          </div>
        </div>

        <div className="fbr-membership__action">
         

          <Link to="/membership" className="fbr-membership__button">
            Explore Plans <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* BOOKING FORM */}
      <section className="fbr-container fbr-main" id="repair-form">
        <div className="fbr-formcard">
          <div className="fbr-cardhead">
            <span className="fbr-eyebrow">
              <ClipboardCheck size={15} />
              SMART BOOKING FORM
            </span>

            <h2>Tell us about your phone.</h2>

            <p>
              We calculate the fixing charge from the phone catalogue. You don't
              enter the mobile price yourself.
            </p>
          </div>

          {!authLoading && !user ? (
            <div className="fbr-login">
              <UserRound size={28} />

              <h3>Login required</h3>

              <p>
                Please log in or create your FIXHUB account to book a repair.
                Your contact details will be filled automatically.
              </p>

              <Link
                className="fbr-primary"
                to="/login"
                state={{ from: "/book-repair" }}
              >
                Login to Book <ArrowRight size={18} />
              </Link>
            </div>
          ) : authLoading ? (
            <p className="fbr-muted">Checking your FIXHUB account...</p>
          ) : (
            <form onSubmit={submitBooking} className="fbr-form">
              <div className="fbr-paneltitle">
                <span>01</span> Your FIXHUB Account
              </div>

              <div className="fbr-two">
                <label>
                  Full Name
                  <input value={user?.fullName || ""} disabled />
                </label>

                <label>
                  Mobile Number
                  <input value={user?.phone || ""} disabled />
                </label>
              </div>

              <label>
                Email Address
                <input value={user?.email || ""} disabled />
              </label>

              <div className="fbr-paneltitle">
                <span>02</span> Select Your Phone
              </div>

              {catalogLoading && (
                <p className="fbr-muted">Loading brands and models...</p>
              )}

              {catalogError && (
                <p className="fbr-error" role="alert">
                  {catalogError}
                </p>
              )}

              <div className="fbr-two">
                <label>
                  Mobile Brand *
                  <select
                    value={form.phoneBrand}
                    onChange={changeBrand}
                    required
                    disabled={catalogLoading || !!catalogError}
                  >
                    <option value="">Choose your brand</option>

                    {catalog.map((item) => (
                      <option value={item.brand} key={item.brand}>
                        {item.brand}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Search Models
                  <div className="fbr-search">
                    <Search size={17} />

                    <input
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search e.g. 11R"
                      disabled={!form.phoneBrand}
                    />
                  </div>
                </label>
              </div>

              <label>
                Mobile Model *
                <select
                  value={form.modelNotListed ? "__OTHER__" : form.phoneModel}
                  onChange={changeModel}
                  disabled={!form.phoneBrand}
                  required
                >
                  <option value="">Select phone model</option>

                  {shownModels.map((item) => (
                    <option value={item.model} key={item.model}>
                      {item.model}
                    </option>
                  ))}

                  <option value="__OTHER__">My model is not listed</option>
                </select>
              </label>

              {form.modelNotListed && (
                <label>
                  Enter Your Exact Phone Model *
                  <input
                    name="phoneModel"
                    value={form.phoneModel}
                    onChange={changeField}
                    placeholder="Full model name"
                    maxLength={90}
                    minLength={2}
                    required
                  />
                </label>
              )}

              <div className="fbr-pricebox" aria-live="polite">
                <div>
                  <span>YOUR FIXING CHARGE</span>

                  <strong>
                    {fixingCharge == null
                      ? form.modelNotListed
                        ? "Pending quotation"
                        : "Select a model"
                      : rupees(fixingCharge)}
                  </strong>

                  <small>
                    {selectedPhone
                      ? `${form.phoneBrand} ${form.phoneModel} · Catalogue phone value ${rupees(selectedPhone.mrp)}`
                      : "Based on your selected phone"}
                  </small>
                </div>

                <BadgeCheck size={27} />
              </div>

              <p className="fbr-clarification">
                Service/labour charge only; parts are additional. An eligible
                active membership may cover the first repair service after
                verification. Membership benefits are not automatically applied
                at booking. Final charges will be confirmed before work.
              </p>

              <div className="fbr-paneltitle">
                <span>03</span> Repair & Doorstep Details
              </div>

              <label>
                What is the problem? *
                <select
                  name="repairIssue"
                  value={form.repairIssue}
                  onChange={changeField}
                  required
                >
                  <option value="">Choose repair issue</option>

                  {ISSUES.map((issue) => (
                    <option key={issue}>{issue}</option>
                  ))}
                </select>
              </label>

              <label>
                Full Doorstep Service Address *
                <textarea
                  name="serviceAddress"
                  value={form.serviceAddress}
                  onChange={changeField}
                  rows={3}
                  minLength={10}
                  maxLength={300}
                  required
                  placeholder="Building, street, area, city and pincode"
                />
              </label>

              <div className="fbr-two">
                <label>
                  Preferred Date (optional)
                  <input
                    type="date"
                    name="preferredDate"
                    min={today}
                    value={form.preferredDate}
                    onChange={changeField}
                  />
                </label>

                <label>
                  Preferred Time (optional)
                  <select
                    name="preferredTime"
                    value={form.preferredTime}
                    onChange={changeField}
                  >
                    <option value="">Any time</option>
                    <option value="11:00-13:00">11 AM – 1 PM</option>
                    <option value="13:00-15:00">1 PM – 3 PM</option>
                    <option value="15:00-17:00">3 PM – 5 PM</option>
                    <option value="17:00-19:00">5 PM – 7 PM</option>
                  </select>
                </label>
              </div>

              <label>
                Additional Details (optional)
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={changeField}
                  rows={3}
                  maxLength={1000}
                  placeholder="Describe the issue or special instructions"
                />
              </label>

              {error && (
                <p className="fbr-error" role="alert">
                  <AlertCircle size={17} />
                  {error}
                </p>
              )}

              {receipt && (
                <div className="fbr-success" role="status">
                  <CheckCircle2 size={23} />

                  <div>
                    <strong>Booking request saved!</strong>

                    <p>
                      Reference: <b>{receipt.bookingId}</b>
                    </p>

                    <p>
                      Status: {receipt.status}. Your request is not a confirmed
                      appointment yet.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard?.writeText(receipt.bookingId)
                      }
                    >
                      <ClipboardCopy size={15} />
                      Copy Booking ID
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="fbr-primary fbr-submit"
                disabled={busy || catalogLoading || !!catalogError}
              >
                {busy ? "Sending Request..." : "Confirm Repair Request"}

                <ArrowRight size={18} />
              </button>

              <p className="fbr-legal">
                No payment is collected on this form. FIXHUB will contact you to
                confirm the diagnosis, parts, quote and appointment.
              </p>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="fbr-sidebar">
          <div className="fbr-sidecard">
            <div className="fbr-side-title">
              <Wrench size={20} />
              <h3>One Fixing Charge</h3>
            </div>

            <p>
              Standard service fee based on the selected model's original
              recorded phone value.
            </p>

            <div className="fbr-pricerows">
              {PRICE_TIERS.map(({ label, price }) => (
                <div
                  className={
                    fixingCharge === price
                      ? "fbr-pricerow active"
                      : "fbr-pricerow"
                  }
                  key={price}
                >
                  <span>{label}</span>
                  <strong>{rupees(price)}</strong>
                </div>
              ))}
            </div>

            <small>
              Replacement parts billed separately. Model values in the current
              catalogue are provisional until verified against manufacturer
              records.
            </small>
          </div>

          {/* MEMBERSHIP SIDEBAR */}
          <div className="fbr-sidecard fbr-plan-card">
            <div className="fbr-plan-icon">
              <Gift size={24} />
            </div>

            <span className="fbr-plan-label">SPECIAL MEMBERSHIP BENEFIT</span>

            <h3>First Repair FREE</h3>

            <p>
              Buy an eligible FIXHUB plan and enjoy your first eligible repair
              service free.
            </p>

            

            <Link to="/membership" className="fbr-plan-link">
              View Membership Plans
              <ArrowRight size={16} />
            </Link>

            <small>
              Active membership and plan eligibility must be verified. Parts and
              exclusions are separate.
            </small>
          </div>

          <div className="fbr-sidecard fbr-sidecard--small">
            <h3>
              <CalendarDays size={20} />
              Doorstep Service
            </h3>

            <p>
              <MapPin size={16} />
              We visit your address where service is available.
            </p>

            <p>
              <ShieldCheck size={16} />
              Repair starts only after you approve the quote.
            </p>

            <p>
              <Clock3 size={16} />
              Preferred times are requests, not confirmed appointments.
            </p>
          </div>

          {user && (
            <div className="fbr-sidecard fbr-sidecard--small">
              <div className="fbr-historytop">
                <h3>My Repair Requests</h3>

                <button
                  type="button"
                  title="Refresh requests"
                  onClick={loadBookings}
                  disabled={refreshing}
                >
                  <RefreshCw size={17} />
                </button>
              </div>

              {!myBookings.length && <p>No repair requests yet.</p>}

              {myBookings.slice(0, 5).map((item) => (
                <div className="fbr-history" key={item.id}>
                  <strong>
                    {item.phoneBrand} {item.phoneModel}
                  </strong>

                  <small>{item.bookingId}</small>

                  <span>{item.status.replaceAll("_", " ")}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

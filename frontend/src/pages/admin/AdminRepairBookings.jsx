import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCopy, RefreshCw, Search, Smartphone } from "lucide-react";

const STATUSES = [
  "pending",
  "pending_quote",
  "contacted",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];
const money = (value) =>
  value == null ? "Price review" : `₹${Number(value).toLocaleString("en-IN")}`;
const dateText = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : "—";

async function request(path, options = {}) {
  const response = await fetch(path, { credentials: "include", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export default function AdminRepairBookings({ onSessionExpired }) {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await request("/api/repair-bookings/admin?limit=100");
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      setError("");
    } catch (e) {
      if (e.status === 401) onSessionExpired?.();
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((b) =>
      [
        b.bookingId,
        b.phoneBrand,
        b.phoneModel,
        b.repairIssue,
        b.customer?.fullName,
        b.customer?.email,
        b.customer?.phone,
        b.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [bookings, search]);

  async function setStatus(id, status) {
    setBusyId(id);
    setError("");
    try {
      const result = await request(`/api/repair-bookings/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setBookings((previous) =>
        previous.map((b) => (b.id === id ? result.booking : b)),
      );
      setNotice("Booking status updated.");
    } catch (e) {
      if (e.status === 401) onSessionExpired?.();
      else setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const card = {
    background: "#fff",
    border: "1px solid #e1e9f4",
    borderRadius: 16,
    padding: 22,
  };
  return (
    <div style={{ color: "#12213b" }}>
      <span
        style={{
          color: "#008cff",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
        }}
      >
        FIXHUB ADMIN PANEL
      </span>
      <h1 style={{ fontSize: 36, margin: "12px 0 7px" }}>Repair Bookings</h1>
      <p style={{ color: "#74839b", marginBottom: 25 }}>
        View requests submitted from the Book Your Mobile Repair page.
      </p>
      <div style={card}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <strong style={{ fontSize: 20 }}>
            <Smartphone size={21} style={{ verticalAlign: "middle" }} />{" "}
            Bookings ({shown.length})
          </strong>
          <button
            onClick={load}
            type="button"
            style={{
              padding: "11px 16px",
              border: 0,
              borderRadius: 10,
              color: "#fff",
              background: "#008cff",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 20,
            border: "1px solid #d8e3f0",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <Search size={17} color="#74839b" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, customer, phone or status"
            style={{ border: 0, outline: 0, flex: 1, minWidth: 120 }}
          />
        </div>
        {error && (
          <p role="alert" style={{ color: "#c92a47" }}>
            {error}
          </p>
        )}
        {notice && (
          <p role="status" style={{ color: "#197d4b" }}>
            {notice}
          </p>
        )}
        {loading ? (
          <p>Loading bookings...</p>
        ) : !shown.length ? (
          <p>No matching bookings.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Booking ID",
                    "Customer",
                    "Phone",
                    "Service",
                    "Address",
                    "Price",
                    "Date",
                    "Status",
                  ].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: 13,
                        borderBottom: "1px solid #d8e3f0",
                        color: "#708099",
                        fontSize: 12,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((b) => (
                  <tr key={b.id}>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      <code>{b.bookingId}</code>
                      <br />
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(b.bookingId)
                        }
                        style={{
                          border: 0,
                          background: "none",
                          color: "#008cff",
                          cursor: "pointer",
                        }}
                      >
                        <ClipboardCopy size={13} /> Copy
                      </button>
                    </td>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      {b.customer?.fullName || "—"}
                      <br />
                      <small>{b.customer?.phone || ""}</small>
                    </td>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      {b.phoneBrand}
                      <br />
                      <b>{b.phoneModel}</b>
                    </td>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      {b.repairIssue}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #edf1f7",
                        maxWidth: 230,
                      }}
                    >
                      {b.serviceAddress}
                    </td>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      {money(b.fixingCharge)}
                    </td>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      {dateText(b.createdAt)}
                    </td>
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #edf1f7" }}
                    >
                      <select
                        aria-label={`Status for ${b.bookingId}`}
                        value={b.status}
                        disabled={busyId === b.id}
                        onChange={(e) => setStatus(b.id, e.target.value)}
                        style={{
                          padding: 8,
                          borderRadius: 9,
                          border: "1px solid #d8e3f0",
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

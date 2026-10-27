import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCopy, RefreshCw, Search, Wrench } from "lucide-react";

const STATUSES = [
  "pending",
  "pending_quote",
  "contacted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];
const money = (v) =>
  v == null ? "Quote pending" : `₹${Number(v).toLocaleString("en-IN")}`;

export default function AdminRepairBookings({ onSessionExpired }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/repair-bookings/admin?limit=100", {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        onSessionExpired?.();
        return;
      }
      if (!response.ok)
        throw new Error(data.message || "Unable to load bookings.");
      setBookings(data.bookings || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? bookings.filter((b) =>
          [
            b.bookingId,
            b.phoneBrand,
            b.phoneModel,
            b.repairIssue,
            b.status,
            b.customer?.fullName,
            b.customer?.email,
            b.customer?.phone,
          ].some((part) =>
            String(part || "")
              .toLowerCase()
              .includes(q),
          ),
        )
      : bookings;
  }, [bookings, search]);

  async function changeStatus(booking, status) {
    setSaving(booking.id);
    setError("");
    try {
      const response = await fetch(`/api/repair-bookings/admin/${booking.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        onSessionExpired?.();
        return;
      }
      if (!response.ok) throw new Error(data.message || "Update failed.");
      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? { ...item, status: data.booking.status }
            : item,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  return (
    <main style={{ padding: "clamp(15px,3vw,36px)", color: "#12213b" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <div>
          <span
            style={{
              color: "#008cff",
              letterSpacing: 2,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            FIXHUB ADMIN PANEL
          </span>
          <h1 style={{ fontSize: 36, margin: "12px 0" }}>Repair Bookings</h1>
          <p style={{ color: "#7787a0", margin: 0 }}>
            All customer doorstep repair requests stored in MongoDB.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={load}
          style={btnStyle}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <section
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #e0e8f2",
          padding: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <Wrench color="#008cff" size={21} />
          <h2 style={{ margin: 0, fontSize: 22 }}>
            Repair Requests ({filtered.length})
          </h2>
        </div>
        <div style={{ position: "relative", maxWidth: 520, marginBottom: 22 }}>
          <Search
            size={17}
            style={{
              position: "absolute",
              left: 13,
              top: 14,
              color: "#70849b",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking ID, customer, phone, status..."
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              border: "1px solid #d9e4f1",
              borderRadius: 11,
              boxSizing: "border-box",
            }}
          />
        </div>
        {error && (
          <p role="alert" style={{ color: "#d02c43" }}>
            {error}
          </p>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : !filtered.length ? (
          <p style={{ color: "#74829b" }}>No matching repair bookings.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 970,
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {[
                    "Booking ID",
                    "Customer",
                    "Phone",
                    "Issue",
                    "Fixing Fee",
                    "Service Address",
                    "Preferred Date",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            maxWidth: 125,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={b.bookingId}
                        >
                          {b.bookingId}
                        </span>
                        <button
                          type="button"
                          title="Copy booking ID"
                          onClick={() =>
                            navigator.clipboard?.writeText(b.bookingId)
                          }
                          style={{
                            background: "none",
                            border: 0,
                            cursor: "pointer",
                            color: "#008cff",
                          }}
                        >
                          <ClipboardCopy size={15} />
                        </button>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <b>{b.customer?.fullName || "Customer unavailable"}</b>
                      <div>{b.customer?.phone}</div>
                      <div>{b.customer?.email}</div>
                    </td>
                    <td style={tdStyle}>
                      {b.phoneBrand} {b.phoneModel}
                    </td>
                    <td style={tdStyle}>{b.repairIssue}</td>
                    <td style={tdStyle}>
                      <b>{money(b.fixingCharge)}</b>
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: 190,
                        wordBreak: "break-word",
                      }}
                    >
                      {b.serviceAddress}
                    </td>
                    <td style={tdStyle}>
                      {b.preferredDate || "—"}
                      <div>{b.preferredTime || ""}</div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        aria-label={`Status for ${b.bookingId}`}
                        value={b.status}
                        onChange={(e) => changeStatus(b, e.target.value)}
                        disabled={saving === b.id}
                        style={{
                          padding: 9,
                          borderRadius: 8,
                          border: "1px solid #d4e1ee",
                          background: "#f5faff",
                          color: "#142542",
                        }}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
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
      </section>
    </main>
  );
}

const btnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  background: "#008cff",
  color: "white",
  padding: "12px 20px",
  border: 0,
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};
const thStyle = {
  textAlign: "left",
  padding: "15px 12px",
  color: "#7787a0",
  borderBottom: "1px solid #e4ebf3",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "15px 12px",
  borderBottom: "1px solid #edf1f7",
  verticalAlign: "top",
  lineHeight: 1.6,
};


import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Copy,
  RefreshCw,
  Search,
  Trash2,
  Smartphone,
  UserRound,
  CheckCircle2,
  Clock3,
  AlertCircle,
  IndianRupee,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";

// ==========================================
// FIXHUB ADMIN MEMBERSHIP REQUESTS
// ==========================================

// FIVE FIXHUB FIXING-CHARGE BRACKETS

const PRICE_BRACKETS = [
  { label: "Up to ₹20,000", price: 499 },
  { label: "₹20,001 – ₹50,000", price: 699 },
  { label: "₹50,001 – ₹90,000", price: 999 },
  { label: "₹90,001 – ₹1,30,000", price: 1299 },
  { label: "Above ₹1,30,000", price: 1699 },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "pending_quote", label: "Price Review" },
  { value: "contacted", label: "Contacted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// ==========================================
// HELPERS
// ==========================================

function money(value) {
  if (value === null || value === undefined || value === "") {
    return "Price Review";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price Review";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function statusLabel(status) {
  return (
    STATUSES.find((item) => item.value === status)?.label || status || "Pending"
  );
}

function statusColors(status) {
  switch (status) {
    case "approved":
      return {
        background: "#e8f8ee",
        color: "#168348",
      };

    case "rejected":
      return {
        background: "#ffedf0",
        color: "#c22f47",
      };

    case "contacted":
      return {
        background: "#e6f2ff",
        color: "#0070d9",
      };

    case "pending_quote":
      return {
        background: "#fff2dc",
        color: "#a36a05",
      };

    default:
      return {
        background: "#f0f3f9",
        color: "#65758c",
      };
  }
}

// ==========================================
// API REQUEST HELPER
// ==========================================

async function api(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error(
      "Cannot connect to FIXHUB backend. Check that the server is running.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Unable to complete request.");

    error.status = response.status;

    throw error;
  }

  return data;
}

// ==========================================
// STYLES
// ==========================================

const S = {
  page: {
    maxWidth: 1600,
    margin: "0 auto",
    color: "#132945",
    paddingBottom: 40,
  },

  eyebrow: {
    color: "#008cff",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
  },

  title: {
    fontSize: "clamp(26px, 3vw, 36px)",
    color: "#10213c",
    margin: "12px 0",
  },

  muted: {
    color: "#75839a",
    lineHeight: 1.6,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e1e9f4",
    borderRadius: 18,
    padding: "clamp(15px, 2.5vw, 28px)",
  },

  primary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 18px",
    background: "#008cff",
    color: "#ffffff",
    border: 0,
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },

  input: {
    width: "100%",
    background: "#ffffff",
    color: "#152942",
    border: "1px solid #dce5f1",
    borderRadius: 10,
    padding: "13px 14px",
    outlineColor: "#008cff",
    boxSizing: "border-box",
  },

  th: {
    padding: "15px 12px",
    textAlign: "left",
    fontSize: 12,
    color: "#74849d",
    borderBottom: "1px solid #e2eaf5",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "18px 12px",
    fontSize: 12,
    color: "#142942",
    verticalAlign: "top",
    borderBottom: "1px solid #e8eef6",
  },

  iconButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: 0,
    background: "transparent",
    color: "#008cff",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: 12,
  },

  delete: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "#fff0f2",
    color: "#c03148",
    border: "1px solid #efbdc6",
    padding: "9px 12px",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 650,
  },
};

// ==========================================
// REUSABLE SUMMARY CARD
// ==========================================

function SummaryCard({ label, value, icon: Icon, color = "#008cff" }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e1e9f4",
        padding: 20,
        borderRadius: 15,
        display: "flex",
        alignItems: "center",
        gap: 15,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          flexShrink: 0,
          borderRadius: 13,
          background: `${color}14`,
          color,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon size={23} />
      </div>

      <div>
        <div
          style={{
            fontSize: 12,
            color: "#75839a",
            marginBottom: 5,
          }}
        >
          {label}
        </div>

        <strong
          style={{
            fontSize: 27,
            color: "#10213c",
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

// ==========================================
// COMPLETE ADMIN COMPONENT
// ==========================================

export default function AdminMembershipRequests({ onSessionExpired }) {
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [refreshNumber, setRefreshNumber] = useState(0);

  // ========================================
  // LOAD MONGODB REQUESTS
  // ========================================

  const loadRequests = useCallback(
    async (signal) => {
      try {
        const result = await api("/api/membership-requests/admin?limit=100", {
          signal,
        });

        if (signal?.aborted) return;

        setRequests(Array.isArray(result.requests) ? result.requests : []);

        setError("");
      } catch (err) {
        if (signal?.aborted) return;

        if (err.status === 401) {
          onSessionExpired?.();
        } else if (err.status === 403) {
          setError(
            "Your account does not have permission to view membership requests.",
          );
        } else {
          setError(err.message);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [onSessionExpired],
  );

  // ========================================
  // AUTO REFRESH EVERY 30 SECONDS
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    loadRequests(controller.signal);

    const interval = setInterval(() => {
      loadRequests(controller.signal);
    }, 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadRequests, refreshNumber]);

  // ========================================
  // REFRESH BUTTON
  // ========================================

  function refresh() {
    setLoading(true);
    setError("");
    setRefreshNumber((value) => value + 1);
  }

  // ========================================
  // SEARCH AND FILTER
  // ========================================

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((item) => {
      const customer = item.customer || {};

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const values = [
        item.requestId,
        item.id,
        item.customerId,
        item.phoneBrand,
        item.phoneModel,
        item.phoneMRP,
        item.planPrice,
        item.repairIssue,
        item.status,
        customer.fullName,
        customer.email,
        customer.phone,
        customer.address,
      ];

      const matchesSearch =
        !query ||
        values.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  // ========================================
  // DASHBOARD COUNTS
  // ========================================

  const stats = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter((item) => item.status === "pending").length,

      approved: requests.filter((item) => item.status === "approved").length,

      priceReview: requests.filter((item) => item.status === "pending_quote")
        .length,
    };
  }, [requests]);

  // ========================================
  // UPDATE REQUEST STATUS
  // ========================================

  async function updateStatus(item, status) {
    if (busyId || item.status === status) return;

    setBusyId(item.id);
    setError("");
    setNotice("");

    try {
      const result = await api(`/api/membership-requests/admin/${item.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ status }),
      });

      const updated = result.request;

      setRequests((previous) =>
        previous.map((request) => (request.id === item.id ? updated : request)),
      );

      setSelectedRequest((current) =>
        current?.id === item.id ? updated : current,
      );

      setNotice(`Request ${item.requestId} updated to ${statusLabel(status)}.`);
    } catch (err) {
      if (err.status === 401) {
        onSessionExpired?.();
      } else {
        setError(err.message);
      }
    } finally {
      setBusyId(null);
    }
  }

  // ========================================
  // COPY REQUEST ID
  // ========================================

  async function copyId(requestId) {
    try {
      await navigator.clipboard.writeText(requestId);

      setNotice(`${requestId} copied successfully.`);
      setError("");
    } catch {
      setError(
        "Could not copy the request ID. Please select and copy it manually.",
      );
    }
  }

  // ========================================
  // DELETE REQUEST
  // ========================================

  async function deleteRequest(item) {
    if (busyId) return;

    const confirmed = window.confirm(
      `Delete this membership request permanently?\n\nRequest ID: ${item.requestId}\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyId(item.id);
    setError("");
    setNotice("");

    try {
      await api(`/api/membership-requests/admin/${item.id}`, {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          confirmRequestId: item.requestId,
        }),
      });

      setRequests((previous) =>
        previous.filter((request) => request.id !== item.id),
      );

      if (selectedRequest?.id === item.id) {
        setSelectedRequest(null);
      }

      setNotice(`${item.requestId} permanently deleted.`);
    } catch (err) {
      if (err.status === 401) {
        onSessionExpired?.();
      } else {
        setError(err.message);
      }
    } finally {
      setBusyId(null);
    }
  }

  // ========================================
  // STATUS BADGE
  // ========================================

  function StatusBadge({ status }) {
    const colors = statusColors(status);

    return (
      <span
        style={{
          ...colors,
          display: "inline-flex",
          alignItems: "center",
          padding: "7px 11px",
          fontSize: 11,
          fontWeight: 750,
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        {statusLabel(status)}
      </span>
    );
  }

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <div style={S.page}>
      {/* PAGE HEADER */}

      <div style={{ marginBottom: 28 }}>
        <span style={S.eyebrow}>FIXHUB ADMIN PANEL</span>

        <h1 style={S.title}>Membership Requests</h1>

        <p style={S.muted}>
          Manage customer plan requests, mobile models, automatic fixing charges
          and request statuses.
        </p>
      </div>

      {/* SUMMARY CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 15,
          marginBottom: 25,
        }}
      >
        <SummaryCard
          label="Total Requests"
          value={stats.total}
          icon={ClipboardList}
        />

        <SummaryCard
          label="Pending Requests"
          value={stats.pending}
          icon={Clock3}
          color="#e49b18"
        />

        <SummaryCard
          label="Approved Requests"
          value={stats.approved}
          icon={CheckCircle2}
          color="#179654"
        />

        <SummaryCard
          label="Price Reviews"
          value={stats.priceReview}
          icon={AlertCircle}
          color="#9365d9"
        />
      </div>

      {/* FIVE FIXHUB PRICE BRACKETS */}

      <section
        style={{
          ...S.card,
          marginBottom: 25,
        }}
      >
        <h2
          style={{
            fontSize: 19,
            margin: "0 0 8px",
          }}
        >
          <IndianRupee
            size={19}
            color="#008cff"
            style={{ verticalAlign: "middle" }}
          />{" "}
          FIXHUB Fixing Charges
        </h2>

        <p
          style={{
            ...S.muted,
            fontSize: 12,
            marginBottom: 20,
          }}
        >
          These are the five service charge brackets based on the phone's
          verified original value.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {PRICE_BRACKETS.map((tier) => (
            <div
              key={tier.price}
              style={{
                background: "#f1f7ff",
                border: "1px solid #dceaff",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#75839a",
                  minHeight: 35,
                }}
              >
                {tier.label}
              </div>

              <strong
                style={{
                  color: "#008cff",
                  fontSize: 25,
                }}
              >
                {money(tier.price)}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* REQUESTS SECTION */}

      <section style={S.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 22,
            }}
          >
            <ClipboardList
              size={22}
              color="#008cff"
              style={{ verticalAlign: "middle" }}
            />{" "}
            Customer Requests ({requests.length})
          </h2>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              ...S.primary,
              opacity: loading ? 0.65 : 1,
            }}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* SEARCH CONTROLS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 15,
            marginBottom: 24,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={17}
              color="#008cff"
              style={{
                position: "absolute",
                left: 13,
                top: 15,
              }}
            />

            <input
              type="search"
              placeholder="Search customer, request ID, brand or model"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                ...S.input,
                paddingLeft: 40,
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={S.input}
          >
            <option value="all">All Request Statuses</option>

            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* ALERTS */}

        {error && (
          <p
            role="alert"
            style={{
              color: "#b92741",
              background: "#fff1f2",
              padding: 14,
              borderRadius: 10,
            }}
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            style={{
              color: "#148146",
              background: "#eaf9ef",
              padding: 14,
              borderRadius: 10,
            }}
          >
            {notice}
          </p>
        )}

        {loading && <p style={S.muted}>Loading membership requests...</p>}

        {!loading && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 15px",
              color: "#8290a5",
            }}
          >
            <ClipboardList size={40} style={{ marginBottom: 12 }} />

            <h3
              style={{
                color: "#253b57",
                marginBottom: 8,
              }}
            >
              No requests found
            </h3>

            <p>
              New customer requests will appear here after they submit the
              membership form.
            </p>
          </div>
        )}

        {/* CUSTOMER REQUEST TABLE */}

        {!loading && filtered.length > 0 && (
          <div
            style={{
              overflowX: "auto",
              width: "100%",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: 1150,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Request ID",
                    "Customer",
                    "Phone Model",
                    "Fixing Charge",
                    "Repair Issue",
                    "Submitted",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} style={S.th}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const customer = item.customer || {};

                  return (
                    <tr key={item.id}>
                      {/* REQUEST ID */}

                      <td style={S.td}>
                        <strong
                          style={{
                            color: "#008cff",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.requestId}
                        </strong>

                        <div style={{ marginTop: 9 }}>
                          <button
                            type="button"
                            onClick={() => copyId(item.requestId)}
                            style={S.iconButton}
                          >
                            <Copy size={14} />
                            Copy
                          </button>
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td style={S.td}>
                        <strong
                          style={{
                            fontSize: 13,
                          }}
                        >
                          {customer.fullName || "Unknown Customer"}
                        </strong>

                        <div style={{ marginTop: 7 }}>
                          {customer.phone || "—"}
                        </div>

                        <div
                          style={{
                            color: "#77869c",
                            marginTop: 4,
                          }}
                        >
                          {customer.email || "—"}
                        </div>
                      </td>

                      {/* PHONE BRAND / MODEL */}

                      <td style={S.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Smartphone size={16} color="#008cff" />

                          <strong>{item.phoneBrand || "—"}</strong>
                        </div>

                        <div style={{ marginTop: 8 }}>
                          {item.phoneModel || "—"}
                        </div>

                        <div
                          style={{
                            color: "#7e8ba0",
                            marginTop: 5,
                          }}
                        >
                          Phone MRP: {money(item.phoneMRP)}
                        </div>
                      </td>

                      {/* AUTOMATIC PRICE */}

                      <td style={S.td}>
                        <strong
                          style={{
                            color:
                              item.planPrice == null ? "#ad781e" : "#008cff",
                            fontSize: 20,
                          }}
                        >
                          {money(item.planPrice)}
                        </strong>

                        <div
                          style={{
                            fontSize: 11,
                            color: "#8390a4",
                            marginTop: 6,
                          }}
                        >
                          Service charge
                        </div>
                      </td>

                      {/* REPAIR ISSUE */}

                      <td style={S.td}>{item.repairIssue || "—"}</td>

                      {/* CREATED AT */}

                      <td style={S.td}>{formatDate(item.createdAt)}</td>

                      {/* STATUS */}

                      <td style={S.td}>
                        <StatusBadge status={item.status} />

                        <select
                          value={item.status || "pending"}
                          disabled={Boolean(busyId)}
                          onChange={(event) =>
                            updateStatus(item, event.target.value)
                          }
                          style={{
                            ...S.input,
                            marginTop: 10,
                            minWidth: 130,
                            padding: 9,
                          }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ACTIONS */}

                      <td style={S.td}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 10,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(item)}
                            style={S.iconButton}
                          >
                            <Eye size={15} />
                            View Details
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => deleteRequest(item)}
                            style={{
                              ...S.delete,
                              opacity: busyId ? 0.6 : 1,
                            }}
                          >
                            <Trash2 size={15} />

                            {busyId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p
          style={{
            ...S.muted,
            fontSize: 11,
            marginTop: 20,
          }}
        >
          Showing {filtered.length} request(s) from the first 100 records
          returned by the backend. Refresh updates the list.
        </p>
      </section>

      {/* =====================================
          VIEW CUSTOMER REQUEST DETAILS
      ===================================== */}

      {selectedRequest && (
        <div
          role="presentation"
          onClick={() => setSelectedRequest(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(5, 18, 37, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Membership Request Details"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: 650,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 18,
              padding: 27,
              boxShadow: "0 30px 90px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 15,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                }}
              >
                Request Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                style={S.iconButton}
                aria-label="Close details"
              >
                <X size={23} />
              </button>
            </div>

            <div
              style={{
                background: "#edf6ff",
                padding: 18,
                borderRadius: 12,
                marginTop: 22,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#7086a1",
                  marginBottom: 7,
                }}
              >
                FIXHUB REQUEST ID
              </div>

              <strong
                style={{
                  color: "#008cff",
                  fontSize: 19,
                  overflowWrap: "anywhere",
                }}
              >
                {selectedRequest.requestId}
              </strong>

              <button
                type="button"
                onClick={() => copyId(selectedRequest.requestId)}
                style={{
                  ...S.iconButton,
                  marginLeft: 12,
                }}
              >
                <Copy size={14} />
                Copy
              </button>
            </div>

            {[
              {
                icon: UserRound,
                label: "Customer Name",
                value: selectedRequest.customer?.fullName || "—",
              },
              {
                icon: Mail,
                label: "Email",
                value: selectedRequest.customer?.email || "—",
              },
              {
                icon: Phone,
                label: "Mobile Number",
                value: selectedRequest.customer?.phone || "—",
              },
              {
                icon: MapPin,
                label: "Customer Address",
                value: selectedRequest.customer?.address || "—",
              },
              {
                icon: Smartphone,
                label: "Phone Brand / Model",
                value: `${selectedRequest.phoneBrand || "—"} ${selectedRequest.phoneModel || ""}`,
              },
              {
                icon: IndianRupee,
                label: "Original Phone MRP",
                value: money(selectedRequest.phoneMRP),
              },
              {
                icon: IndianRupee,
                label: "Fixing Charge",
                value: money(selectedRequest.planPrice),
              },
              {
                icon: ClipboardList,
                label: "Repair Issue",
                value: selectedRequest.repairIssue || "—",
              },
              {
                icon: CalendarDays,
                label: "Request Date",
                value: formatDate(selectedRequest.createdAt),
              },
              {
                icon: Clock3,
                label: "Preferred Date",
                value: selectedRequest.preferredDate
                  ? formatDate(selectedRequest.preferredDate)
                  : "Not selected",
              },
              {
                icon: ClipboardList,
                label: "Additional Notes",
                value: selectedRequest.notes || "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  borderBottom: "1px solid #e6edf5",
                  padding: "14px 0",
                }}
              >
                <Icon size={18} color="#008cff" style={{ flexShrink: 0 }} />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#7b8ba2",
                      marginBottom: 5,
                    }}
                  >
                    {label}
                  </div>

                  <strong
                    style={{
                      fontSize: 13,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </strong>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 25 }}>
              <StatusBadge status={selectedRequest.status} />
            </div>

            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              style={{
                ...S.primary,
                width: "100%",
                marginTop: 24,
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

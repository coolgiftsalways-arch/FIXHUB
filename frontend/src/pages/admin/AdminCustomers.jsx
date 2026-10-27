import { useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Copy,
  Eye,
  Trash2,
  X,
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Crown,
} from "lucide-react";

// ==========================================
// FIXHUB ADMIN API
// ==========================================

async function adminAPI(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
  });

  const result = await response.json().catch(() => ({
    message: "Invalid server response.",
  }));

  if (!response.ok) {
    const error = new Error(result.message || "Request failed.");

    error.status = response.status;
    throw error;
  }

  return result;
}

// ==========================================
// DATE FORMAT
// ==========================================

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

// ==========================================
// COLORS
// ==========================================

const colors = {
  blue: "#008cff",
  gold: "#d99a21",

  text: "var(--fh-admin-text, #10213c)",
  muted: "var(--fh-admin-muted, #73819b)",
  border: "var(--fh-admin-border, #e2eaf5)",
  surface: "var(--fh-admin-sidebar-bg, #ffffff)",
};

const buttonStyle = {
  border: 0,
  borderRadius: 9,
  padding: "10px 15px",
  cursor: "pointer",
  display: "inline-flex",
  gap: 7,
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
};

const cellStyle = {
  padding: "17px 12px",
  fontSize: 13,
  color: colors.text,
  borderBottom: `1px solid ${colors.border}`,
  textAlign: "left",
  verticalAlign: "middle",
};

// ==========================================
// CUSTOMER DETAIL ROW
// ==========================================

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        padding: "15px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 9,
          alignItems: "center",
          color: colors.muted,
          fontSize: 12,
          marginBottom: 8,
        }}
      >
        <Icon size={15} />
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          color: colors.text,
          overflowWrap: "anywhere",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

// ==========================================
// GOLD BADGE
// ==========================================

function MembershipBadge({ tier }) {
  const isGold = tier === "gold";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 800,

        background: isGold ? "rgba(245,158,11,.13)" : "rgba(148,163,184,.12)",

        color: isGold ? "#b77908" : colors.muted,
      }}
    >
      {isGold && <Crown size={14} />}

      {isGold ? "Gold Member" : "Free Member"}
    </span>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function AdminCustomers({ onSessionExpired }) {
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [copied, setCopied] = useState("");

  const [updatingMembershipId, setUpdatingMembershipId] = useState(null);

  const [membershipNotice, setMembershipNotice] = useState("");

  // ========================================
  // SEARCH DELAY
  // ========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // ========================================
  // LOAD CUSTOMERS
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomers() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
          search: debouncedSearch,
        });

        const result = await adminAPI(`/api/admin/customers?${params}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setCustomers(result.customers || []);
        setPagination(result.pagination);
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err.status === 401) {
          onSessionExpired?.();
          return;
        }

        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    const interval = setInterval(loadCustomers, 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [page, debouncedSearch, refreshKey, onSessionExpired]);

  // ========================================
  // REFRESH
  // ========================================

  const refresh = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // ========================================
  // MAKE GOLD / REMOVE GOLD
  // ========================================

  const changeMembership = async (customer) => {
    if (!customer || updatingMembershipId) return;

    const nextTier = customer.membershipTier === "gold" ? "free" : "gold";

    setUpdatingMembershipId(customer.id);

    setMembershipNotice("");
    setError("");
    setDeleteError("");

    try {
      const result = await adminAPI(
        `/api/admin/customers/${customer.id}/membership`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            tier: nextTier,
          }),
        },
      );

      // UPDATE CUSTOMER TABLE

      setCustomers((previous) =>
        previous.map((item) =>
          item.id === customer.id ? result.customer : item,
        ),
      );

      // UPDATE CUSTOMER MODAL

      setSelected((previous) =>
        previous?.id === customer.id ? result.customer : previous,
      );

      setMembershipNotice(result.message);
    } catch (err) {
      if (err.status === 401) {
        onSessionExpired?.();
        return;
      }

      setError(err.message);
      setDeleteError(err.message);
    } finally {
      setUpdatingMembershipId(null);
    }
  };

  // ========================================
  // COPY CUSTOMER ID
  // ========================================

  const copyCustomerId = async (customerId) => {
    try {
      await navigator.clipboard.writeText(customerId);

      setCopied(customerId);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch {
      setError("Unable to copy customer ID.");
    }
  };

  // ========================================
  // VIEW CUSTOMER
  // ========================================

  const viewCustomer = async (customer) => {
    setSelected(customer);

    setConfirmDelete("");
    setDeleteError("");
    setMembershipNotice("");

    setDetailLoading(true);

    try {
      const result = await adminAPI(`/api/admin/customers/${customer.id}`);

      setSelected(result.customer);
    } catch (err) {
      if (err.status === 401) {
        onSessionExpired?.();
        return;
      }

      setDeleteError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // ========================================
  // DELETE CUSTOMER
  // ========================================

  const deleteCustomer = async () => {
    if (!selected || deleting || updatingMembershipId) {
      return;
    }

    if (confirmDelete !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm.');

      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await adminAPI(`/api/admin/customers/${selected.id}`, {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },

        body: JSON.stringify({
          confirmCustomerId: selected.customerId,
        }),
      });

      setSelected(null);
      setConfirmDelete("");
      refresh();
    } catch (err) {
      if (err.status === 401) {
        onSessionExpired?.();
        return;
      }

      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      style={{
        maxWidth: 1500,
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* PAGE HEADER */}

      <div style={{ marginBottom: 30 }}>
        <span
          style={{
            color: colors.blue,
            letterSpacing: 2,
            fontWeight: 800,
            fontSize: 11,
          }}
        >
          FIXHUB ADMIN PANEL
        </span>

        <h1
          style={{
            color: colors.text,
            fontSize: "clamp(28px,5vw,38px)",
            margin: "14px 0 10px",
          }}
        >
          Customers
        </h1>

        <p
          style={{
            color: colors.muted,
            fontSize: 14,
          }}
        >
          Manage FixHub customers and Gold memberships.
        </p>
      </div>

      {/* CUSTOMERS CARD */}

      <section
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 18,
          padding: 25,
        }}
      >
        {/* TOP BAR */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            marginBottom: 25,
          }}
        >
          <h2
            style={{
              color: colors.text,
              fontSize: 23,
              margin: 0,
            }}
          >
            Registered Customers
            <span
              style={{
                color: colors.blue,
                marginLeft: 10,
              }}
            >
              ({pagination?.total ?? 0})
            </span>
          </h2>

          <button
            type="button"
            onClick={refresh}
            style={{
              ...buttonStyle,
              background: colors.blue,
              color: "#fff",
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* SEARCH */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 15px",
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            maxWidth: 580,
            marginBottom: 25,
          }}
        >
          <Search size={19} color={colors.blue} />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search customer ID, name, email or phone..."
            style={{
              width: "100%",
              height: 52,
              border: 0,
              outline: 0,
              background: "transparent",
              color: colors.text,
              fontSize: 14,
            }}
          />
        </div>

        {/* ERROR */}

        {error && (
          <p
            role="alert"
            style={{
              color: "#ef4444",
              marginBottom: 20,
            }}
          >
            {error}
          </p>
        )}

        {/* SUCCESS */}

        {membershipNotice && (
          <p
            role="status"
            style={{
              color: "#16a34a",
              marginBottom: 20,
            }}
          >
            {membershipNotice}
          </p>
        )}

        {/* TABLE */}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1050,
            }}
          >
            <thead>
              <tr>
                {[
                  "Customer ID",
                  "Customer",
                  "Email",
                  "Mobile",
                  "Membership",
                  "Registered",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      ...cellStyle,
                      color: colors.muted,
                      fontWeight: 700,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                    }}
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                    }}
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    {/* CUSTOMER ID */}

                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: colors.blue,
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {customer.customerId}
                        </span>

                        <button
                          type="button"
                          title="Copy Customer ID"
                          onClick={() => copyCustomerId(customer.customerId)}
                          style={{
                            border: 0,
                            background: "transparent",
                            color: colors.blue,
                            cursor: "pointer",
                          }}
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      {copied === customer.customerId && (
                        <small
                          style={{
                            color: "#16a34a",
                          }}
                        >
                          Copied!
                        </small>
                      )}
                    </td>

                    {/* NAME */}

                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <UserRound size={18} color={colors.blue} />

                        {customer.fullName}
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td style={cellStyle}>{customer.email}</td>

                    {/* MOBILE */}

                    <td style={cellStyle}>{customer.phone}</td>

                    {/* MEMBERSHIP */}

                    <td style={cellStyle}>
                      <MembershipBadge tier={customer.membershipTier} />
                    </td>

                    {/* REGISTERED DATE */}

                    <td style={cellStyle}>{formatDate(customer.createdAt)}</td>

                    {/* ACTIONS */}

                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 7,
                        }}
                      >
                        {/* GOLD BUTTON */}

                        <button
                          type="button"
                          disabled={updatingMembershipId !== null}
                          onClick={() => changeMembership(customer)}
                          style={{
                            ...buttonStyle,

                            background:
                              customer.membershipTier === "gold"
                                ? "rgba(245,158,11,.12)"
                                : "linear-gradient(135deg,#d97706,#f0b429)",

                            color:
                              customer.membershipTier === "gold"
                                ? "#a16207"
                                : "#fff",

                            opacity:
                              updatingMembershipId &&
                              updatingMembershipId !== customer.id
                                ? 0.55
                                : 1,
                          }}
                        >
                          <Crown size={16} />

                          {updatingMembershipId === customer.id
                            ? "Saving..."
                            : customer.membershipTier === "gold"
                              ? "Remove Gold"
                              : "Make Gold"}
                        </button>

                        {/* VIEW BUTTON */}

                        <button
                          type="button"
                          onClick={() => viewCustomer(customer)}
                          style={{
                            ...buttonStyle,
                            background: "rgba(0,140,255,.1)",
                            color: colors.blue,
                          }}
                        >
                          <Eye size={16} />
                          View
                        </button>

                        {/* DELETE BUTTON */}

                        <button
                          type="button"
                          onClick={() => viewCustomer(customer)}
                          style={{
                            ...buttonStyle,
                            color: "#ef4444",
                            background: "rgba(239,68,68,.1)",
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        {pagination?.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 15,
              marginTop: 25,
            }}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <span
              style={{
                color: colors.text,
              }}
            >
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* ====================================
          CUSTOMER DETAILS MODAL
      ==================================== */}

      {selected && (
        <div
          role="presentation"
          onClick={() =>
            !deleting && !updatingMembershipId && setSelected(null)
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background: "rgba(0,10,25,.75)",
            overflowY: "auto",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Customer details"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              background: colors.surface,
              borderRadius: 20,
              padding: 28,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <h2
                style={{
                  color: colors.text,
                  fontSize: 24,
                }}
              >
                Customer Details
              </h2>

              <button
                type="button"
                disabled={deleting || updatingMembershipId !== null}
                onClick={() => setSelected(null)}
                style={{
                  border: 0,
                  background: "transparent",
                  color: colors.text,
                  cursor: "pointer",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {detailLoading && (
              <p
                style={{
                  color: colors.muted,
                }}
              >
                Refreshing customer details...
              </p>
            )}

            {/* CUSTOMER ID */}

            <DetailRow
              icon={ShieldCheck}
              label="Customer ID"
              value={selected.customerId}
            />

            <button
              type="button"
              onClick={() => copyCustomerId(selected.customerId)}
              style={{
                ...buttonStyle,
                color: colors.blue,
                marginTop: 10,
              }}
            >
              <Copy size={15} />
              Copy Customer ID
            </button>

            <DetailRow
              icon={UserRound}
              label="Full Name"
              value={selected.fullName}
            />

            <DetailRow
              icon={Mail}
              label="Email Address"
              value={selected.email}
            />

            <DetailRow
              icon={Phone}
              label="Mobile Number"
              value={selected.phone}
            />

            <DetailRow
              icon={MapPin}
              label="Full Home Address"
              value={selected.address}
            />

            {/* GOLD MEMBERSHIP */}

            <DetailRow
              icon={Crown}
              label="Membership"
              value={
                selected.membershipTier === "gold"
                  ? "👑 Gold Member"
                  : "Free Member"
              }
            />

            {selected.membershipTier === "gold" && (
              <DetailRow
                icon={CalendarDays}
                label="Gold Activated"
                value={formatDate(selected.goldActivatedAt)}
              />
            )}

            {/* CHANGE GOLD */}

            <button
              type="button"
              disabled={
                updatingMembershipId !== null || deleting || detailLoading
              }
              onClick={() => changeMembership(selected)}
              style={{
                ...buttonStyle,
                width: "100%",
                margin: "15px 0 7px",
                background: "linear-gradient(135deg,#d97706,#f0b429)",
                color: "#fff",
              }}
            >
              <Crown size={17} />

              {updatingMembershipId === selected.id
                ? "Updating Membership..."
                : selected.membershipTier === "gold"
                  ? "Remove Gold Membership"
                  : "Make This Customer Gold"}
            </button>

            {membershipNotice && (
              <p
                role="status"
                style={{
                  color: "#16a34a",
                  marginTop: 7,
                }}
              >
                {membershipNotice}
              </p>
            )}

            <DetailRow
              icon={CalendarDays}
              label="Registration Date"
              value={formatDate(selected.createdAt)}
            />

            <DetailRow
              icon={CalendarDays}
              label="Last Profile Update"
              value={formatDate(selected.updatedAt)}
            />

            <DetailRow
              icon={ShieldCheck}
              label="Password"
              value="Protected — passwords cannot be viewed."
            />

            {/* =================================
                DELETE CUSTOMER
            ================================= */}

            <div
              style={{
                marginTop: 28,
                padding: 20,
                border: "1px solid rgba(239,68,68,.3)",
                background: "rgba(239,68,68,.06)",
                borderRadius: 14,
              }}
            >
              <h3
                style={{
                  color: "#ef4444",
                  marginBottom: 10,
                }}
              >
                Delete Customer
              </h3>

              <p
                style={{
                  color: colors.muted,
                  fontSize: 13,
                  lineHeight: 1.7,
                  marginBottom: 14,
                }}
              >
                This permanently deletes the customer account. Existing booking
                and membership records stored separately are not automatically
                deleted.
              </p>

              <p
                style={{
                  color: colors.text,
                  fontSize: 13,
                }}
              >
                Type <strong>DELETE</strong> to confirm.
              </p>

              <input
                type="text"
                value={confirmDelete}
                onChange={(event) => setConfirmDelete(event.target.value)}
                placeholder="Type DELETE"
                style={{
                  width: "100%",
                  padding: 13,
                  borderRadius: 9,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.text,
                  marginTop: 10,
                  boxSizing: "border-box",
                }}
              />

              {deleteError && (
                <p
                  role="alert"
                  style={{
                    color: "#ef4444",
                    marginTop: 12,
                  }}
                >
                  {deleteError}
                </p>
              )}

              <button
                type="button"
                disabled={
                  deleting ||
                  detailLoading ||
                  updatingMembershipId !== null ||
                  confirmDelete !== "DELETE"
                }
                onClick={deleteCustomer}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginTop: 16,
                  background: "#ef4444",
                  color: "#fff",
                  opacity: confirmDelete !== "DELETE" ? 0.5 : 1,
                }}
              >
                <Trash2 size={17} />

                {deleting
                  ? "Deleting Customer..."
                  : "Permanently Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

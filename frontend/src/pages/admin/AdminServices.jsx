import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowDownUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Smartphone,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import "../../Admincss/AdminServices.css";

const API_URL = "/api/repair-bookings";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "pending_quote", label: "Pending Quote" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS = {
  pending: "Pending",
  pending_quote: "Pending Quote",
  contacted: "Contacted",
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

async function adminAPI(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const result = await response.json().catch(() => ({
    message: "Invalid server response.",
  }));

  if (!response.ok) {
    const error = new Error(
      result.message || result.error || "Request failed.",
    );

    error.status = response.status;
    throw error;
  }

  return result;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Not specified";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getCustomerName(customer) {
  if (!customer) return "Customer details unavailable";

  if (typeof customer === "string") {
    return "Customer";
  }

  return customer.fullName || customer.name || "Customer";
}

function getCustomerPhone(customer) {
  if (!customer || typeof customer === "string") return "—";

  return customer.phone || "—";
}

function getCustomerEmail(customer) {
  if (!customer || typeof customer === "string") return "—";

  return customer.email || "—";
}

function getStatusClass(status) {
  return String(status || "pending")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "Pending";
}

function getBookingNumber(booking) {
  return booking.bookingId || booking.id || "—";
}

function getIssue(booking) {
  return booking.repairIssue || "Issue not specified";
}

function getDeviceName(booking) {
  return (
    [booking.phoneBrand, booking.phoneModel].filter(Boolean).join(" ") ||
    "Device not specified"
  );
}

function getBookingDate(booking) {
  return booking.preferredDate || "";
}

function getErrorMessage(error) {
  if (error.status === 401 || error.status === 403) {
    return "Admin access denied or session expired. Please check your admin login.";
  }

  return error.message || "Something went wrong.";
}

export default function AdminServices() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  const loadBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await adminAPI(`${API_URL}/admin?limit=100`);

      if (!result.success || !Array.isArray(result.bookings)) {
        throw new Error("The server did not return a valid booking list.");
      }

      setBookings(result.bookings);

      setSelectedBooking((current) => {
        if (!current) return null;

        return (
          result.bookings.find((booking) => booking.id === current.id) || null
        );
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!success) return undefined;

    const timeout = window.setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [success]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const customer = booking.customer;

      const searchable = [
        getBookingNumber(booking),
        getCustomerName(customer),
        getCustomerPhone(customer),
        getCustomerEmail(customer),
        booking.phoneBrand,
        booking.phoneModel,
        booking.repairIssue,
        booking.serviceAddress,
        booking.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [bookings, search, statusFilter, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter((booking) =>
        ["pending", "pending_quote"].includes(booking.status),
      ).length,

      active: bookings.filter((booking) =>
        ["contacted", "confirmed", "scheduled", "in_progress"].includes(
          booking.status,
        ),
      ).length,

      completed: bookings.filter((booking) => booking.status === "completed")
        .length,
    };
  }, [bookings]);

  async function updateStatus(booking, newStatus) {
    if (!booking?.id || !newStatus || newStatus === booking.status) {
      return;
    }

    setUpdatingId(booking.id);
    setError("");
    setSuccess("");

    try {
      const result = await adminAPI(`${API_URL}/admin/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!result.success || !result.booking) {
        throw new Error("The server did not confirm the status update.");
      }

      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? result.booking : item)),
      );

      setSelectedBooking((current) =>
        current?.id === booking.id ? result.booking : current,
      );

      setSuccess(`Booking ${getBookingNumber(booking)} updated successfully.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <main className="admin-services">
      <header className="services-header">
        <div className="services-heading">
          <div className="services-heading-icon">
            <Wrench size={23} />
          </div>

          <div>
            <div className="services-eyebrow">FIXHUB ADMINISTRATION</div>

            <h1>Repair Services</h1>

            <p>
              Manage customer repair requests, appointments and service
              progress.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="services-refresh"
          onClick={() => loadBookings(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "services-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="services-alert services-alert-error" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="services-alert services-alert-success" role="status">
          <CheckCircle2 size={19} />
          <span>{success}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="services-stats">
        <article className="services-stat-card">
          <div className="services-stat-icon stat-blue">
            <Smartphone size={21} />
          </div>

          <div>
            <span>Total Bookings</span>
            <strong>{loading ? "—" : stats.total}</strong>
            <small>Repair applications received</small>
          </div>
        </article>

        <article className="services-stat-card">
          <div className="services-stat-icon stat-orange">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Awaiting Action</span>
            <strong>{loading ? "—" : stats.pending}</strong>
            <small>Pending or awaiting a quote</small>
          </div>
        </article>

        <article className="services-stat-card">
          <div className="services-stat-icon stat-purple">
            <Activity size={21} />
          </div>

          <div>
            <span>Active Repairs</span>
            <strong>{loading ? "—" : stats.active}</strong>
            <small>Contacted, scheduled or in progress</small>
          </div>
        </article>

        <article className="services-stat-card">
          <div className="services-stat-icon stat-green">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{loading ? "—" : stats.completed}</strong>
            <small>Marked completed</small>
          </div>
        </article>
      </section>

      <section className="services-workspace">
        <div className="services-toolbar">
          <div className="services-toolbar-title">
            <h2>Repair Applications</h2>
            <span>{filteredBookings.length} results</span>
          </div>

          <div className="services-controls">
            <label className="services-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search booking, customer, phone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <select
              aria-label="Filter by booking status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="services-sort-button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "newest" ? "oldest" : "newest",
                )
              }
              title={
                sortOrder === "newest"
                  ? "Newest bookings first"
                  : "Oldest bookings first"
              }
            >
              <ArrowDownUp size={17} />
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="services-loading">
            <span className="services-loader" />
            <p>Loading repair applications...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="services-empty">
            <div className="services-empty-icon">
              <Smartphone size={27} />
            </div>

            <h3>
              {bookings.length === 0
                ? "No repair bookings yet"
                : "No matching bookings"}
            </h3>

            <p>
              {bookings.length === 0
                ? "Customer repair applications will appear here when they are submitted."
                : "Try another search term or change your status filter."}
            </p>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                className="services-reset-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="services-table-wrap">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Device & Issue</th>
                    <th>Appointment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className="services-booking-id">
                          {getBookingNumber(booking)}
                        </div>

                        <div className="services-muted">
                          {formatDate(booking.createdAt)}
                        </div>
                      </td>

                      <td>
                        <div className="services-customer-cell">
                          <div className="services-avatar">
                            <UserRound size={18} />
                          </div>

                          <div className="services-cell-content">
                            <strong>{getCustomerName(booking.customer)}</strong>

                            <span>
                              <Phone size={13} />
                              {getCustomerPhone(booking.customer)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="services-device">
                          <Smartphone size={16} />

                          <strong>{getDeviceName(booking)}</strong>
                        </div>

                        <span className="services-issue">
                          {getIssue(booking)}
                        </span>
                      </td>

                      <td>
                        <div className="services-appointment">
                          <CalendarDays size={15} />
                          {formatDate(getBookingDate(booking))}
                        </div>

                        <span className="services-muted">
                          {booking.preferredTime || "Time not selected"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`services-status status-${getStatusClass(
                            booking.status,
                          )}`}
                        >
                          <span className="services-status-dot" />
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="services-view-button"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="services-results-footer">
              Showing {filteredBookings.length} of {bookings.length} loaded
              bookings
            </div>
          </>
        )}
      </section>

      {selectedBooking && (
        <div
          className="services-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBooking(null);
            }
          }}
        >
          <section
            className="services-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="services-modal-title"
          >
            <header className="services-modal-header">
              <div>
                <span className="services-eyebrow">REPAIR APPLICATION</span>
                <h2 id="services-modal-title">
                  {getBookingNumber(selectedBooking)}
                </h2>
              </div>

              <button
                type="button"
                className="services-modal-close"
                aria-label="Close booking details"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={21} />
              </button>
            </header>

            <div className="services-modal-body">
              <div className="services-detail-section">
                <h3>
                  <UserRound size={17} />
                  Customer information
                </h3>

                <div className="services-detail-grid">
                  <Detail
                    label="Customer name"
                    value={getCustomerName(selectedBooking.customer)}
                  />

                  <Detail
                    label="Phone number"
                    value={getCustomerPhone(selectedBooking.customer)}
                  />

                  <Detail
                    label="Email address"
                    value={getCustomerEmail(selectedBooking.customer)}
                  />

                  <Detail
                    label="Booking created"
                    value={formatDateTime(selectedBooking.createdAt)}
                  />
                </div>

                <div className="services-address">
                  <MapPin size={17} />

                  <div>
                    <span>Service address</span>
                    <p>
                      {selectedBooking.serviceAddress || "Address unavailable"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="services-detail-section">
                <h3>
                  <Smartphone size={17} />
                  Device and repair
                </h3>

                <div className="services-detail-grid">
                  <Detail
                    label="Phone brand"
                    value={selectedBooking.phoneBrand}
                  />

                  <Detail
                    label="Phone model"
                    value={selectedBooking.phoneModel}
                  />

                  <Detail
                    label="Repair issue"
                    value={getIssue(selectedBooking)}
                  />

                  <Detail
                    label="Phone MRP"
                    value={formatMoney(selectedBooking.phoneMRP)}
                  />

                  <Detail
                    label="Fixing charge"
                    value={formatMoney(selectedBooking.fixingCharge)}
                  />

                  <Detail
                    label="Preferred date"
                    value={formatDate(selectedBooking.preferredDate)}
                  />

                  <Detail
                    label="Preferred time"
                    value={selectedBooking.preferredTime || "Not specified"}
                  />
                </div>

                <div className="services-notes">
                  <span>Customer's problem description</span>
                  <p>
                    {selectedBooking.notes?.trim() ||
                      "No additional description provided."}
                  </p>
                </div>
              </div>

              <div className="services-detail-section">
                <h3>
                  <Activity size={17} />
                  Repair status
                </h3>

                <label
                  className="services-status-label"
                  htmlFor="repair-status"
                >
                  Update application status
                </label>

                <select
                  id="repair-status"
                  className="services-status-select"
                  value={selectedBooking.status}
                  disabled={updatingId === selectedBooking.id}
                  onChange={(event) =>
                    updateStatus(selectedBooking, event.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}

                  {!STATUS_OPTIONS.some(
                    (status) => status.value === selectedBooking.status,
                  ) && (
                    <option value={selectedBooking.status}>
                      {getStatusLabel(selectedBooking.status)}
                    </option>
                  )}
                </select>

                {updatingId === selectedBooking.id && (
                  <p className="services-update-hint">Saving status...</p>
                )}
              </div>
            </div>

            <footer className="services-modal-footer">
              <span>
                Changes are saved to the booking when the status update
                succeeds.
              </span>

              <button type="button" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div className="services-detail-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

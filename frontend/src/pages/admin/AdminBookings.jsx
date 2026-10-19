import React from "react";

export default function AdminBookings() {
  return (
    <div
      style={{
        padding: "20px",
        color: "var(--fh-admin-text)",
      }}
    >
      <h1>Repair Bookings</h1>

      <p
        style={{
          color: "var(--fh-admin-muted)",
          marginTop: "10px",
        }}
      >
        Manage FixHub customer repair bookings, appointments, technicians and
        repair statuses.
      </p>
    </div>
  );
}

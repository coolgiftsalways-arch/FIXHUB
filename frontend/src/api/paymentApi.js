const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function paymentRequest(basePath, endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${basePath}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Payment request failed. Please try again.",
    );
  }

  return data;
}

// ==========================================
// REPAIR PAYMENTS — EXISTING ENDPOINTS
// ==========================================

const repairPaymentRequest = (endpoint, options) =>
  paymentRequest("/api/payments", endpoint, options);

export function createRepairPayment(bookingId) {
  return repairPaymentRequest("/", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export function submitUpiReference(paymentId, upiReference) {
  return repairPaymentRequest(`/${encodeURIComponent(paymentId)}/submit`, {
    method: "POST",
    body: JSON.stringify({ upiReference }),
  });
}

export function getRepairPayment(paymentId) {
  return repairPaymentRequest(`/${encodeURIComponent(paymentId)}`);
}

export function getMyRepairPayments() {
  return repairPaymentRequest("/my");
}

// ==========================================
// MEMBERSHIP PAYMENTS — NEW ENDPOINTS
// ==========================================

const membershipPaymentRequest = (endpoint, options) =>
  paymentRequest("/api/membership-requests", endpoint, options);

export function createMembershipPayment(requestId) {
  return membershipPaymentRequest("/payment", {
    method: "POST",
    body: JSON.stringify({ requestId }),
  });
}

export function submitMembershipUpiReference(paymentId, upiReference) {
  return membershipPaymentRequest(
    `/payment/${encodeURIComponent(paymentId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ upiReference }),
    },
  );
}

export function getMembershipPayment(paymentId) {
  return membershipPaymentRequest(`/payment/${encodeURIComponent(paymentId)}`);
}

import { Router } from "express";
import mongoose from "mongoose";

import FixHubCustomer from "../models/FixHubCustomer.js";
import Payment from "../models/Payment.js";
import { requireAdmin } from "./authRoutes.js";

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// Customer ID
function getCustomerId(customer) {
  return `FH-${String(customer._id).toUpperCase()}`;
}

// Format customer
function formatCustomer(customer) {
  const membershipTier = customer.membershipTier === "gold" ? "gold" : "free";

  return {
    id: String(customer._id),
    customerId: getCustomerId(customer),
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    membershipTier,
    isGoldMember: membershipTier === "gold",
    goldActivatedAt: customer.goldActivatedAt || null,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

// Parse MongoDB customer ID
function parseCustomerId(value) {
  const raw = String(value || "")
    .trim()
    .replace(/^FH-/i, "");

  if (!/^[0-9a-f]{24}$/i.test(raw)) {
    return null;
  }

  return raw;
}

// Escape search regex
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Start of today in India
function startOfTodayIndia() {
  const offset = 330 * 60 * 1000;
  const now = Date.now();

  return new Date(Math.floor((now + offset) / 86400000) * 86400000 - offset);
}

// Customer fields
const CUSTOMER_FIELDS = [
  "fullName",
  "email",
  "phone",
  "address",
  "membershipTier",
  "goldActivatedAt",
  "createdAt",
  "updatedAt",
].join(" ");

// Pagination
function getPagination(query) {
  const requestedPage = Number.parseInt(query.page, 10);
  const requestedLimit = Number.parseInt(query.limit, 10);

  const page = Math.max(
    1,
    Math.min(10000, Number.isFinite(requestedPage) ? requestedPage : 1),
  );

  const limit = Math.max(
    1,
    Math.min(100, Number.isFinite(requestedLimit) ? requestedLimit : 20),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

// Customer search
function buildCustomerFilter(search) {
  const value = String(search || "")
    .trim()
    .slice(0, 100);

  if (!value) {
    return {};
  }

  const mongoId = parseCustomerId(value);

  if (mongoId) {
    return {
      _id: new mongoose.Types.ObjectId(mongoId),
    };
  }

  const safeSearch = escapeRegex(value);

  return {
    $or: [
      {
        fullName: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        email: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ],
  };
}

// ==========================================
// DASHBOARD SUMMARY
// GET /api/admin/summary
// ==========================================

router.get("/summary", async (req, res) => {
  try {
    const today = startOfTodayIndia();

    const [totalCustomers, newCustomersToday, goldMembers, recentCustomers] =
      await Promise.all([
        FixHubCustomer.countDocuments(),

        FixHubCustomer.countDocuments({
          createdAt: { $gte: today },
        }),

        FixHubCustomer.countDocuments({
          membershipTier: "gold",
        }),

        FixHubCustomer.find({})
          .select(CUSTOMER_FIELDS)
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return res.json({
      success: true,
      summary: {
        totalCustomers,
        newCustomersToday,
        goldMembers,
      },
      recentCustomers: recentCustomers.map(formatCustomer),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard.",
    });
  }
});

// ==========================================
// GET ALL CUSTOMERS
// GET /api/admin/customers
// ==========================================

router.get("/customers", async (req, res) => {
  try {
    const filter = buildCustomerFilter(req.query.search);
    const { page, limit, skip } = getPagination(req.query);

    const [customers, total] = await Promise.all([
      FixHubCustomer.find(filter)
        .select(CUSTOMER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      FixHubCustomer.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      customers: customers.map(formatCustomer),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customers.",
    });
  }
});

// ==========================================
// GET SINGLE CUSTOMER
// GET /api/admin/customers/:customerId
// ==========================================

router.get("/customers/:customerId", async (req, res) => {
  try {
    const mongoId = parseCustomerId(req.params.customerId);

    if (!mongoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const customer = await FixHubCustomer.findById(mongoId)
      .select(CUSTOMER_FIELDS)
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.json({
      success: true,
      customer: formatCustomer(customer),
    });
  } catch (error) {
    console.error("Customer details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load customer details.",
    });
  }
});

// ==========================================
// ACTIVATE OR REMOVE GOLD MEMBERSHIP
// PATCH /api/admin/customers/:customerId/membership
// ==========================================

router.patch("/customers/:customerId/membership", async (req, res) => {
  try {
    const mongoId = parseCustomerId(req.params.customerId);

    if (!mongoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const tier = req.body?.tier;

    if (tier !== "gold" && tier !== "free") {
      return res.status(400).json({
        success: false,
        message: 'Membership must be "gold" or "free".',
      });
    }

    const customer = await FixHubCustomer.findById(mongoId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (tier === "gold" && customer.membershipTier !== "gold") {
      customer.goldActivatedAt = new Date();
    }

    if (tier === "free") {
      customer.goldActivatedAt = null;
    }

    customer.membershipTier = tier;

    await customer.save();

    return res.json({
      success: true,
      message:
        tier === "gold"
          ? "Gold membership activated successfully."
          : "Gold membership removed successfully.",
      customer: formatCustomer(customer),
    });
  } catch (error) {
    console.error("Membership update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update customer membership.",
    });
  }
});

// ==========================================
// DELETE CUSTOMER
// DELETE /api/admin/customers/:customerId
// ==========================================

router.delete("/customers/:customerId", async (req, res) => {
  try {
    const mongoId = parseCustomerId(req.params.customerId);

    if (!mongoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    if (req.get("X-Requested-With") !== "XMLHttpRequest") {
      return res.status(403).json({
        success: false,
        message: "Invalid deletion request.",
      });
    }

    const expectedId = `FH-${mongoId.toUpperCase()}`;

    if (req.body?.confirmCustomerId !== expectedId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID confirmation does not match.",
      });
    }

    const customer = await FixHubCustomer.findByIdAndDelete(mongoId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or already deleted.",
      });
    }

    return res.json({
      success: true,
      message: "Customer deleted successfully.",
      deletedCustomerId: expectedId,
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete customer.",
    });
  }
});

// ==========================================
// GET MEMBERSHIPS
// GET /api/admin/memberships
// ==========================================

router.get("/memberships", async (req, res) => {
  try {
    const filter = buildCustomerFilter(req.query.search);
    const { page, limit, skip } = getPagination(req.query);

    const goldFilter = {
      $and: [filter, { membershipTier: "gold" }],
    };

    const freeFilter = {
      $and: [
        filter,
        {
          $or: [
            { membershipTier: "free" },
            { membershipTier: { $exists: false } },
            { membershipTier: null },
          ],
        },
      ],
    };

    const [customers, total, goldMembers, freeMembers] = await Promise.all([
      FixHubCustomer.find(filter)
        .select(CUSTOMER_FIELDS)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      FixHubCustomer.countDocuments(filter),
      FixHubCustomer.countDocuments(goldFilter),
      FixHubCustomer.countDocuments(freeFilter),
    ]);

    const formattedCustomers = customers.map(formatCustomer);

    return res.json({
      success: true,
      memberships: formattedCustomers,
      customers: formattedCustomers,
      summary: {
        totalCustomers: total,
        goldMembers,
        freeMembers,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get memberships error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load memberships.",
    });
  }
});

export default router;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ShieldAlert, Users, Grid, Eye, Trash2, Check, X as CloseIcon, AlertTriangle, MessageSquare, FileText, Gift, Star, Edit, ToggleLeft, ToggleRight, Plus, GraduationCap, Upload } from "lucide-react";
import api from "../api/axios";
import "./AdminDashboard.css";
export const AdminDashboard = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [subStatus, setSubStatus] = useState("approved");
  const [modSubTab, setModSubTab] = useState("listings");
  const [giftSubTab, setGiftSubTab] = useState("products");
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reportedChats, setReportedChats] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewIdUrl, setPreviewIdUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("Image Preview");
  const [giftProducts, setGiftProducts] = useState([]);
  const [giftCategories, setGiftCategories] = useState([]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [showGiftProductModal, setShowGiftProductModal] = useState(false);
  const [editingGiftProduct, setEditingGiftProduct] = useState(null);
  const [giftProductForm, setGiftProductForm] = useState({
    title: "",
    description: "",
    category: "",
    basePrice: "",
    mrpPrice: "",
    features: [""],
    badge: "",
    isFeatured: false,
    sizeOptions: []
  });
  const [giftProductPhotoItems, setGiftProductPhotoItems] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [collegeDeptSubTab, setCollegeDeptSubTab] = useState("colleges");
  const [newCollegeName, setNewCollegeName] = useState("");
  const [editingCollege, setEditingCollege] = useState(null);
  const [editCollegeName, setEditCollegeName] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState("");
  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get("/admin/users");
      const listingsRes = await api.get("/admin/listings");
      const chatsRes = await api.get("/admin/chats");
      const feedbackRes = await api.get("/feedback");
      setUsers(usersRes.data);
      setListings(listingsRes.data);
      setReportedChats(chatsRes.data);
      setFeedbackList(feedbackRes.data);
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      showToast("Failed to fetch admin data.", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchGiftData = async () => {
    setGiftLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/gift/products?showAll=true"),
        api.get("/gift/categories")
      ]);
      setGiftProducts(productsRes.data);
      setGiftCategories(categoriesRes.data);
    } catch (err) {
      console.error("Error fetching gift data:", err);
    } finally {
      setGiftLoading(false);
    }
  };
  const fetchCollegesAndDepartments = async () => {
    try {
      const [collegesRes, deptsRes] = await Promise.all([
        api.get("/colleges?showAll=true"),
        api.get("/departments?showAll=true")
      ]);
      setColleges(collegesRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Error fetching colleges/departments:", err);
    }
  };
  useEffect(() => {
    fetchData();
    fetchGiftData();
    fetchCollegesAndDepartments();
  }, []);
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/approve`);
      showToast("Student verified successfully!", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to approve student", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/reject`);
      showToast("Student verification rejected.", "info");
      fetchData();
    } catch (err) {
      showToast("Failed to reject student", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/listings/${id}`);
      showToast("Listing removed successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to remove listing", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDismissReports = async (id) => {
    if (!window.confirm("Are you sure you want to dismiss all reports for this listing?")) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/listings/${id}/dismiss-reports`);
      showToast("All reports dismissed successfully!", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to dismiss reports", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDismissChatReports = async (id) => {
    if (!window.confirm("Are you sure you want to dismiss all reports for this chat?")) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/chats/${id}/dismiss-reports`);
      showToast("All reports on this conversation dismissed successfully!", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to dismiss chat reports", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback/feature request?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/feedback/${id}`);
      showToast("Feedback deleted successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to delete feedback", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const handleUpdateFeedbackStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/feedback/${id}/status`, { status });
      showToast(`Feedback marked as ${status} successfully!`, "success");
      fetchData();
    } catch (err) {
      showToast("Failed to update feedback status", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const pendingCount = users.filter((u) => u.verificationStatus === "pending").length;
  const approvedCount = users.filter((u) => u.verificationStatus === "approved").length;
  const rejectedCount = users.filter((u) => u.verificationStatus === "rejected").length;
  const totalListings = listings.length;
  return /* @__PURE__ */ React.createElement("div", { className: "admin-dashboard-container" }, /* @__PURE__ */ React.createElement("div", { className: "admin-title-bar" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "admin-title" }, /* @__PURE__ */ React.createElement(ShieldCheck, { style: { width: "28px", height: "28px", color: "#f43f5e" } }), "Admin Dashboard"), /* @__PURE__ */ React.createElement("p", { className: "admin-subtitle" }, "Verify students and manage marketplace listings")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/vendors/print-dashboard"),
      className: "admin-print-btn"
    },
    /* @__PURE__ */ React.createElement(FileText, { style: { width: "16px", height: "16px" } }),
    "Print Shop Dashboard"
  )), /* @__PURE__ */ React.createElement("div", { className: "admin-stats-grid" }, /* @__PURE__ */ React.createElement("div", { className: "admin-stat-card emerald" }, /* @__PURE__ */ React.createElement("div", { className: "admin-stat-icon-box emerald" }, /* @__PURE__ */ React.createElement(Users, { style: { width: "20px", height: "20px" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "admin-stat-value" }, approvedCount), /* @__PURE__ */ React.createElement("p", { className: "admin-stat-label" }, "Active Users"))), /* @__PURE__ */ React.createElement("div", { className: "admin-stat-card purple" }, /* @__PURE__ */ React.createElement("div", { className: "admin-stat-icon-box purple" }, /* @__PURE__ */ React.createElement(Grid, { style: { width: "20px", height: "20px" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "admin-stat-value" }, totalListings), /* @__PURE__ */ React.createElement("p", { className: "admin-stat-label" }, "Total Listings"))), /* @__PURE__ */ React.createElement("div", { className: "admin-stat-card amber" }, /* @__PURE__ */ React.createElement("div", { className: "admin-stat-icon-box amber" }, /* @__PURE__ */ React.createElement(ShieldAlert, { style: { width: "20px", height: "20px" }, className: "animate-pulse" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "admin-stat-value" }, pendingCount), /* @__PURE__ */ React.createElement("p", { className: "admin-stat-label" }, "Pending Approvals"))), /* @__PURE__ */ React.createElement("div", { className: "admin-stat-card rose" }, /* @__PURE__ */ React.createElement("div", { className: "admin-stat-icon-box rose" }, /* @__PURE__ */ React.createElement(AlertTriangle, { style: { width: "20px", height: "20px" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "admin-stat-value" }, listings.filter((l) => l.reports && l.reports.length > 0).length + reportedChats.length), /* @__PURE__ */ React.createElement("p", { className: "admin-stat-label" }, "Reported Issues")))), /* @__PURE__ */ React.createElement("div", { className: "admin-tabs-wrapper" }, /* @__PURE__ */ React.createElement("div", { className: "admin-tab-bar" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("pending"),
      className: `admin-tab-btn ${activeTab === "pending" ? "active" : ""}`
    },
    /* @__PURE__ */ React.createElement(ShieldAlert, { style: { width: "16px", height: "16px" } }),
    " Pending Approvals (",
    pendingCount,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("students"),
      className: `admin-tab-btn ${activeTab === "students" ? "active" : ""}`
    },
    /* @__PURE__ */ React.createElement(Users, { style: { width: "16px", height: "16px" } }),
    " All Students"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("listings"),
      className: `admin-tab-btn ${activeTab === "listings" ? "active" : ""}`
    },
    /* @__PURE__ */ React.createElement(Grid, { style: { width: "16px", height: "16px" } }),
    " Marketplace Listings (",
    totalListings,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("reported"),
      className: `admin-tab-btn ${activeTab === "reported" ? "active-rose" : ""}`
    },
    /* @__PURE__ */ React.createElement(AlertTriangle, { style: { width: "16px", height: "16px" }, className: listings.filter((l) => l.reports && l.reports.length > 0).length > 0 || reportedChats.length > 0 ? "animate-pulse" : "" }),
    " Moderation Log (",
    listings.filter((l) => l.reports && l.reports.length > 0).length + reportedChats.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("feedback"),
      className: `admin-tab-btn ${activeTab === "feedback" ? "active-indigo" : ""}`
    },
    /* @__PURE__ */ React.createElement(MessageSquare, { style: { width: "16px", height: "16px" } }),
    " Feedback Logs (",
    feedbackList.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("gift-studio"),
      className: `px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === "gift-studio" ? "bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]" : "text-[#6B7280] hover:text-[#111827] border border-transparent"}`
    },
    /* @__PURE__ */ React.createElement(Gift, { className: "w-4 h-4" }),
    " Gift Studio (",
    giftProducts.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("college-dept"),
      className: `px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${activeTab === "college-dept" ? "bg-white text-[#6C4EFF] shadow-sm border border-[#E9E6F8]" : "text-[#6B7280] hover:text-[#111827] border border-transparent"}`
    },
    /* @__PURE__ */ React.createElement(GraduationCap, { className: "w-4 h-4" }),
    " Colleges & Departments (",
    colleges.length + departments.length,
    ")"
  )), loading ? /* @__PURE__ */ React.createElement("div", { className: "admin-loading" }, /* @__PURE__ */ React.createElement("div", { className: "admin-spinner animate-spin" })) : /* @__PURE__ */ React.createElement("div", { className: "admin-content-panel animate-fadeIn" }, activeTab === "pending" && /* @__PURE__ */ React.createElement("div", { className: "admin-table-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "admin-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "admin-table-header" }, /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Reg Number"), /* @__PURE__ */ React.createElement("th", null, "Department / Year"), /* @__PURE__ */ React.createElement("th", null, "ID Card"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "admin-table-body" }, users.filter((u) => u.verificationStatus === "pending").length > 0 ? users.filter((u) => u.verificationStatus === "pending").map((st) => /* @__PURE__ */ React.createElement("tr", { key: st._id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("p", { className: "admin-cell-name" }, st.fullName), /* @__PURE__ */ React.createElement("p", { className: "admin-cell-email" }, st.email)), /* @__PURE__ */ React.createElement("td", { className: "admin-cell-mono" }, st.registrationNumber), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-cell-dept" }, st.department), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "4px" } }, st.year === "1st Year" ? /* @__PURE__ */ React.createElement("span", { className: "admin-cell-year-badge", title: "First year students don't have ID cards yet. Fee receipt or Allotment letter is accepted." }, st.year, " (Receipt Allowed)") : /* @__PURE__ */ React.createElement("span", { className: "admin-cell-year-text" }, st.year))), /* @__PURE__ */ React.createElement("td", null, st.idCardImageUrl ? /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => {
        setPreviewIdUrl(st.idCardImageUrl);
        setPreviewTitle(`${st.fullName} ID Card Preview`);
      },
      className: "admin-id-thumb",
      title: "Click to view ID card"
    },
    /* @__PURE__ */ React.createElement("img", { src: st.idCardImageUrl, alt: "ID Card" })
  ) : /* @__PURE__ */ React.createElement("span", { className: "admin-no-image" }, "No Image")), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement("div", { className: "admin-action-group" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleApprove(st._id),
      disabled: actionLoading,
      className: "admin-action-btn approve",
      title: "Approve Student"
    },
    /* @__PURE__ */ React.createElement(Check, { style: { width: "16px", height: "16px", strokeWidth: 2.5 } })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleReject(st._id),
      disabled: actionLoading,
      className: "admin-action-btn reject",
      title: "Reject Student"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { style: { width: "16px", height: "16px", strokeWidth: 2.5 } })
  ))))) : /* @__PURE__ */ React.createElement("tr", { className: "admin-empty-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "5" }, "No pending verifications. All caught up!"))))), activeTab === "students" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "admin-sub-tab-bar" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSubStatus("approved"),
      className: `admin-sub-tab-btn ${subStatus === "approved" ? "active" : ""}`
    },
    "Approved Verified Students (",
    approvedCount,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSubStatus("rejected"),
      className: `admin-sub-tab-btn ${subStatus === "rejected" ? "active" : ""}`
    },
    "Rejected Students (",
    rejectedCount,
    ")"
  )), /* @__PURE__ */ React.createElement("div", { className: "admin-table-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "admin-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "admin-table-header" }, /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Reg Number"), /* @__PURE__ */ React.createElement("th", null, "Department / Year"), /* @__PURE__ */ React.createElement("th", null, "ID Card"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Status Action"))), /* @__PURE__ */ React.createElement("tbody", { className: "admin-table-body" }, users.filter((u) => u.verificationStatus === subStatus).length > 0 ? users.filter((u) => u.verificationStatus === subStatus).map((st) => /* @__PURE__ */ React.createElement("tr", { key: st._id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("p", { className: "admin-cell-name" }, st.fullName), /* @__PURE__ */ React.createElement("p", { className: "admin-cell-email" }, st.email)), /* @__PURE__ */ React.createElement("td", { className: "admin-cell-mono" }, st.registrationNumber), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-cell-dept" }, st.department), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "4px" } }, st.year === "1st Year" ? /* @__PURE__ */ React.createElement("span", { className: "admin-cell-year-badge", title: "First year students don't have ID cards yet. Fee receipt or Allotment letter is accepted." }, st.year, " (Receipt Allowed)") : /* @__PURE__ */ React.createElement("span", { className: "admin-cell-year-text" }, st.year))), /* @__PURE__ */ React.createElement("td", null, st.idCardImageUrl ? /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => {
        setPreviewIdUrl(st.idCardImageUrl);
        setPreviewTitle(`${st.fullName} ID Card Preview`);
      },
      className: "admin-id-thumb",
      title: "Click to view ID card"
    },
    /* @__PURE__ */ React.createElement("img", { src: st.idCardImageUrl, alt: "ID Card" })
  ) : /* @__PURE__ */ React.createElement("span", { className: "admin-no-image" }, "No Image")), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, subStatus === "approved" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleReject(st._id),
      disabled: actionLoading,
      className: "admin-text-action-btn reject"
    },
    "Reject / Block"
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleApprove(st._id),
      disabled: actionLoading,
      className: "admin-text-action-btn approve"
    },
    "Approve / Unblock"
  )))) : /* @__PURE__ */ React.createElement("tr", { className: "admin-empty-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "5" }, "No students in this list.")))))), activeTab === "listings" && /* @__PURE__ */ React.createElement("div", { className: "admin-table-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "admin-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "admin-table-header" }, /* @__PURE__ */ React.createElement("th", null, "Product Info"), /* @__PURE__ */ React.createElement("th", null, "Seller details"), /* @__PURE__ */ React.createElement("th", null, "Market / Type"), /* @__PURE__ */ React.createElement("th", null, "Price"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Action"))), /* @__PURE__ */ React.createElement("tbody", { className: "admin-table-body" }, listings.length > 0 ? listings.map((lst) => /* @__PURE__ */ React.createElement("tr", { key: lst._id, className: lst.reports && lst.reports.length > 0 ? "flagged" : "" }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-product-info" }, lst.images && lst.images.length > 0 ? /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => {
        setPreviewIdUrl(lst.images[0]);
        setPreviewTitle("Listing Image Preview");
      },
      className: "admin-id-thumb",
      title: "Click to preview image"
    },
    /* @__PURE__ */ React.createElement("img", { src: lst.images[0], alt: "" })
  ) : /* @__PURE__ */ React.createElement("div", { className: "admin-id-thumb", style: { backgroundColor: "#f8fafc", cursor: "default" } }, /* @__PURE__ */ React.createElement("span", { className: "admin-no-image" }, "No Img")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "admin-product-title-row" }, /* @__PURE__ */ React.createElement("p", { className: "admin-product-title" }, lst.title), lst.reports && lst.reports.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "admin-badge flagged animate-pulse" }, /* @__PURE__ */ React.createElement(AlertTriangle, { style: { width: "10px", height: "10px" } }), " Flagged")), /* @__PURE__ */ React.createElement("p", { className: "admin-product-desc" }, lst.description)))), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("p", { className: "admin-cell-name" }, lst.seller?.fullName || "Anonymous"), /* @__PURE__ */ React.createElement("p", { className: "admin-cell-email" }, lst.sellerCollege)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-listing-type-col" }, /* @__PURE__ */ React.createElement("span", { className: "admin-badge market-type" }, lst.marketType), /* @__PURE__ */ React.createElement("span", { className: "admin-badge listing-type" }, lst.listingType))), /* @__PURE__ */ React.createElement("td", { className: "admin-cell-bold" }, lst.listingType === "donate" ? "Free" : `\u20B9${lst.price}`), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDeleteListing(lst._id),
      disabled: actionLoading,
      className: "admin-action-btn delete",
      title: "Delete Listing"
    },
    /* @__PURE__ */ React.createElement(Trash2, { style: { width: "16px", height: "16px" } })
  )))) : /* @__PURE__ */ React.createElement("tr", { className: "admin-empty-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "5" }, "No listings in the marketplace."))))), activeTab === "reported" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "admin-sub-tab-bar" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setModSubTab("listings"),
      className: `admin-sub-tab-btn ${modSubTab === "listings" ? "active" : ""}`
    },
    "Reported Listings (",
    listings.filter((l) => l.reports && l.reports.length > 0).length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setModSubTab("chats"),
      className: `admin-sub-tab-btn ${modSubTab === "chats" ? "active" : ""}`
    },
    "Reported Chats (",
    reportedChats.length,
    ")"
  )), modSubTab === "listings" ? /* @__PURE__ */ React.createElement("div", { className: "admin-table-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "admin-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "admin-table-header" }, /* @__PURE__ */ React.createElement("th", null, "Product Info"), /* @__PURE__ */ React.createElement("th", null, "Seller Details"), /* @__PURE__ */ React.createElement("th", null, "Reports & Reasons"), /* @__PURE__ */ React.createElement("th", null, "Status / Price"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "admin-table-body" }, listings.filter((l) => l.reports && l.reports.length > 0).length > 0 ? listings.filter((l) => l.reports && l.reports.length > 0).map((lst) => /* @__PURE__ */ React.createElement("tr", { key: lst._id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-product-info" }, lst.images && lst.images.length > 0 ? /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => {
        setPreviewIdUrl(lst.images[0]);
        setPreviewTitle("Listing Image Preview");
      },
      className: "admin-id-thumb",
      title: "Click to preview image"
    },
    /* @__PURE__ */ React.createElement("img", { src: lst.images[0], alt: "" })
  ) : /* @__PURE__ */ React.createElement("div", { className: "admin-id-thumb", style: { backgroundColor: "#f8fafc", cursor: "default" } }, /* @__PURE__ */ React.createElement("span", { className: "admin-no-image" }, "No Img")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "admin-product-title" }, lst.title), /* @__PURE__ */ React.createElement("p", { className: "admin-product-desc" }, lst.description)))), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("p", { className: "admin-cell-name" }, lst.seller?.fullName || "Anonymous"), /* @__PURE__ */ React.createElement("p", { className: "admin-cell-email" }, lst.sellerCollege)), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "admin-report-col" }, /* @__PURE__ */ React.createElement("span", { className: "admin-report-count-badge" }, /* @__PURE__ */ React.createElement(AlertTriangle, { style: { width: "14px", height: "14px" }, className: "animate-pulse" }), " ", lst.reports.length, " report(s)"), /* @__PURE__ */ React.createElement("div", { className: "admin-report-list" }, lst.reports.map((r, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: "admin-report-item" }, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, r.reporter?.fullName || "Student", ":"), " ", r.reason))))), /* @__PURE__ */ React.createElement("td", { className: "admin-cell-bold" }, /* @__PURE__ */ React.createElement("div", { className: "admin-status-col" }, /* @__PURE__ */ React.createElement("span", { className: `admin-badge ${lst.status === "removed" ? "status-removed" : "status-active"}` }, lst.status === "removed" ? "Auto-Hidden" : lst.status), /* @__PURE__ */ React.createElement("span", null, lst.listingType === "donate" ? "Free" : `\u20B9${lst.price}`))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-action-group", style: { justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDismissReports(lst._id),
      disabled: actionLoading,
      className: "admin-action-btn approve",
      title: "Dismiss Reports & Restore"
    },
    /* @__PURE__ */ React.createElement(Check, { style: { width: "16px", height: "16px" } })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDeleteListing(lst._id),
      disabled: actionLoading,
      className: "admin-action-btn delete",
      title: "Delete Listing Permanently"
    },
    /* @__PURE__ */ React.createElement(Trash2, { style: { width: "16px", height: "16px" } })
  ))))) : /* @__PURE__ */ React.createElement("tr", { className: "admin-empty-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "5" }, "No reported listings found."))))) : /* @__PURE__ */ React.createElement("div", { className: "admin-table-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "admin-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "admin-table-header" }, /* @__PURE__ */ React.createElement("th", null, "Chat Context"), /* @__PURE__ */ React.createElement("th", null, "Buyer (Reporter)"), /* @__PURE__ */ React.createElement("th", null, "Seller (Recipient)"), /* @__PURE__ */ React.createElement("th", null, "Report Reason(s)"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "admin-table-body" }, reportedChats.length > 0 ? reportedChats.map((chat) => /* @__PURE__ */ React.createElement("tr", { key: chat._id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-chat-context" }, /* @__PURE__ */ React.createElement("span", { className: "admin-chat-title" }, chat.listing?.title || "General Chat"), chat.listing?.price !== void 0 && /* @__PURE__ */ React.createElement("span", { className: "admin-chat-price" }, chat.listing.price === 0 ? "Free/Donate" : `\u20B9${chat.listing.price}`))), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("p", { className: "admin-cell-name" }, chat.buyer?.fullName || "Anonymous"), /* @__PURE__ */ React.createElement("p", { className: "admin-cell-email" }, chat.buyer?.email), chat.buyer && chat.buyer.verificationStatus !== "rejected" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleReject(chat.buyer._id),
      disabled: actionLoading,
      className: "admin-block-link"
    },
    "Reject / Block Buyer"
  )), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px", fontWeight: 500 } }, /* @__PURE__ */ React.createElement("p", { className: "admin-cell-name" }, chat.seller?.fullName || "Anonymous"), /* @__PURE__ */ React.createElement("p", { className: "admin-cell-email" }, chat.seller?.email), chat.seller && chat.seller.verificationStatus !== "rejected" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleReject(chat.seller._id),
      disabled: actionLoading,
      className: "admin-block-link"
    },
    "Reject / Block Seller"
  )), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "admin-report-col" }, /* @__PURE__ */ React.createElement("span", { className: "admin-report-count-badge" }, /* @__PURE__ */ React.createElement(AlertTriangle, { style: { width: "14px", height: "14px" }, className: "animate-pulse" }), " ", chat.reports.length, " report(s)"), /* @__PURE__ */ React.createElement("div", { className: "admin-report-list" }, chat.reports.map((r, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: "admin-report-item" }, "\u2022 ", /* @__PURE__ */ React.createElement("strong", null, r.reporter?.fullName || "Student", ":"), " ", r.reason))))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "admin-action-group", style: { justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDismissChatReports(chat._id),
      disabled: actionLoading,
      className: "admin-action-btn approve",
      title: "Dismiss Chat Reports"
    },
    /* @__PURE__ */ React.createElement(Check, { style: { width: "16px", height: "16px", strokeWidth: 2.5 } })
  ))))) : /* @__PURE__ */ React.createElement("tr", { className: "admin-empty-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "5" }, "No reported conversations.")))))), activeTab === "feedback" && /* @__PURE__ */ React.createElement("div", { className: "admin-table-scroll animate-fadeIn", style: { textAlign: "left" } }, /* @__PURE__ */ React.createElement("table", { className: "admin-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "admin-table-header" }, /* @__PURE__ */ React.createElement("th", null, "Student"), /* @__PURE__ */ React.createElement("th", null, "Feedback / Issue"), /* @__PURE__ */ React.createElement("th", null, "Category"), /* @__PURE__ */ React.createElement("th", null, "Votes"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", { className: "text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "admin-table-body" }, feedbackList.length > 0 ? feedbackList.map((item) => /* @__PURE__ */ React.createElement("tr", { key: item._id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("p", { className: "admin-feedback-user" }, item.user?.fullName || "Student"), /* @__PURE__ */ React.createElement("p", { className: "admin-feedback-user-dept" }, item.user?.department, " \u2022 ", item.user?.year, " yr")), /* @__PURE__ */ React.createElement("td", { style: { maxWidth: "280px" } }, /* @__PURE__ */ React.createElement("p", { className: "admin-feedback-title" }, item.title), /* @__PURE__ */ React.createElement("p", { className: "admin-feedback-desc" }, item.description)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `admin-badge ${item.category === "feature" ? "cat-feature" : item.category === "bug" ? "cat-bug" : "cat-other"}` }, item.category)), /* @__PURE__ */ React.createElement("td", { className: "admin-feedback-votes" }, "\u2B50 ", item.upvotes?.length || 0, " upvotes"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: item.status,
      onChange: (e) => handleUpdateFeedbackStatus(item._id, e.target.value),
      className: "admin-feedback-select"
    },
    /* @__PURE__ */ React.createElement("option", { value: "pending" }, "Review Pending"),
    /* @__PURE__ */ React.createElement("option", { value: "reviewing" }, "In Review"),
    /* @__PURE__ */ React.createElement("option", { value: "planned" }, "Planned"),
    /* @__PURE__ */ React.createElement("option", { value: "completed" }, "Completed"),
    /* @__PURE__ */ React.createElement("option", { value: "dismissed" }, "Dismissed")
  )), /* @__PURE__ */ React.createElement("td", { className: "text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDeleteFeedback(item._id),
      className: "admin-action-btn delete",
      title: "Delete Feedback",
      style: { margin: "0 auto" }
    },
    /* @__PURE__ */ React.createElement(Trash2, { style: { width: "14px", height: "14px" } })
  )))) : /* @__PURE__ */ React.createElement("tr", { className: "admin-empty-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: "6" }, "No feedback submitted by students yet."))))), activeTab === "gift-studio" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex border-b border-[#E9E6F8] bg-[#FAFAFF] px-6 py-3 gap-4 text-xs font-bold" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setGiftSubTab("products"),
      className: `px-3 py-1.5 rounded-full transition-all ${giftSubTab === "products" ? "bg-[#111827] text-white" : "text-[#6B7280] hover:bg-slate-200/50"}`
    },
    "Products (",
    giftProducts.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setGiftSubTab("categories"),
      className: `px-3 py-1.5 rounded-full transition-all ${giftSubTab === "categories" ? "bg-[#111827] text-white" : "text-[#6B7280] hover:bg-slate-200/50"}`
    },
    "Categories (",
    giftCategories.length,
    ")"
  )), giftSubTab === "products" ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 flex justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingGiftProduct(null);
        setGiftProductForm({ title: "", description: "", category: "", basePrice: "", mrpPrice: "", features: [""], badge: "", isFeatured: false, sizeOptions: [] });
        setGiftProductPhotoItems([]);
        setShowGiftProductModal(true);
      },
      className: "h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " Add Product"
  )), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4" }, "Product"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4" }, "Category"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4" }, "Price"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Featured"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Active"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-[#E9E6F8] text-sm text-[#111827]" }, giftProducts.length > 0 ? giftProducts.map((gp) => /* @__PURE__ */ React.createElement("tr", { key: gp._id, className: `transition-colors ${!gp.isActive ? "opacity-50" : ""} hover:bg-[#FAFAFF]/50` }, /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => {
        setPreviewIdUrl(gp.images?.[0]);
        setPreviewTitle("Product Image Preview");
      },
      className: "w-12 h-12 rounded-lg bg-slate-100 border border-[#E9E6F8] overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
    },
    gp.images?.[0] ? /* @__PURE__ */ React.createElement("img", { src: gp.images[0], alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center text-xs text-gray-400" }, "No Img")
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-[#111827]" }, gp.title), gp.badge && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5" }, /* @__PURE__ */ React.createElement(Star, { className: "w-2.5 h-2.5" }), " ", gp.badge)))), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4 text-xs font-medium" }, gp.category), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-black" }, "\u20B9", gp.basePrice), gp.mrpPrice > gp.basePrice && /* @__PURE__ */ React.createElement("span", { className: "ml-1.5 text-xs text-[#9CA3AF] line-through" }, "\u20B9", gp.mrpPrice)), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4 text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          await api.post(`/gift/products/${gp._id}/toggle-featured`);
          fetchGiftData();
        } catch {
          showToast("Failed to toggle featured", "error");
        }
      },
      className: "mx-auto",
      title: gp.isFeatured ? "Unfeature" : "Feature"
    },
    gp.isFeatured ? /* @__PURE__ */ React.createElement(ToggleRight, { className: "w-6 h-6 text-[#6C4EFF]" }) : /* @__PURE__ */ React.createElement(ToggleLeft, { className: "w-6 h-6 text-[#9CA3AF]" })
  )), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4 text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          await api.put(`/gift/products/${gp._id}`, { isActive: !gp.isActive });
          fetchGiftData();
          showToast(`Product ${gp.isActive ? "deactivated" : "activated"}`, "success");
        } catch {
          showToast("Failed to toggle active", "error");
        }
      },
      className: "mx-auto",
      title: gp.isActive ? "Deactivate" : "Activate"
    },
    gp.isActive ? /* @__PURE__ */ React.createElement(ToggleRight, { className: "w-6 h-6 text-emerald-500" }) : /* @__PURE__ */ React.createElement(ToggleLeft, { className: "w-6 h-6 text-[#9CA3AF]" })
  )), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingGiftProduct(gp);
        setGiftProductForm({
          title: gp.title,
          description: gp.description,
          category: gp.category,
          basePrice: gp.basePrice,
          mrpPrice: gp.mrpPrice ?? "",
          features: gp.features?.length ? gp.features : [""],
          badge: gp.badge || "",
          isFeatured: gp.isFeatured,
          sizeOptions: gp.sizeOptions || []
        });
        const existingItems = (gp.images || []).map((imgUrl, idx) => ({
          id: `existing-${idx}-${Date.now()}`,
          type: "existing",
          url: imgUrl
        }));
        setGiftProductPhotoItems(existingItems);
        setShowGiftProductModal(true);
      },
      className: "w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors",
      title: "Edit Product"
    },
    /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        const confirmed = window.confirm(
          `Permanently delete "${gp.title}"? This cannot be undone. If you just want to hide it from customers, use the Active toggle instead.`
        );
        if (!confirmed) return;
        try {
          await api.delete(`/gift/products/${gp._id}?hard=true`);
          showToast("Product permanently deleted", "success");
          fetchGiftData();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to delete product", "error");
        }
      },
      className: "w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors",
      title: "Delete Product"
    },
    /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
  ))))) : /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "6", className: "px-6 py-12 text-center text-[#6B7280]" }, 'No gift products yet. Click "Add Product" to create one.')))))) : (
    /* Categories sub-tab */
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: newCategoryName,
        onChange: (e) => setNewCategoryName(e.target.value),
        placeholder: "New category name...",
        className: "flex-1 h-9 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: async () => {
          if (!newCategoryName.trim()) return;
          try {
            await api.post("/gift/categories", { name: newCategoryName.trim() });
            setNewCategoryName("");
            showToast("Category created!", "success");
            fetchGiftData();
          } catch (err) {
            showToast(err.response?.data?.message || "Failed to create category", "error");
          }
        },
        className: "h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
      },
      /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
      " Add"
    )), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4" }, "Category Name"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Active"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-[#E9E6F8] text-sm text-[#111827]" }, giftCategories.length > 0 ? giftCategories.map((cat) => /* @__PURE__ */ React.createElement("tr", { key: cat._id, className: `transition-colors ${!cat.isActive ? "opacity-50" : ""} hover:bg-[#FAFAFF]/50` }, /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, editingCategory === cat._id ? /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: editCategoryName,
        onChange: (e) => setEditCategoryName(e.target.value),
        className: "flex-1 h-8 px-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: async () => {
          try {
            await api.put(`/gift/categories/${cat._id}`, { name: editCategoryName.trim() });
            setEditingCategory(null);
            showToast("Category renamed!", "success");
            fetchGiftData();
          } catch (err) {
            showToast(err.response?.data?.message || "Failed to rename", "error");
          }
        },
        className: "h-8 px-3 bg-[#6C4EFF] text-white text-xs font-bold rounded-lg"
      },
      "Save"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setEditingCategory(null),
        className: "h-8 px-3 bg-slate-100 text-[#6B7280] text-xs font-bold rounded-lg"
      },
      "Cancel"
    )) : /* @__PURE__ */ React.createElement("p", { className: "font-bold" }, cat.name)), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4 text-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: async () => {
          try {
            await api.put(`/gift/categories/${cat._id}`, { isActive: !cat.isActive });
            fetchGiftData();
            showToast(`Category ${cat.isActive ? "deactivated" : "activated"}`, "success");
          } catch {
            showToast("Failed to toggle category", "error");
          }
        },
        className: "mx-auto"
      },
      cat.isActive ? /* @__PURE__ */ React.createElement(ToggleRight, { className: "w-6 h-6 text-emerald-500" }) : /* @__PURE__ */ React.createElement(ToggleLeft, { className: "w-6 h-6 text-[#9CA3AF]" })
    )), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 justify-center" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setEditingCategory(cat._id);
          setEditCategoryName(cat.name);
        },
        className: "w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors",
        title: "Rename"
      },
      /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: async () => {
          if (!window.confirm(`Delete category "${cat.name}"?`)) return;
          try {
            await api.delete(`/gift/categories/${cat._id}`);
            showToast("Category deleted!", "success");
            fetchGiftData();
          } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete category", "error");
          }
        },
        className: "w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors",
        title: "Delete Category"
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
    ))))) : /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "px-6 py-12 text-center text-[#6B7280]" }, "No categories yet. Add one above."))))))
  )), activeTab === "college-dept" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 px-6 py-3 border-b border-[#E9E6F8] text-xs font-bold" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCollegeDeptSubTab("colleges"),
      className: `px-3 py-1.5 rounded-full transition-all ${collegeDeptSubTab === "colleges" ? "bg-[#111827] text-white" : "text-[#6B7280] hover:bg-slate-200/50"}`
    },
    "Colleges (",
    colleges.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCollegeDeptSubTab("departments"),
      className: `px-3 py-1.5 rounded-full transition-all ${collegeDeptSubTab === "departments" ? "bg-[#111827] text-white" : "text-[#6B7280] hover:bg-slate-200/50"}`
    },
    "Departments (",
    departments.length,
    ")"
  )), collegeDeptSubTab === "colleges" ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: newCollegeName,
      onChange: (e) => setNewCollegeName(e.target.value),
      placeholder: "New college name...",
      className: "flex-1 h-9 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        if (!newCollegeName.trim()) return;
        try {
          await api.post("/colleges", { name: newCollegeName.trim() });
          setNewCollegeName("");
          showToast("College added!", "success");
          fetchCollegesAndDepartments();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to add college", "error");
        }
      },
      className: "h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " Add"
  )), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4" }, "College Name"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Active"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-[#E9E6F8] text-sm text-[#111827]" }, colleges.length > 0 ? colleges.map((col) => /* @__PURE__ */ React.createElement("tr", { key: col._id, className: `transition-colors ${!col.isActive ? "opacity-50" : ""} hover:bg-[#FAFAFF]/50` }, /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, editingCollege === col._id ? /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: editCollegeName,
      onChange: (e) => setEditCollegeName(e.target.value),
      className: "flex-1 h-8 px-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          await api.put(`/colleges/${col._id}`, { name: editCollegeName.trim() });
          setEditingCollege(null);
          showToast("College renamed!", "success");
          fetchCollegesAndDepartments();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to rename", "error");
        }
      },
      className: "h-8 px-3 bg-[#6C4EFF] text-white text-xs font-bold rounded-lg"
    },
    "Save"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEditingCollege(null),
      className: "h-8 px-3 bg-slate-100 text-[#6B7280] text-xs font-bold rounded-lg"
    },
    "Cancel"
  )) : /* @__PURE__ */ React.createElement("p", { className: "font-bold" }, col.name)), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4 text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          await api.put(`/colleges/${col._id}`, { isActive: !col.isActive });
          fetchCollegesAndDepartments();
          showToast(`College ${col.isActive ? "deactivated" : "activated"}`, "success");
        } catch {
          showToast("Failed to toggle college", "error");
        }
      },
      className: "mx-auto"
    },
    col.isActive ? /* @__PURE__ */ React.createElement(ToggleRight, { className: "w-6 h-6 text-emerald-500" }) : /* @__PURE__ */ React.createElement(ToggleLeft, { className: "w-6 h-6 text-[#9CA3AF]" })
  )), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingCollege(col._id);
        setEditCollegeName(col.name);
      },
      className: "w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors",
      title: "Rename"
    },
    /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        if (!window.confirm(`Delete college "${col.name}"?`)) return;
        try {
          await api.delete(`/colleges/${col._id}`);
          showToast("College deleted!", "success");
          fetchCollegesAndDepartments();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to delete college", "error");
        }
      },
      className: "w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors",
      title: "Delete College"
    },
    /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
  ))))) : /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "px-6 py-12 text-center text-[#6B7280]" }, "No colleges yet. Add one above.")))))) : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "px-6 py-4 flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: newDeptName,
      onChange: (e) => setNewDeptName(e.target.value),
      placeholder: "New department name...",
      className: "flex-1 h-9 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        if (!newDeptName.trim()) return;
        try {
          await api.post("/departments", { name: newDeptName.trim() });
          setNewDeptName("");
          showToast("Department added!", "success");
          fetchCollegesAndDepartments();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to add department", "error");
        }
      },
      className: "h-9 px-4 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
    },
    /* @__PURE__ */ React.createElement(Plus, { className: "w-4 h-4" }),
    " Add"
  )), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-[#FAFAFF] border-b border-[#E9E6F8] text-xs font-bold text-[#6B7280] uppercase tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4" }, "Department Name"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Active"), /* @__PURE__ */ React.createElement("th", { className: "px-6 py-4 text-center" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-[#E9E6F8] text-sm text-[#111827]" }, departments.length > 0 ? departments.map((dep) => /* @__PURE__ */ React.createElement("tr", { key: dep._id, className: `transition-colors ${!dep.isActive ? "opacity-50" : ""} hover:bg-[#FAFAFF]/50` }, /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, editingDept === dep._id ? /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: editDeptName,
      onChange: (e) => setEditDeptName(e.target.value),
      className: "flex-1 h-8 px-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C4EFF]/40"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          await api.put(`/departments/${dep._id}`, { name: editDeptName.trim() });
          setEditingDept(null);
          showToast("Department renamed!", "success");
          fetchCollegesAndDepartments();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to rename", "error");
        }
      },
      className: "h-8 px-3 bg-[#6C4EFF] text-white text-xs font-bold rounded-lg"
    },
    "Save"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEditingDept(null),
      className: "h-8 px-3 bg-slate-100 text-[#6B7280] text-xs font-bold rounded-lg"
    },
    "Cancel"
  )) : /* @__PURE__ */ React.createElement("p", { className: "font-bold" }, dep.name)), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4 text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          await api.put(`/departments/${dep._id}`, { isActive: !dep.isActive });
          fetchCollegesAndDepartments();
          showToast(`Department ${dep.isActive ? "deactivated" : "activated"}`, "success");
        } catch {
          showToast("Failed to toggle department", "error");
        }
      },
      className: "mx-auto"
    },
    dep.isActive ? /* @__PURE__ */ React.createElement(ToggleRight, { className: "w-6 h-6 text-emerald-500" }) : /* @__PURE__ */ React.createElement(ToggleLeft, { className: "w-6 h-6 text-[#9CA3AF]" })
  )), /* @__PURE__ */ React.createElement("td", { className: "px-6 py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setEditingDept(dep._id);
        setEditDeptName(dep.name);
      },
      className: "w-8 h-8 rounded-full bg-[#F4F1FF] text-[#6C4EFF] hover:bg-[#E9E6F8] flex items-center justify-center transition-colors",
      title: "Rename"
    },
    /* @__PURE__ */ React.createElement(Edit, { className: "w-4 h-4" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        if (!window.confirm(`Delete department "${dep.name}"?`)) return;
        try {
          await api.delete(`/departments/${dep._id}`);
          showToast("Department deleted!", "success");
          fetchCollegesAndDepartments();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to delete department", "error");
        }
      },
      className: "w-8 h-8 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors",
      title: "Delete Department"
    },
    /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
  ))))) : /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "px-6 py-12 text-center text-[#6B7280]" }, "No departments yet. Add one above."))))))))), previewIdUrl && /* @__PURE__ */ React.createElement("div", { className: "admin-modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "admin-modal-backdrop", onClick: () => setPreviewIdUrl(null) }), /* @__PURE__ */ React.createElement("div", { className: "admin-preview-modal" }, /* @__PURE__ */ React.createElement("div", { className: "admin-preview-header" }, /* @__PURE__ */ React.createElement("h3", { className: "admin-preview-title" }, previewTitle), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setPreviewIdUrl(null),
      className: "admin-preview-close-btn"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { style: { width: "16px", height: "16px" } })
  )), /* @__PURE__ */ React.createElement("div", { className: "admin-preview-body" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: previewIdUrl,
      alt: "ID Card Front",
      className: "admin-preview-img"
    }
  )))), showGiftProductModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: () => setShowGiftProductModal(false) }), /* @__PURE__ */ React.createElement("div", { className: "relative w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl overflow-hidden z-10 flex flex-col border border-[#E9E6F8]" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center border-b border-[#E9E6F8] px-6 py-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-sm text-[#111827]" }, editingGiftProduct ? "Edit Product" : "Add New Product"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowGiftProductModal(false),
      className: "w-8 h-8 rounded-full bg-[#FAFAFF] hover:bg-[#F4F1FF] flex items-center justify-center text-[#6B7280]"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Title *"), /* @__PURE__ */ React.createElement("input", { type: "text", value: giftProductForm.title, onChange: (e) => setGiftProductForm({ ...giftProductForm, title: e.target.value }), className: "w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40", placeholder: "Product title" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Description *"), /* @__PURE__ */ React.createElement("textarea", { value: giftProductForm.description, onChange: (e) => setGiftProductForm({ ...giftProductForm, description: e.target.value }), rows: 3, className: "w-full px-3 py-2 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40 resize-none", placeholder: "Product description" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Category *"), /* @__PURE__ */ React.createElement("select", { value: giftProductForm.category, onChange: (e) => setGiftProductForm({ ...giftProductForm, category: e.target.value }), className: "w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40 cursor-pointer" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "Select category"), giftCategories.filter((c) => c.isActive).map((c) => /* @__PURE__ */ React.createElement("option", { key: c._id, value: c.name }, c.name)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Selling Price (\u20B9) *"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", value: giftProductForm.basePrice, onChange: (e) => setGiftProductForm({ ...giftProductForm, basePrice: e.target.value }), className: "w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40", placeholder: "180" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "MRP / Cross Price (\u20B9)"), /* @__PURE__ */ React.createElement("input", { type: "number", min: "0", value: giftProductForm.mrpPrice, onChange: (e) => setGiftProductForm({ ...giftProductForm, mrpPrice: e.target.value }), className: "w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40", placeholder: "Optional, e.g. 250" }))), giftProductForm.mrpPrice && Number(giftProductForm.mrpPrice) > Number(giftProductForm.basePrice || 0) && /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-emerald-600" }, Math.round((Number(giftProductForm.mrpPrice) - Number(giftProductForm.basePrice)) / Number(giftProductForm.mrpPrice) * 100), "% OFF will be shown to customers"), giftProductForm.mrpPrice && Number(giftProductForm.mrpPrice) < Number(giftProductForm.basePrice || 0) && /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-rose-600" }, "MRP cannot be lower than the selling price."), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Badge"), /* @__PURE__ */ React.createElement("select", { value: giftProductForm.badge, onChange: (e) => setGiftProductForm({ ...giftProductForm, badge: e.target.value }), className: "w-full h-10 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl text-sm focus:outline-none focus:border-[#6C4EFF]/40 cursor-pointer" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "None"), /* @__PURE__ */ React.createElement("option", { value: "BEST SELLER" }, "Best Seller"), /* @__PURE__ */ React.createElement("option", { value: "NEW" }, "New"), /* @__PURE__ */ React.createElement("option", { value: "TRENDING" }, "Trending"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-end pb-1" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: giftProductForm.isFeatured, onChange: (e) => setGiftProductForm({ ...giftProductForm, isFeatured: e.target.checked }), className: "w-4 h-4 accent-[#6C4EFF]" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-[#111827]" }, "Featured on homepage")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Features"), giftProductForm.features.map((feat, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex gap-2 mb-1.5" }, /* @__PURE__ */ React.createElement("input", { type: "text", value: feat, onChange: (e) => {
    const f = [...giftProductForm.features];
    f[idx] = e.target.value;
    setGiftProductForm({ ...giftProductForm, features: f });
  }, className: "flex-1 h-8 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs focus:outline-none focus:border-[#6C4EFF]/40", placeholder: `Feature ${idx + 1}` }), giftProductForm.features.length > 1 && /* @__PURE__ */ React.createElement("button", { onClick: () => {
    const f = giftProductForm.features.filter((_, i) => i !== idx);
    setGiftProductForm({ ...giftProductForm, features: f });
  }, className: "w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs" }, "\xD7"))), /* @__PURE__ */ React.createElement("button", { onClick: () => setGiftProductForm({ ...giftProductForm, features: [...giftProductForm.features, ""] }), className: "text-xs font-bold text-[#6C4EFF] hover:underline mt-1" }, "+ Add feature")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1" }, "Size Options (optional)"), giftProductForm.sizeOptions.map((so, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "flex gap-2 mb-1.5" }, /* @__PURE__ */ React.createElement("input", { type: "text", value: so.label, onChange: (e) => {
    const s = [...giftProductForm.sizeOptions];
    s[idx] = { ...s[idx], label: e.target.value };
    setGiftProductForm({ ...giftProductForm, sizeOptions: s });
  }, className: "flex-1 h-8 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs focus:outline-none", placeholder: "e.g. 8\xD712" }), /* @__PURE__ */ React.createElement("input", { type: "number", value: so.priceModifier, onChange: (e) => {
    const s = [...giftProductForm.sizeOptions];
    s[idx] = { ...s[idx], priceModifier: Number(e.target.value) };
    setGiftProductForm({ ...giftProductForm, sizeOptions: s });
  }, className: "w-24 h-8 px-3 bg-[#FAFAFF] border border-[#E9E6F8] rounded-lg text-xs focus:outline-none", placeholder: "+\u20B9 modifier" }), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    const s = giftProductForm.sizeOptions.filter((_, i) => i !== idx);
    setGiftProductForm({ ...giftProductForm, sizeOptions: s });
  }, className: "w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs" }, "\xD7"))), /* @__PURE__ */ React.createElement("button", { onClick: () => setGiftProductForm({ ...giftProductForm, sizeOptions: [...giftProductForm.sizeOptions, { label: "", priceModifier: 0 }] }), className: "text-xs font-bold text-[#6C4EFF] hover:underline mt-1" }, "+ Add size option")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-1.5" }, /* @__PURE__ */ React.createElement("label", { className: "text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block" }, "Product Photos (", giftProductPhotoItems.length, ") *"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-[#6C4EFF] font-semibold" }, "First photo is Main Cover")), giftProductPhotoItems.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-2 mb-3" }, giftProductPhotoItems.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "relative group rounded-xl overflow-hidden border border-[#E9E6F8] bg-slate-50 aspect-square flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("img", { src: item.url, alt: "", className: "w-full h-full object-cover absolute inset-0" }), idx === 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute top-1 left-1 bg-[#6C4EFF] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-10" }, "Cover"), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-20" }, idx > 0 && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setGiftProductPhotoItems((prev) => {
          const list = [...prev];
          const temp = list[idx - 1];
          list[idx - 1] = list[idx];
          list[idx] = temp;
          return list;
        });
      },
      className: "w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center text-xs font-bold shadow",
      title: "Move left"
    },
    "\u2039"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setGiftProductPhotoItems((prev) => prev.filter((i) => i.id !== item.id));
      },
      className: "w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow",
      title: "Remove photo"
    },
    "\xD7"
  ), idx < giftProductPhotoItems.length - 1 && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setGiftProductPhotoItems((prev) => {
          const list = [...prev];
          const temp = list[idx + 1];
          list[idx + 1] = list[idx];
          list[idx] = temp;
          return list;
        });
      },
      className: "w-6 h-6 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center text-xs font-bold shadow",
      title: "Move right"
    },
    "\u203A"
  ))))), /* @__PURE__ */ React.createElement("label", { className: "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#E9E6F8] hover:border-[#6C4EFF]/50 rounded-2xl cursor-pointer bg-[#FAFAFF] hover:bg-[#F4F1FF]/30 transition-all text-center p-3" }, /* @__PURE__ */ React.createElement(Upload, { className: "w-5 h-5 text-[#6C4EFF] mb-1" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-[#111827]" }, "Click to add photo(s)"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-[#6B7280] mt-0.5" }, "Select multiple photos (JPG, PNG, WebP)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
      multiple: true,
      className: "hidden",
      onChange: (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        files.forEach((f, index) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setGiftProductPhotoItems((prev) => [
              ...prev,
              {
                id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`,
                type: "new",
                url: ev.target.result,
                file: f
              }
            ]);
          };
          reader.readAsDataURL(f);
        });
        e.target.value = "";
      }
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 border-t border-[#E9E6F8] px-6 py-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowGiftProductModal(false),
      className: "flex-1 h-10 border border-[#E9E6F8] text-[#6B7280] font-bold text-xs rounded-xl"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: async () => {
        try {
          if (giftProductForm.mrpPrice && Number(giftProductForm.mrpPrice) < Number(giftProductForm.basePrice)) {
            showToast("MRP cannot be lower than the selling price", "error");
            return;
          }
          if (!giftProductPhotoItems || giftProductPhotoItems.length === 0) {
            showToast("Please add at least one product photo", "error");
            return;
          }
          const formData = new FormData();
          formData.append("title", giftProductForm.title);
          formData.append("description", giftProductForm.description);
          formData.append("category", giftProductForm.category);
          formData.append("basePrice", giftProductForm.basePrice);
          formData.append("mrpPrice", giftProductForm.mrpPrice || "");
          formData.append("badge", giftProductForm.badge);
          formData.append("isFeatured", giftProductForm.isFeatured);
          formData.append("features", JSON.stringify(giftProductForm.features.filter((f) => f.trim())));
          formData.append("sizeOptions", JSON.stringify(giftProductForm.sizeOptions.filter((s) => s.label.trim())));
          const existingUrls = giftProductPhotoItems.filter((item) => item.type === "existing").map((item) => item.url);
          formData.append("existingImages", JSON.stringify(existingUrls));
          giftProductPhotoItems.filter((item) => item.type === "new" && item.file).forEach((item) => formData.append("images", item.file));
          if (editingGiftProduct) {
            await api.put(`/gift/products/${editingGiftProduct._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            showToast("Product updated!", "success");
          } else {
            await api.post("/gift/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
            showToast("Product created!", "success");
          }
          setShowGiftProductModal(false);
          fetchGiftData();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to save product", "error");
        }
      },
      className: "flex-1 h-10 bg-[#6C4EFF] hover:bg-[#5C3EEF] text-white font-bold text-xs rounded-xl transition-all"
    },
    editingGiftProduct ? "Save Changes" : "Create Product"
  )))));
};
export default AdminDashboard;

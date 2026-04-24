import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/api/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Order = {
  _id: string;
  orderNumber?: string;
  shiprocketOrderId?: string;
  status: string;
  paymentStatus: string;
  shipmentStatus?: string;
  currency: string;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  itemCount: number;
  customerName?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const StatusBadge = ({ value, type = "status" }: { value: string; type?: "status" | "payment" | "shipment" }) => {
  const val = value?.toLowerCase() || "pending";
  
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    shipped: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-emerald-500 text-white border-emerald-600",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    failed: "bg-rose-100 text-rose-700 border-rose-200",
    processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border", colors[val] || "bg-muted text-muted-foreground")}>
      {value || "N/A"}
    </Badge>
  );
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  // Initialize state from URL params
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(searchParams.get("payment") || "all");
  const [selectedShipmentStatus, setSelectedShipmentStatus] = useState(searchParams.get("shipment") || "all");
  const [searchText, setSearchText] = useState(searchParams.get("q") || "");
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");
  
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const params: any = { page: String(page) };
    if (debouncedSearchText) params.q = debouncedSearchText;
    if (selectedStatus !== "all") params.status = selectedStatus;
    if (selectedPaymentStatus !== "all") params.payment = selectedPaymentStatus;
    if (selectedShipmentStatus !== "all") params.shipment = selectedShipmentStatus;
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;

    setSearchParams(params, { replace: true });
  }, [page, debouncedSearchText, selectedStatus, selectedPaymentStatus, selectedShipmentStatus, startDate, endDate, setSearchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        status: selectedStatus === "all" ? "" : selectedStatus,
        paymentStatus: selectedPaymentStatus === "all" ? "" : selectedPaymentStatus,
        shipmentStatus: selectedShipmentStatus === "all" ? "" : selectedShipmentStatus,
        search: debouncedSearchText,
        startDate,
        endDate,
      };
      
      const token = localStorage.getItem("token");
      console.log("Fetching orders from:", `${API_BASE_URL}/admin/orders`, "with params:", params);
      
      const { data } = await axios.get(`${API_BASE_URL}/admin/orders`, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Orders response:", data);
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, selectedStatus, selectedPaymentStatus, selectedShipmentStatus, debouncedSearchText, startDate, endDate]);

  const handleOrderClick = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const getPageRange = () => {
    if (!pagination) return [];
    const delta = 2;
    const range = [];
    const left = page - delta;
    const right = page + delta + 1;
    let l;

    for (let i = 1; i <= pagination.totalPages; i++) {
      if (i === 1 || i === pagination.totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    const rangeWithDots = [];
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Logistics</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Order Registry
          </h1>
          <p className="text-muted-foreground font-medium">
            Monitor and manage your customer transactions.
          </p>
        </div>

        <div className="bg-background/60 backdrop-blur-sm border border-border/50 px-6 py-3 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In Sync</span>
            <span className="text-lg font-black text-primary">{pagination?.total ?? 0}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fetchOrders()}
            className={cn("rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all", loading && "animate-spin")}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-background/40 backdrop-blur-md rounded-3xl border border-border/50 shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box - Flex Grow to take available space on mobile, fixed width on desktop */}
          <div className="relative group flex-1 min-w-[200px] lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search ID, phone..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 h-11 bg-background border-border/50 rounded-2xl focus:ring-primary/20 focus:border-primary transition-all shadow-none w-full"
            />
          </div>

          {/* Date Range Group */}
          <div className="flex items-center gap-2 bg-background/50 p-1 rounded-2xl border border-border/50">
            <div className="relative group w-32 md:w-40">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none z-10" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="pl-9 pr-2 h-9 bg-transparent border-none text-[10px] font-bold focus:ring-0 transition-all shadow-none cursor-pointer w-full appearance-none"
                style={{ colorScheme: 'light' }}
              />
            </div>
            <span className="text-muted-foreground text-[10px] font-black uppercase opacity-30">to</span>
            <div className="relative group w-32 md:w-40">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none z-10" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="pl-9 pr-2 h-9 bg-transparent border-none text-[10px] font-bold focus:ring-0 transition-all shadow-none cursor-pointer w-full appearance-none"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>

          {/* Status Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32 h-11 bg-background border-border/50 rounded-2xl text-[10px] font-bold shadow-none uppercase tracking-wider">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
              <SelectTrigger className="w-36 h-11 bg-background border-border/50 rounded-2xl text-[10px] font-bold shadow-none uppercase tracking-wider">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedShipmentStatus} onValueChange={setSelectedShipmentStatus}>
              <SelectTrigger className="w-36 h-11 bg-background border-border/50 rounded-2xl text-[10px] font-bold shadow-none uppercase tracking-wider">
                <SelectValue placeholder="Shipment" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                <SelectItem value="all">All Shipments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchText("");
                setSelectedStatus("all");
                setSelectedPaymentStatus("all");
                setSelectedShipmentStatus("all");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="h-11 w-11 rounded-2xl border-border/50 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all group shrink-0"
              title="Clear all filters"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
            <span className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Syncing Registry</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="p-6 rounded-full bg-muted/30 border border-border/50 text-muted-foreground">
              <Package className="w-12 h-12 opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No Orders Found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                No transactions match your current search and filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order Details</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Summary</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pipeline Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <AnimatePresence mode="popLayout">
                  {orders.map((order, idx) => (
                    <motion.tr 
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleOrderClick(order._id)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                            {order.orderNumber || order.shiprocketOrderId}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase">
                            #{order._id.slice(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{order.customerName || "Guest User"}</span>
                          <span className="text-xs text-muted-foreground">{order.phoneNumber || "No contact"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {[...Array(Math.min(3, order.itemCount))].map((_, i) => (
                              <div key={i} className="w-7 h-7 rounded-lg bg-muted border-2 border-background flex items-center justify-center">
                                <Package className="w-3 h-3 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-bold">{order.itemCount} Items</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={order.status} type="status" />
                          <StatusBadge value={order.paymentStatus} type="payment" />
                          <StatusBadge value={order.shipmentStatus || "pending"} type="shipment" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex flex-col items-end mr-4">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Placed On</span>
                            <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION SECTION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 bg-background/60 backdrop-blur-sm p-8 rounded-[2.5rem] border border-border/50 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-10 rounded-xl px-4 hover:bg-primary/10 hover:text-primary transition-all font-bold group"
            >
              <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Previous
            </Button>

            <div className="flex items-center gap-1 mx-4">
              {getPageRange().map((p, idx) => (
                <button
                  key={idx}
                  disabled={typeof p !== "number" || loading}
                  onClick={() => typeof p === "number" && setPage(p)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                    p === page 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" 
                      : typeof p === "number" 
                        ? "hover:bg-primary/10 hover:text-primary text-muted-foreground" 
                        : "text-muted-foreground cursor-default"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || loading}
              className="h-10 rounded-xl px-4 hover:bg-primary/10 hover:text-primary transition-all font-bold group"
            >
              Next
              <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Total <span className="text-foreground">{pagination.total}</span> orders in registry 
            <span className="mx-3 opacity-30">|</span>
            Page <span className="text-primary">{page}</span> of <span className="text-foreground">{pagination.totalPages}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminOrders;

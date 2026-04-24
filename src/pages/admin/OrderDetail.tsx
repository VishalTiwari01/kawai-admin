import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  CreditCard, 
  Truck, 
  Calendar, 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Hash,
  ShoppingBag,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OrderItem = {
  _id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string;
  productId?: number;
  productImage?: string;
  createdAt: string;
};

type OrderDetailType = {
  _id: string;
  userId?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  currency: string;
  isReturn?: boolean;
  tracking?: any[];
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

const StatusBadge = ({ value }: { value: string }) => {
  const val = value?.toLowerCase() || "pending";
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
    shipped: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-emerald-500 text-white border-emerald-600",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <Badge variant="outline" className={cn("px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border", colors[val] || "bg-muted text-muted-foreground")}>
      {value || "N/A"}
    </Badge>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`https://kawaiworld-nkppi.ondigitalocean.app/api/admin/orders/${orderId}`);
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
        <span className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Fetching Order Details</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <XCircle className="w-12 h-12 text-destructive opacity-20" />
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Order Not Found</h3>
          <p className="text-muted-foreground text-sm">We couldn't find the order you're looking for.</p>
        </div>
        <Button onClick={() => navigate("/admin/orders")} variant="outline" className="rounded-xl">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="group -ml-2 text-muted-foreground hover:text-primary transition-colors font-bold gap-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter">Order #{order.orderNumber}</h1>
            <StatusBadge value={order.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
             <div className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}</div>
             <div className="w-1 h-1 rounded-full bg-border" />
             <div className="flex items-center gap-1.5"><Hash size={14} /> ID: {order._id}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Buttons removed as requested */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ITEMS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-border/30 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="font-black uppercase tracking-widest text-xs">Line Items</h3>
              </div>
              <Badge variant="secondary" className="rounded-full px-3">{order.items.length} Items</Badge>
            </div>
            
            <div className="divide-y divide-border/30">
              {order.items.map((item) => (
                <div key={item._id} className="p-8 flex flex-col sm:flex-row gap-6 group hover:bg-muted/10 transition-colors">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-inner shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-lg leading-tight">{item.productName}</h4>
                      <span className="font-black text-lg">
                        {item.totalPrice.toLocaleString("en-IN", { style: "currency", currency: order.currency })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Hash size={12} /> SKU: {item.productSku}</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-muted/20 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-bold">{(order.items.reduce((acc, i) => acc + i.totalPrice, 0)).toLocaleString("en-IN", { style: "currency", currency: order.currency })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Shipping Fee</span>
                <span className="font-bold text-emerald-600">{(order.shippingAmount || 0).toLocaleString("en-IN", { style: "currency", currency: order.currency })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Tax</span>
                <span className="font-bold">{(order.taxAmount || 0).toLocaleString("en-IN", { style: "currency", currency: order.currency })}</span>
              </div>
              <div className="h-px bg-border/50 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-wider">Total</span>
                <span className="text-3xl font-black text-primary">
                  {(order.items.reduce((acc, i) => acc + i.totalPrice, 0) + (order.shippingAmount || 0) + (order.taxAmount || 0)).toLocaleString("en-IN", { style: "currency", currency: order.currency })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER & STATUS */}
        <div className="space-y-8">
          {/* CUSTOMER CARD */}
          <div className="bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden p-8 space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Customer Profile</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">Guest User</span>
                  <span className="text-xs text-muted-foreground font-medium">customer@example.com</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <MapPin size={12} /> Shipping Address
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  123 Luxury Avenue, Fashion District<br />
                  New Delhi, 110001<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT CARD */}
          <div className="bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden p-8 space-y-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Payment Insight</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Method</span>
                <span className="text-sm font-bold flex items-center gap-2">
                  <Circle size={10} className="fill-emerald-500 text-emerald-500" /> Razorpay
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <StatusBadge value={order.paymentStatus} />
              </div>
            </div>
          </div>

          {/* LOGISTICS CARD */}
          <div className="bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-xl overflow-hidden p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground">Order Pipeline</h3>
            </div>
            
            <div className="space-y-8 relative">
              {[
                { label: "Order Placed", status: "pending", icon: CheckCircle2, sub: new Date(order.createdAt).toLocaleDateString("en-IN") },
                { label: "Confirmed", status: "confirmed", icon: Circle, sub: "Verified & Locked" },
                { label: "Shipped", status: "shipped", icon: Truck, sub: "Carrier Picked Up" },
                { label: "Delivered", status: "delivered", icon: ShoppingBag, sub: "Arrived at Destination" }
              ].map((step, i, arr) => {
                const orderStatus = order.status.toLowerCase();
                const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
                const currentIdx = statuses.indexOf(orderStatus);
                const stepIdx = statuses.indexOf(step.status);
                
                const isCompleted = currentIdx >= stepIdx;
                const isCurrent = orderStatus === step.status;

                return (
                  <div key={step.label} className="flex items-start gap-4 relative">
                    <div className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg",
                      isCompleted ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-muted border-2 border-border text-muted-foreground"
                    )}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
                    </div>
                    <div className={cn("flex flex-col", !isCompleted && "opacity-40")}>
                      <span className={cn("text-sm font-bold", isCurrent && "text-primary")}>{step.label}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{step.sub}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={cn(
                        "absolute left-4 top-8 w-px h-8 transition-colors duration-500",
                        isCompleted ? "bg-emerald-500" : "bg-border/50"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetail;

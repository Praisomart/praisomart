import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  productName: string | null;
  attribute: string | null;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  status: string;
  paymentMode: string | null;
  totalAmount: number;
  createdAt: string | null;
  items: OrderItem[];
};

const formatMoney = (value: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

const statusStyle = (status: string) => {
  switch ((status || "").toUpperCase()) {
    case "PAID":
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res: any = await apiFetch("/orders/my-orders");
        // Works whether apiFetch returns parsed JSON or a raw Response
        const data = res && typeof res.json === "function" ? await res.json() : res;
        const list: Order[] = Array.isArray(data) ? data : [];
        list.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
        if (!cancelled) setOrders(list);
      } catch (e) {
        if (!cancelled) setError("We couldn't load your orders. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed"
      >
        <Package size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Looks like you haven't made any purchases yet. Explore our collection to find something beautiful.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary/90 transition-all"
        >
          Start Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-card border rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-bold">Order #{order.id}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
                {order.paymentMode ? ` · ${order.paymentMode === "COD" ? "Cash on Delivery" : "Online Payment"}` : ""}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="divide-y">
            {(order.items ?? []).map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.productName ?? "Product"}</p>
                  <p className="text-muted-foreground">
                    {item.attribute ? `${item.attribute} · ` : ""}Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {formatMoney(Number(item.price) * Number(item.quantity))}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4 mt-2">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatMoney(order.totalAmount)}</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default OrderHistory;


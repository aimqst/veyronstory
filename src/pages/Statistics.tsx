import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, ShoppingBag, Package, TrendingUp, DollarSign, Star, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalLikes: number;
  totalComments: number;
  activeCoupons: number;
};

type Product = {
  id: string;
  name: string;
  totalSales: number;
  revenue: number;
};

type MonthlySales = {
  month: string;
  sales: number;
  revenue: number;
};

const Statistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalLikes: 0,
    totalComments: 0,
    activeCoupons: 0,
  });
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);

  useEffect(() => {
    checkAdminAndLoadStats();
  }, []);

  const checkAdminAndLoadStats = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      toast.error("ليس لديك صلاحيات الأدمن");
      navigate("/");
      return;
    }

    await loadStatistics();
    setLoading(false);
  };

  const loadStatistics = async () => {
    try {
      // عدد المستخدمين
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // عدد الطلبات
      const { data: orders, count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" });

      // عدد المنتجات
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // إجمالي المبيعات
      const { data: deliveredOrders } = await supabase
        .from("orders")
        .select("final_amount")
        .eq("status", "delivered");

      const totalRevenue = deliveredOrders?.reduce((sum, order) => sum + order.final_amount, 0) || 0;

      // حالات الطلبات
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: confirmedCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed");

      const { count: deliveredCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered");

      const { count: cancelledCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled");

      // عدد الإعجابات
      const { count: likesCount } = await supabase
        .from("product_likes")
        .select("*", { count: "exact", head: true });

      // عدد التعليقات
      const { count: commentsCount } = await supabase
        .from("product_comments")
        .select("*", { count: "exact", head: true });

      // عدد الكوبونات النشطة
      const { count: couponsCount } = await supabase
        .from("discount_coupons")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      setStats({
        totalUsers: usersCount || 0,
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        totalRevenue,
        pendingOrders: pendingCount || 0,
        confirmedOrders: confirmedCount || 0,
        deliveredOrders: deliveredCount || 0,
        cancelledOrders: cancelledCount || 0,
        totalLikes: likesCount || 0,
        totalComments: commentsCount || 0,
        activeCoupons: couponsCount || 0,
      });

      // أكثر المنتجات مبيعاً
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, total_price");

      if (orderItems) {
        const productSales = orderItems.reduce((acc, item) => {
          if (!acc[item.product_id || "unknown"]) {
            acc[item.product_id || "unknown"] = {
              id: item.product_id || "unknown",
              name: item.product_name,
              totalSales: 0,
              revenue: 0,
            };
          }
          acc[item.product_id || "unknown"].totalSales += item.quantity;
          acc[item.product_id || "unknown"].revenue += item.total_price;
          return acc;
        }, {} as Record<string, Product>);

        const topProductsData = Object.values(productSales)
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5);

        setTopProducts(topProductsData);
      }

      // مبيعات شهرية
      if (orders) {
        const salesByMonth = orders.reduce((acc, order) => {
          const date = new Date(order.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          
          if (!acc[monthKey]) {
            acc[monthKey] = { month: monthKey, sales: 0, revenue: 0 };
          }
          
          acc[monthKey].sales += 1;
          if (order.status === "delivered") {
            acc[monthKey].revenue += order.final_amount;
          }
          
          return acc;
        }, {} as Record<string, MonthlySales>);

        const monthlySalesData = Object.values(salesByMonth)
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6); // آخر 6 شهور

        setMonthlySales(monthlySalesData);
      }
    } catch (error) {
      toast.error("حدث خطأ في تحميل الإحصائيات");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl">جاري التحميل...</p>
      </div>
    );
  }

  const orderStatusData = [
    { name: "قيد الانتظار", value: stats.pendingOrders, color: "hsl(var(--chart-1))" },
    { name: "تم التأكيد", value: stats.confirmedOrders, color: "hsl(var(--chart-2))" },
    { name: "تم التوصيل", value: stats.deliveredOrders, color: "hsl(var(--chart-3))" },
    { name: "ملغاة", value: stats.cancelledOrders, color: "hsl(var(--chart-4))" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">صفحة الإحصائيات</h1>

        {/* إحصائيات عامة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المستخدمين المسجلين</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الطلبات</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الطلبات</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المنتجات</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalRevenue.toFixed(2)} ج.م</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الإيرادات</p>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات إضافية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الإعجابات</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الإعجابات</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">التعليقات</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي التعليقات</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الكوبونات النشطة</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCoupons}</div>
              <p className="text-xs text-muted-foreground mt-1">كوبونات فعالة</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الطلبات الموصلة</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">من أصل {stats.totalOrders}</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* حالات الطلبات */}
          <Card>
            <CardHeader>
              <CardTitle>حالات الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* المبيعات الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية (آخر 6 شهور)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" name="عدد الطلبات" />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" name="الإيرادات (ج.م)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* أكثر المنتجات مبيعاً */}
        <Card>
          <CardHeader>
            <CardTitle>أكثر 5 منتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSales" fill="hsl(var(--primary))" name="عدد المبيعات" />
                <Bar dataKey="revenue" fill="hsl(var(--chart-3))" name="الإيرادات (ج.م)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Statistics;

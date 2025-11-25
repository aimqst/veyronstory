import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  colors?: string[];
  sizes?: string[];
};

type Banner = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
};

type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  shipping_cost: number;
  final_amount: number;
  delivery_address: string;
  phone: string;
  notes: string | null;
  status: string;
  created_at: string;
  order_items: {
    product_name: string;
    quantity: number;
    total_price: number;
  }[];
};

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    discount_percentage: "0",
    image_url: "",
    category: "الكل",
    stock_quantity: "0",
    colors: "",
    sizes: "",
  });
  const [bannerForm, setBannerForm] = useState({
    title: "",
    description: "",
    image_url: "",
    link: "",
    is_active: true,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
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

    setIsAdmin(true);
    setLoading(false);
    loadProducts();
    loadBanners();
    loadOrders();
  };

  const loadProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

    if (error) {
      toast.error("حدث خطأ في تحميل المنتجات");
    } else {
      setProducts(data || []);
    }
  };

  const loadBanners = async () => {
    const { data, error } = await supabase.from("banners").select("*").order("display_order");

    if (error) {
      toast.error("حدث خطأ في تحميل العروض");
    } else {
      setBanners(data || []);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          product_name,
          quantity,
          total_price
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("حدث خطأ في تحميل الطلبات");
    } else {
      setOrders(data || []);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const colorsArray = productForm.colors
      ? productForm.colors.split(",").map((c) => c.trim()).filter(Boolean)
      : [];
    const sizesArray = productForm.sizes
      ? productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      discount_percentage: parseInt(productForm.discount_percentage),
      image_url: productForm.image_url,
      category: productForm.category as "الكل" | "دفعة الظلام" | "دفعة النخبة" | "دفعة الحلال" | "دفعة الأنمي" | "دفعة TST",
      stock_quantity: parseInt(productForm.stock_quantity),
      colors: colorsArray,
      sizes: sizesArray,
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);

      if (error) {
        toast.error("حدث خطأ في تحديث المنتج");
      } else {
        toast.success("تم تحديث المنتج بنجاح");
        setEditingProduct(null);
        resetProductForm();
        loadProducts();
      }
    } else {
      const { error } = await supabase.from("products").insert([productData]);

      if (error) {
        toast.error("حدث خطأ في إضافة المنتج");
      } else {
        toast.success("تم إضافة المنتج بنجاح");
        resetProductForm();
        loadProducts();
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount_percentage: product.discount_percentage.toString(),
      image_url: product.image_url,
      category: product.category,
      stock_quantity: product.stock_quantity.toString(),
      colors: product.colors?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ في حذف المنتج");
    } else {
      toast.success("تم حذف المنتج بنجاح");
      loadProducts();
    }
  };

  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    const bannerData = {
      title: bannerForm.title,
      description: bannerForm.description || null,
      image_url: bannerForm.image_url || null,
      link: bannerForm.link || null,
      is_active: bannerForm.is_active,
      display_order: editingBanner?.display_order ?? banners.length,
    };

    if (editingBanner) {
      const { error } = await supabase.from("banners").update(bannerData).eq("id", editingBanner.id);

      if (error) {
        toast.error("حدث خطأ في تحديث العرض");
      } else {
        toast.success("تم تحديث العرض بنجاح");
        setEditingBanner(null);
        resetBannerForm();
        loadBanners();
      }
    } else {
      const { error } = await supabase.from("banners").insert([bannerData]);

      if (error) {
        toast.error("حدث خطأ في إضافة العرض");
      } else {
        toast.success("تم إضافة العرض بنجاح");
        resetBannerForm();
        loadBanners();
      }
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      description: banner.description || "",
      image_url: banner.image_url || "",
      link: banner.link || "",
      is_active: banner.is_active,
    });
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;

    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      toast.error("حدث خطأ في حذف العرض");
    } else {
      toast.success("تم حذف العرض بنجاح");
      loadBanners();
    }
  };

  const handleMoveBanner = async (id: string, direction: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === banners.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedBanners = [...banners];
    [updatedBanners[index], updatedBanners[newIndex]] = [updatedBanners[newIndex], updatedBanners[index]];

    const updates = updatedBanners.map((banner, idx) => ({
      id: banner.id,
      display_order: idx,
    }));

    for (const update of updates) {
      await supabase.from("banners").update({ display_order: update.display_order }).eq("id", update.id);
    }

    loadBanners();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: "pending" | "confirmed" | "delivered" | "cancelled") => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

    if (error) {
      toast.error("حدث خطأ في تحديث حالة الطلب");
    } else {
      toast.success("تم تحديث حالة الطلب بنجاح");
      loadOrders();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      discount_percentage: "0",
      image_url: "",
      category: "الكل",
      stock_quantity: "0",
      colors: "",
      sizes: "",
    });
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      description: "",
      image_url: "",
      link: "",
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">لوحة التحكم</h1>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button onClick={() => navigate("/admin/coupons")} variant="outline">
            إدارة الكوبونات
          </Button>
          <Button onClick={() => navigate("/admin/ai")} variant="outline">
            إدارة الذكاء الاصطناعي
          </Button>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="banners">العروض</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
              </h2>
              <form onSubmit={handleSubmitProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر (ج.م) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount">نسبة الخصم (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={productForm.discount_percentage}
                      onChange={(e) =>
                        setProductForm({ ...productForm, discount_percentage: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">رابط الصورة</Label>
                  <Input
                    id="image"
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">الفئة *</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الكل">الكل</SelectItem>
                        <SelectItem value="دفعة الظلام">دفعة الظلام</SelectItem>
                        <SelectItem value="دفعة النخبة">دفعة النخبة</SelectItem>
                        <SelectItem value="دفعة الحلال">دفعة الحلال</SelectItem>
                        <SelectItem value="دفعة الأنمي">دفعة الأنمي</SelectItem>
                        <SelectItem value="دفعة TST">دفعة TST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stock">الكمية المتوفرة *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={productForm.stock_quantity}
                      onChange={(e) =>
                        setProductForm({ ...productForm, stock_quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="colors">الألوان المتاحة (افصل بفاصلة)</Label>
                  <Input
                    id="colors"
                    placeholder="أحمر, أزرق, أسود"
                    value={productForm.colors}
                    onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="sizes">المقاسات المتاحة (افصل بفاصلة)</Label>
                  <Input
                    id="sizes"
                    placeholder="S, M, L, XL, XXL"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
                  </Button>
                  {editingProduct && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(null);
                        resetProductForm();
                      }}
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{product.price} ج.م</span>
                      <Badge>{product.category}</Badge>
                    </div>
                    {product.colors && product.colors.length > 0 && (
                      <p className="text-xs">الألوان: {product.colors.join(", ")}</p>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <p className="text-xs">المقاسات: {product.sizes.join(", ")}</p>
                    )}
                    <p className="text-sm">المتوفر: {product.stock_quantity}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="banners" className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingBanner ? "تعديل عرض" : "إضافة عرض جديد"}
              </h2>
              <form onSubmit={handleSubmitBanner} className="space-y-4">
                <div>
                  <Label htmlFor="banner-title">عنوان العرض *</Label>
                  <Input
                    id="banner-title"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="banner-description">وصف العرض</Label>
                  <Textarea
                    id="banner-description"
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="banner-image">رابط الصورة</Label>
                  <Input
                    id="banner-image"
                    type="url"
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="banner-link">الرابط (عند الضغط على العرض)</Label>
                  <Input
                    id="banner-link"
                    type="url"
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="banner-active"
                    checked={bannerForm.is_active}
                    onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  />
                  <Label htmlFor="banner-active">عرض نشط</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {editingBanner ? "تحديث العرض" : "إضافة العرض"}
                  </Button>
                  {editingBanner && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingBanner(null);
                        resetBannerForm();
                      }}
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <div className="space-y-4">
              {banners.map((banner, index) => (
                <Card key={banner.id} className="p-4">
                  <div className="flex items-center gap-4">
                    {banner.image_url && (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{banner.title}</h3>
                      <p className="text-sm text-muted-foreground">{banner.description}</p>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveBanner(banner.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveBanner(banner.id, 'down')}
                        disabled={index === banners.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">طلب #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.status === "pending"
                        ? "قيد الانتظار"
                        : order.status === "confirmed"
                        ? "تم التأكيد"
                        : order.status === "delivered"
                        ? "تم التسليم"
                        : "ملغي"}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">المنتجات:</p>
                      {order.order_items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.product_name} × {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm font-semibold">معلومات التواصل:</p>
                      <p className="text-sm" dir="ltr">
                        {order.phone}
                      </p>
                      <p className="text-sm mt-2 font-semibold">العنوان:</p>
                      <p className="text-sm">{order.delivery_address}</p>
                      {order.notes && (
                        <>
                          <p className="text-sm mt-2 font-semibold">ملاحظات:</p>
                          <p className="text-sm whitespace-pre-line">{order.notes}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm">المبلغ: {order.total_amount.toFixed(2)} ج.م</p>
                      <p className="text-sm">الشحن: {order.shipping_cost.toFixed(2)} ج.م</p>
                      <p className="font-bold">الإجمالي: {order.final_amount.toFixed(2)} ج.م</p>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                        >
                          تأكيد الطلب
                        </Button>
                      )}
                      {order.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                        >
                          تم التسليم
                        </Button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                        >
                          إلغاء
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">لا توجد طلبات حالياً</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

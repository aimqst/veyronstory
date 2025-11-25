import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Session } from "@supabase/supabase-js";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  image_url: string;
  category: string;
  stock_quantity: number;
};

type Category = "الكل" | "دفعة الظلام" | "دفعة النخبة" | "دفعة الحلال";

const Index = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("الكل");
  const [session, setSession] = useState<Session | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    address: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    let query = supabase.from("products").select("*");

    if (selectedCategory !== "الكل") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("حدث خطأ في تحميل المنتجات");
    } else {
      setProducts(data || []);
    }
  };

  const calculateFinalPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  const handleBuyClick = (product: Product) => {
    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (product.stock_quantity === 0) {
      toast.error("هذا المنتج غير متوفر حالياً");
      return;
    }

    setSelectedProduct(product);
    setOrderDialogOpen(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !session) return;

    if (!orderData.address || !orderData.phone) {
      toast.error("يرجى إدخال العنوان ورقم الهاتف");
      return;
    }

    const finalPrice = calculateFinalPrice(
      selectedProduct.price,
      selectedProduct.discount_percentage
    );
    const shippingCost = finalPrice * 0.01; // 1% من الإجمالي
    const totalAmount = finalPrice + shippingCost;

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          total_amount: finalPrice,
          shipping_cost: shippingCost,
          final_amount: totalAmount,
          delivery_address: orderData.address,
          phone: orderData.phone,
          notes: orderData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: 1,
        unit_price: selectedProduct.price,
        discount_percentage: selectedProduct.discount_percentage,
        total_price: finalPrice,
      });

      if (itemError) throw itemError;

      // إنشاء رسالة واتساب
      const whatsappMessage = `
🛍️ *طلب جديد من Veyron*

📦 *بيانات المنتج:*
المنتج: ${selectedProduct.name}
السعر: ${finalPrice.toFixed(2)} ج.م
مصاريف الشحن: ${shippingCost.toFixed(2)} ج.م
الإجمالي: ${totalAmount.toFixed(2)} ج.م

👤 *بيانات العميل:*
البريد الإلكتروني: ${session.user.email}
رقم الهاتف: ${orderData.phone}
العنوان: ${orderData.address}
${orderData.notes ? `ملاحظات: ${orderData.notes}` : ''}

🔢 *رقم الطلب:* ${order.id}
      `.trim();

      const whatsappUrl = `https://wa.me/201147124165?text=${encodeURIComponent(whatsappMessage)}`;

      toast.success(
        "تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً. أنت ملزم بأخذ المنتج ودفع المبلغ."
      );
      
      // فتح واتساب
      window.open(whatsappUrl, '_blank');
      
      setOrderDialogOpen(false);
      setOrderData({ address: "", phone: "", notes: "" });
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error("حدث خطأ في إرسال الطلب");
    }
  };

  const categories: Category[] = ["الكل", "دفعة الظلام", "دفعة النخبة", "دفعة الحلال"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* القسم الرئيسي */}
        <section className="text-center space-y-8 mb-16 animate-fade-in-up">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              أهلا وسهلا بك في Veyron، العلامة الفاخرة للهوديز الشتوية
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              الخامات ميلتون قطن سفنجي بميزة معالجة ضد الوبر وبالنسبة للطباعة فهي من أعلى الطباعات
              نوع ديجيتال عالي الجودة متاح التصاميم المخصصة
            </p>
          </div>
        </section>

        {/* الفئات */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`text-lg px-6 py-6 hover-scale transition-all duration-300 ${
                selectedCategory === category 
                  ? 'shadow-luxury animate-pulse-slow' 
                  : 'hover:shadow-card'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* عرض المنتجات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="overflow-hidden shadow-card hover-glow animate-scale-in bg-gradient-to-br from-card to-accent/10 border-2 border-accent/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {product.image_url && (
                <div className="relative aspect-square overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-2"
                  />
                  {product.discount_percentage > 0 && (
                    <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-3 py-1 animate-float shadow-luxury z-20">
                      خصم {product.discount_percentage}%
                    </Badge>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                      <Badge className="text-xl px-4 py-2">غير متوفر</Badge>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-muted-foreground">{product.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {product.discount_percentage > 0 ? (
                    <>
                      <span className="text-3xl font-bold">
                        {calculateFinalPrice(product.price, product.discount_percentage).toFixed(
                          2
                        )}{" "}
                        ج.م
                      </span>
                      <span className="text-xl text-muted-foreground line-through">
                        {product.price} ج.م
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">{product.price} ج.م</span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  المتوفر: {product.stock_quantity} قطعة
                </p>

                <Button
                  className="w-full text-lg py-6 hover-scale shadow-luxury hover:shadow-hover transition-all duration-300"
                  onClick={() => handleBuyClick(product)}
                  disabled={product.stock_quantity === 0}
                >
                  شراء الآن
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-muted-foreground">لا توجد منتجات في هذه الفئة حالياً</p>
          </div>
        )}
      </main>

      {/* Dialog للطلب */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">إتمام الطلب</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <div className="space-y-2 text-lg">
                  <p className="font-bold text-foreground">{selectedProduct.name}</p>
                  <p>
                    السعر: {calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage).toFixed(2)} ج.م
                  </p>
                  <p>
                    مصاريف الشحن (1%):{" "}
                    {(
                      calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage) *
                      0.01
                    ).toFixed(2)}{" "}
                    ج.م
                  </p>
                  <p className="font-bold text-foreground">
                    الإجمالي:{" "}
                    {(
                      calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage) *
                      1.01
                    ).toFixed(2)}{" "}
                    ج.م
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">عنوان التوصيل بالتفصيل *</Label>
              <Textarea
                id="address"
                placeholder="اكتب عنوانك بالتفصيل..."
                value={orderData.address}
                onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={orderData.phone}
                onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                required
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أي ملاحظات إضافية..."
                value={orderData.notes}
                onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-lg bg-accent/30 border border-accent">
              <p className="text-sm font-semibold">طرق الدفع:</p>
              <p className="text-sm" dir="ltr">
                فودافون كاش: 01014491856
              </p>
              <p className="text-sm" dir="ltr">
                إنستا باي: 01146202848
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              * سيتم إرسال الأوردر لك وأنت ملزم بأخذه ودفع المال
            </p>

            <Button onClick={handleSubmitOrder} className="w-full text-lg py-6">
              تأكيد الطلب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
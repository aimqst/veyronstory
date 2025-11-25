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
  colors?: string[];
  sizes?: string[];
};

type Banner = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  display_order: number;
};

type Category = "الكل" | "دفعة الظلام" | "دفعة النخبة" | "دفعة الحلال" | "دفعة الأنمي" | "دفعة TST";

const Index = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("الكل");
  const [session, setSession] = useState<Session | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    address: "",
    phone: "",
    notes: "",
    selectedColor: "",
    selectedSize: "",
    couponCode: "",
  });
  const [appliedDiscount, setAppliedDiscount] = useState(0);

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
    loadBanners();
  }, [selectedCategory]);

  const loadBanners = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (!error && data) {
      setBanners(data);
    }
  };

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

  const handleSubmitOrder = async (sendToWhatsApp: boolean = false) => {
    if (!selectedProduct || !session) return;

    if (!orderData.address || !orderData.phone) {
      toast.error("يرجى إدخال العنوان ورقم الهاتف");
      return;
    }

    let finalPrice = calculateFinalPrice(
      selectedProduct.price,
      selectedProduct.discount_percentage
    );
    
    // Apply coupon discount
    if (appliedDiscount > 0) {
      finalPrice = finalPrice - (finalPrice * appliedDiscount / 100);
    }
    
    const shippingCost = finalPrice * 0.01;
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
          notes: `${orderData.notes}${orderData.selectedColor ? `\nاللون: ${orderData.selectedColor}` : ''}${orderData.selectedSize ? `\nالمقاس: ${orderData.selectedSize}` : ''}`,
          coupon_code: orderData.couponCode || null,
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

      // Check if this user was referred and this is their first order
      const { data: referralData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_id", session.user.id)
        .eq("used", false)
        .single();

      if (referralData) {
        // Mark referral as used
        await supabase
          .from("referrals")
          .update({ used: true })
          .eq("id", referralData.id);

        // Create a 15% discount coupon for the referrer
        const couponCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await supabase.from("discount_coupons").insert({
          code: couponCode,
          discount_percentage: 15,
          max_uses: 1,
          is_active: true,
          created_by: referralData.referrer_id,
        });

        toast.success("🎉 صديقك الذي دعاك حصل على كوبون خصم 15%!");
      }

      if (sendToWhatsApp) {
        const whatsappMessage = `
🛍️ *طلب جديد من Veyron*

📦 *بيانات المنتج:*
المنتج: ${selectedProduct.name}
${orderData.selectedColor ? `اللون: ${orderData.selectedColor}` : ''}
${orderData.selectedSize ? `المقاس: ${orderData.selectedSize}` : ''}
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
        window.open(whatsappUrl, '_blank');
      }

      toast.success(
        "تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً. أنت ملزم بأخذ المنتج ودفع المبلغ."
      );
      
      setOrderDialogOpen(false);
      setOrderData({ address: "", phone: "", notes: "", selectedColor: "", selectedSize: "", couponCode: "" });
      setSelectedProduct(null);
      setAppliedDiscount(0);
    } catch (error: any) {
      toast.error("حدث خطأ في إرسال الطلب");
    }
  };

  const categories: Category[] = [
    "الكل",
    "دفعة الظلام",
    "دفعة النخبة",
    "دفعة الحلال",
    "دفعة الأنمي",
    "دفعة TST"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* بانر العروض */}
        {banners.length > 0 && (
          <div className="mb-12 space-y-4">
            {banners.map((banner) => (
              <Card
                key={banner.id}
                className="overflow-hidden shadow-luxury hover-glow cursor-pointer animate-fade-in"
                onClick={() => banner.link && window.open(banner.link, '_blank')}
              >
                <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                  {banner.image_url && (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 text-center md:text-right">
                    <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                    {banner.description && (
                      <p className="text-lg text-muted-foreground">{banner.description}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

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
                  ? 'bg-gradient-ice shadow-luxury' 
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
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    loading="lazy"
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      imageRendering: 'auto'
                    }}
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

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">الألوان المتاحة:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <Badge key={color} variant="secondary">{color}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">المقاسات المتاحة:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <Badge key={size} variant="secondary">{size}</Badge>
                      ))}
                    </div>
                  </div>
                )}

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

                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-lg py-6 hover-scale shadow-luxury hover:shadow-hover transition-all duration-300"
                    onClick={() => navigate(`/product/${product.id}`)}
                    variant="outline"
                  >
                    عرض التفاصيل
                  </Button>
                  <Button
                    className="flex-1 text-lg py-6 hover-scale shadow-luxury hover:shadow-hover transition-all duration-300"
                    onClick={() => handleBuyClick(product)}
                    disabled={product.stock_quantity === 0}
                  >
                    شراء الآن
                  </Button>
                </div>
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
            {selectedProduct?.colors && selectedProduct.colors.length > 0 && (
              <div>
                <Label htmlFor="color">اختر اللون *</Label>
                <select
                  id="color"
                  className="w-full p-2 border rounded-md bg-background"
                  value={orderData.selectedColor}
                  onChange={(e) => setOrderData({ ...orderData, selectedColor: e.target.value })}
                  required
                >
                  <option value="">اختر اللون...</option>
                  {selectedProduct.colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
              <div>
                <Label htmlFor="size">اختر المقاس *</Label>
                <select
                  id="size"
                  className="w-full p-2 border rounded-md bg-background"
                  value={orderData.selectedSize}
                  onChange={(e) => setOrderData({ ...orderData, selectedSize: e.target.value })}
                  required
                >
                  <option value="">اختر المقاس...</option>
                  {selectedProduct.sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

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

            <div>
              <Label htmlFor="coupon">كود الخصم (اختياري)</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="أدخل كود الخصم"
                  value={orderData.couponCode}
                  onChange={(e) =>
                    setOrderData({ ...orderData, couponCode: e.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!orderData.couponCode.trim()) {
                      toast.error("أدخل كود الخصم أولاً");
                      return;
                    }
                    
                    const { data: coupon } = await supabase
                      .from("discount_coupons")
                      .select("*")
                      .eq("code", orderData.couponCode.trim())
                      .eq("is_active", true)
                      .single();
                    
                    if (!coupon) {
                      toast.error("كود الخصم غير صالح");
                      return;
                    }
                    
                    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
                      toast.error("تم استخدام هذا الكود الحد الأقصى من المرات");
                      return;
                    }
                    
                    setAppliedDiscount(coupon.discount_percentage);
                    toast.success(`تم تطبيق خصم ${coupon.discount_percentage}%`);
                  }}
                >
                  تطبيق
                </Button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ تم تطبيق خصم {appliedDiscount}%
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between">
                <span>سعر المنتج:</span>
                <span className="font-bold">
                  {selectedProduct && calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage).toFixed(2)} ج.م
                </span>
              </div>
              {appliedDiscount > 0 && selectedProduct && (
                <div className="flex justify-between text-green-600">
                  <span>خصم الكوبون ({appliedDiscount}%):</span>
                  <span className="font-bold">
                    -{(calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage) * appliedDiscount / 100).toFixed(2)} ج.م
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>مصاريف الشحن (1%):</span>
                <span className="font-bold">
                  {selectedProduct && (calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage) * (1 - appliedDiscount / 100) * 0.01).toFixed(2)} ج.م
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>الإجمالي:</span>
                <span>
                  {selectedProduct && (calculateFinalPrice(selectedProduct.price, selectedProduct.discount_percentage) * (1 - appliedDiscount / 100) * 1.01).toFixed(2)} ج.م
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              * سيتم إرسال الأوردر لك وأنت ملزم بأخذه ودفع المال
            </p>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => handleSubmitOrder(false)} 
                className="w-full text-lg py-6"
                variant="outline"
              >
                تأكيد الطلب عادي
              </Button>
              <Button 
                onClick={() => handleSubmitOrder(true)} 
                className="w-full text-lg py-6"
              >
                تأكيد الطلب عبر واتساب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

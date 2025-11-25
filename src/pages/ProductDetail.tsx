import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Heart, MessageCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Session } from "@supabase/supabase-js";
import { ProductImage } from "@/components/ProductImage";

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

type Comment = {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  parent_comment_id: string | null;
  replies?: Comment[];
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
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
    if (id) {
      loadProduct();
      loadRatings();
      loadLikes();
      loadComments();
      if (session) {
        loadUserRating();
        checkIfLiked();
      }
    }
  }, [id, session]);

  const loadProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("خطأ في تحميل المنتج");
      navigate("/");
    } else {
      setProduct(data);
    }
  };

  const loadRatings = async () => {
    const { data, error } = await supabase
      .from("product_ratings")
      .select("rating")
      .eq("product_id", id);

    if (!error && data) {
      const total = data.length;
      const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
      setTotalRatings(total);
      setAverageRating(total > 0 ? sum / total : 0);
    }
  };

  const loadUserRating = async () => {
    if (!session) return;
    
    const { data } = await supabase
      .from("product_ratings")
      .select("rating")
      .eq("product_id", id)
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setUserRating(data.rating);
      setRating(data.rating);
    }
  };

  const loadLikes = async () => {
    const { count } = await supabase
      .from("product_likes")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    setLikesCount(count || 0);
  };

  const checkIfLiked = async () => {
    if (!session) return;

    const { data } = await supabase
      .from("product_likes")
      .select("id")
      .eq("product_id", id)
      .eq("user_id", session.user.id)
      .single();

    setIsLiked(!!data);
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("product_comments")
      .select("*")
      .eq("product_id", id)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from("product_comments")
            .select("*")
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );
      setComments(commentsWithReplies);
    }
  };

  const handleRating = async (value: number) => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    setRating(value);

    if (userRating > 0) {
      const { error } = await supabase
        .from("product_ratings")
        .update({ rating: value })
        .eq("product_id", id)
        .eq("user_id", session.user.id);

      if (error) {
        toast.error("خطأ في تحديث التقييم");
      } else {
        toast.success("تم تحديث التقييم بنجاح");
        setUserRating(value);
        loadRatings();
      }
    } else {
      const { error } = await supabase
        .from("product_ratings")
        .insert({ product_id: id, user_id: session.user.id, rating: value });

      if (error) {
        toast.error("خطأ في إضافة التقييم");
      } else {
        toast.success("تم إضافة التقييم بنجاح");
        setUserRating(value);
        loadRatings();
      }
    }
  };

  const handleLike = async () => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from("product_likes")
        .delete()
        .eq("product_id", id)
        .eq("user_id", session.user.id);

      if (!error) {
        setIsLiked(false);
        setLikesCount(likesCount - 1);
      }
    } else {
      const { error } = await supabase
        .from("product_likes")
        .insert({ product_id: id, user_id: session.user.id });

      if (!error) {
        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    }
  };

  const handleAddComment = async () => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (!newComment.trim()) {
      toast.error("الرجاء كتابة تعليق");
      return;
    }

    const { error } = await supabase.from("product_comments").insert({
      product_id: id,
      user_id: session.user.id,
      comment_text: newComment,
    });

    if (error) {
      toast.error("خطأ في إضافة التعليق");
    } else {
      toast.success("تم إضافة التعليق بنجاح");
      setNewComment("");
      loadComments();
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (!replyText.trim()) {
      toast.error("الرجاء كتابة رد");
      return;
    }

    const { error } = await supabase.from("product_comments").insert({
      product_id: id,
      user_id: session.user.id,
      comment_text: replyText,
      parent_comment_id: parentId,
    });

    if (error) {
      toast.error("خطأ في إضافة الرد");
    } else {
      toast.success("تم إضافة الرد بنجاح");
      setReplyText("");
      setReplyTo(null);
      loadComments();
    }
  };

  const calculateFinalPrice = (price: number, discount: number): number => {
    return price - (price * discount) / 100;
  };

  const handleBuyClick = () => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (product && product.stock_quantity <= 0) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    setOrderDialogOpen(true);
  };

  const handleSubmitOrder = async (sendToWhatsApp: boolean = false) => {
    if (!orderData.address.trim() || !orderData.phone.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!session || !product) return;

    let finalPrice = calculateFinalPrice(product.price, product.discount_percentage);
    let couponDiscount = appliedDiscount;
    
    // Apply coupon discount
    if (couponDiscount > 0) {
      finalPrice = finalPrice - (finalPrice * couponDiscount / 100);
    }
    
    const shippingCost = 30;
    const totalAmount = finalPrice;
    const finalAmount = totalAmount + shippingCost;

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: session.user.id,
        delivery_address: orderData.address,
        phone: orderData.phone,
        notes: orderData.notes,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        final_amount: finalAmount,
        coupon_code: orderData.couponCode || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      toast.error("حدث خطأ أثناء إنشاء الطلب");
      return;
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: orderResult.id,
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      discount_percentage: product.discount_percentage,
      total_price: finalPrice,
    });

    if (itemError) {
      toast.error("حدث خطأ أثناء حفظ تفاصيل الطلب");
      return;
    }

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
      const message = `طلب جديد:
المنتج: ${product.name}
${orderData.selectedColor ? `اللون: ${orderData.selectedColor}` : ""}
${orderData.selectedSize ? `المقاس: ${orderData.selectedSize}` : ""}
السعر: ${finalPrice} جنيه
الشحن: ${shippingCost} جنيه
الإجمالي: ${finalAmount} جنيه
العنوان: ${orderData.address}
الهاتف: ${orderData.phone}
${orderData.notes ? `ملاحظات: ${orderData.notes}` : ""}`;

      const whatsappUrl = `https://wa.me/201558800803?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }

    toast.success("تم تأكيد الطلب بنجاح!");
    setOrderDialogOpen(false);
    setOrderData({
      address: "",
      phone: "",
      notes: "",
      selectedColor: "",
      selectedSize: "",
      couponCode: "",
    });
    setAppliedDiscount(0);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice(product.price, product.discount_percentage);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          العودة للرئيسية
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* صورة المنتج */}
          <div className="relative aspect-square overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
            {product.discount_percentage > 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                خصم {product.discount_percentage}%
              </Badge>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <Badge variant="secondary" className="mb-4">
                {product.category}
              </Badge>
              
              {/* التقييم والإعجاب */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer transition-colors ${
                          star <= (rating || averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                        onClick={() => handleRating(star)}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} من 5
                  </span>
                </div>
                
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>

            <p className="text-muted-foreground text-lg">{product.description}</p>

            {/* الألوان */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <Label className="mb-2 block">الألوان المتاحة:</Label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <Badge key={color} variant="outline">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* المقاسات */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <Label className="mb-2 block">المقاسات المتاحة:</Label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <Badge key={size} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* السعر */}
            <div className="space-y-2">
              {product.discount_percentage > 0 ? (
                <>
                  <p className="text-2xl text-muted-foreground line-through">
                    {product.price} جنيه
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {finalPrice} جنيه
                  </p>
                </>
              ) : (
                <p className="text-4xl font-bold text-foreground">
                  {product.price} جنيه
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                الكمية المتاحة: {product.stock_quantity}
              </p>
            </div>

            <Button
              onClick={handleBuyClick}
              disabled={product.stock_quantity <= 0}
              className="w-full text-lg py-6"
              size="lg"
            >
              {product.stock_quantity > 0 ? "اشتري الآن" : "غير متوفر"}
            </Button>
          </div>
        </div>

        {/* قسم التعليقات */}
        <Card className="mt-12 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            التعليقات
          </h2>

          {/* إضافة تعليق جديد */}
          <div className="mb-8 space-y-4">
            <Textarea
              placeholder="اكتب تعليقك هنا..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-24"
            />
            <Button onClick={handleAddComment}>
              <Send className="w-4 h-4 ml-2" />
              إضافة تعليق
            </Button>
          </div>

          {/* عرض التعليقات */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <Card className="p-4 bg-muted/30">
                  <p className="text-foreground mb-2">{comment.comment_text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("ar-EG")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    >
                      رد
                    </Button>
                  </div>

                  {/* نموذج الرد */}
                  {replyTo === comment.id && (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="اكتب ردك هنا..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-20"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                          إرسال الرد
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyText("");
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {/* عرض الردود */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mr-8 space-y-2">
                    {comment.replies.map((reply) => (
                      <Card key={reply.id} className="p-3 bg-accent/30">
                        <p className="text-sm text-foreground mb-1">
                          {reply.comment_text}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString("ar-EG")}
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                لا توجد تعليقات بعد. كن أول من يعلق!
              </p>
            )}
          </div>
        </Card>
      </main>

      {/* نافذة تأكيد الطلب */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>تأكيد الطلب - {product.name}</DialogTitle>
            <DialogDescription>
              يرجى ملء البيانات التالية لإتمام الطلب
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 overflow-y-auto flex-1 px-1">
            <div>
              <Label htmlFor="address">عنوان التوصيل *</Label>
              <Textarea
                id="address"
                placeholder="أدخل عنوان التوصيل بالتفصيل"
                value={orderData.address}
                onChange={(e) =>
                  setOrderData({ ...orderData, address: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="أدخل رقم الهاتف"
                value={orderData.phone}
                onChange={(e) =>
                  setOrderData({ ...orderData, phone: e.target.value })
                }
              />
            </div>

            {product.colors && product.colors.length > 0 && (
              <div>
                <Label htmlFor="color">اللون</Label>
                <select
                  id="color"
                  className="w-full p-2 border rounded-md bg-background"
                  value={orderData.selectedColor}
                  onChange={(e) =>
                    setOrderData({ ...orderData, selectedColor: e.target.value })
                  }
                >
                  <option value="">اختر اللون</option>
                  {product.colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <Label htmlFor="size">المقاس</Label>
                <select
                  id="size"
                  className="w-full p-2 border rounded-md bg-background"
                  value={orderData.selectedSize}
                  onChange={(e) =>
                    setOrderData({ ...orderData, selectedSize: e.target.value })
                  }
                >
                  <option value="">اختر المقاس</option>
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                placeholder="أي ملاحظات إضافية (اختياري)"
                value={orderData.notes}
                onChange={(e) =>
                  setOrderData({ ...orderData, notes: e.target.value })
                }
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

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>سعر المنتج:</span>
                <span className="font-bold">{calculateFinalPrice(product.price, product.discount_percentage)} جنيه</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>خصم الكوبون ({appliedDiscount}%):</span>
                  <span className="font-bold">-{(calculateFinalPrice(product.price, product.discount_percentage) * appliedDiscount / 100).toFixed(2)} جنيه</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>تكلفة الشحن:</span>
                <span className="font-bold">30 جنيه</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>الإجمالي:</span>
                <span>{(calculateFinalPrice(product.price, product.discount_percentage) * (1 - appliedDiscount / 100) + 30).toFixed(2)} جنيه</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSubmitOrder(false)}
                className="flex-1"
              >
                تأكيد الطلب
              </Button>
              <Button
                onClick={() => handleSubmitOrder(true)}
                variant="secondary"
                className="flex-1"
              >
                تأكيد عبر واتساب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Users, Gift } from "lucide-react";
import { Session } from "@supabase/supabase-js";

type Referral = {
  id: string;
  referred_id: string | null;
  used: boolean;
  created_at: string;
};

type Coupon = {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  valid_until: string | null;
  created_at: string;
};

const Referral = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setSession(session);
    await loadReferralCode(session.user.id);
    await loadReferrals(session.user.id);
    await loadCoupons(session.user.id);
    await loadReferralDiscount(session.user.id);
    setLoading(false);
  };

  const loadReferralCode = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .single();

    if (data?.referral_code) {
      setReferralCode(data.referral_code);
    }
  };

  const loadReferrals = async (userId: string) => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReferrals(data);
    }
  };

  const loadCoupons = async (userId: string) => {
    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .eq("created_by", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCoupons(data);
    }
  };

  const loadReferralDiscount = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("referral_discount_percentage")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setReferralDiscount(data.referral_discount_percentage || 0);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ كود الخصم");
  };

  const successfulReferrals = referrals.filter((r) => r.used).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">ادعُ أصدقاءك واحصل على مكافآت</h1>
          <p className="text-xl text-muted-foreground">
            شارك كودك الخاص مع الأصدقاء واحصل على خصم 15% عندما يقومون بالشراء
          </p>
        </div>

        {/* إحصائيات */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="text-3xl font-bold mb-2">{successfulReferrals}</h3>
            <p className="text-muted-foreground">إحالات ناجحة</p>
          </Card>
          <Card className="p-6 text-center">
            <Gift className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h3 className="text-3xl font-bold mb-2">{successfulReferrals * 15}%</h3>
            <p className="text-muted-foreground">إجمالي الخصومات المكتسبة</p>
          </Card>
        </div>

        {/* كود الإحالة */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">كود الإحالة الخاص بك</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="text-center text-2xl font-mono font-bold"
              />
              <Button size="icon" onClick={() => {
                navigator.clipboard.writeText(referralCode);
                toast.success("تم نسخ كود الإحالة");
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              أرسل هذا الكود لأصدقائك ليدخلوه عند إنشاء الحساب
            </p>
          </div>
        </Card>

        {/* رصيد الخصم المتاح */}
        {referralDiscount > 0 && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">🎉 لديك خصم متاح!</h2>
              <div className="text-6xl font-bold text-primary">{referralDiscount}%</div>
              <p className="text-xl text-muted-foreground">
                سيتم تطبيق هذا الخصم تلقائياً على طلبك القادم
              </p>
              <p className="text-sm text-muted-foreground">
                الخصم يظهر مباشرة عند إضافة المنتج للسلة
              </p>
            </div>
          </Card>
        )}

        {/* الكوبونات المتاحة */}
        {coupons.length > 0 && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">🎁 كوبونات الخصم المتاحة لك</h2>
            <div className="space-y-4">
              {coupons.map((coupon) => {
                const isUsed = coupon.current_uses >= (coupon.max_uses || Infinity);
                return (
                  <div
                    key={coupon.id}
                    className={`p-6 rounded-lg border-2 ${
                      isUsed ? "bg-muted/30 border-muted" : "bg-primary/5 border-primary"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold font-mono">{coupon.code}</span>
                          {!isUsed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyCoupon(coupon.code)}
                            >
                              <Copy className="w-4 h-4 ml-2" />
                              نسخ
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-green-600 font-bold">
                            خصم {coupon.discount_percentage}%
                          </span>
                          <span className="text-muted-foreground">
                            الاستخدام: {coupon.current_uses} / {coupon.max_uses || "∞"}
                          </span>
                          {coupon.valid_until && (
                            <span className="text-muted-foreground">
                              صالح حتى: {new Date(coupon.valid_until).toLocaleDateString("ar-EG")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        {isUsed ? (
                          <span className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                            مستخدم
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-green-500/20 text-green-600 rounded-full text-sm font-medium">
                            متاح
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* كيف يعمل */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">كيف يعمل برنامج الإحالة؟</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">شارك كودك</h3>
                <p className="text-muted-foreground">
                  أرسل كود الإحالة الخاص بك لأصدقائك عبر واتساب، فيسبوك، أو أي وسيلة أخرى
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">صديقك يُسجل بالكود</h3>
                <p className="text-muted-foreground">
                  عندما يُدخل صديقك كودك عند إنشاء الحساب ويقوم بعملية شراء
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">احصل على مكافأتك</h3>
                <p className="text-muted-foreground">
                  ستحصل تلقائياً على خصم بنسبة 15% يُطبق تلقائياً على طلبك القادم
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* قائمة الإحالات */}
        {referrals.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">إحالاتك</h2>
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex justify-between items-center p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {referral.used ? "✓ تم الشراء" : "⏳ في الانتظار"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      referral.used
                        ? "bg-green-500/20 text-green-600"
                        : "bg-yellow-500/20 text-yellow-600"
                    }`}
                  >
                    {referral.used ? "نجحت" : "معلقة"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Referral;

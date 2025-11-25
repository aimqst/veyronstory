import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Share2, Users, Gift } from "lucide-react";
import { Session } from "@supabase/supabase-js";

type Referral = {
  id: string;
  referred_id: string | null;
  used: boolean;
  created_at: string;
};

const Referral = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
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

  const getReferralLink = () => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    toast.success("تم نسخ رابط الإحالة");
  };

  const handleShare = async () => {
    const text = `انضم إلي في Veyron Story واحصل على خصم 15%! استخدم كود الإحالة: ${referralCode}`;
    const url = getReferralLink();

    if (navigator.share) {
      try {
        await navigator.share({ title: "Veyron Story", text, url });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
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
            شارك رابطك الخاص مع الأصدقاء واحصل على خصم 15% عندما يقومون بالشراء
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
              <Button size="icon" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={getReferralLink()}
                readOnly
                className="text-sm"
              />
              <Button onClick={handleShare} className="whitespace-nowrap">
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة
              </Button>
            </div>
          </div>
        </Card>

        {/* كيف يعمل */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">كيف يعمل برنامج الإحالة؟</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">شارك رابطك</h3>
                <p className="text-muted-foreground">
                  أرسل رابط الإحالة الخاص بك لأصدقائك عبر واتساب، فيسبوك، أو أي وسيلة أخرى
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">صديقك يشتري</h3>
                <p className="text-muted-foreground">
                  عندما يستخدم صديقك رابطك أو كودك ويقوم بعملية شراء
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
                  ستحصل تلقائياً على كوبون خصم بنسبة 15% يمكنك استخدامه في طلبك التالي
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

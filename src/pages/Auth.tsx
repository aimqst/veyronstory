import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import veyronLogo from "@/assets/veyron-logo.png";

const emailSchema = z.string().email("البريد الإلكتروني غير صحيح");
const passwordSchema = z.string().min(6, "كلمة السر يجب أن تكون 6 أحرف على الأقل");

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({ email: "", password: "", confirmPassword: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      toast.info(`سيتم تسجيلك عن طريق دعوة من صديقك! ستحصل على خصم خاص عند أول عملية شراء`);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(signUpData.email);
      passwordSchema.parse(signUpData.password);

      if (signUpData.password !== signUpData.confirmPassword) {
        toast.error("كلمة السر غير متطابقة");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("البريد الإلكتروني مسجل بالفعل");
        } else {
          toast.error(error.message);
        }
      } else {
        // إذا كان هناك كود إحالة، سجل الإحالة
        if (referralCode && data.user) {
          const { data: referrerProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .single();

          if (referrerProfile) {
            await supabase.from("referrals").insert({
              referrer_id: referrerProfile.id,
              referred_id: data.user.id,
              referral_code: referralCode,
              used: false,
            });
            toast.success("تم تسجيلك عن طريق دعوة صديقك! ستحصلان على خصومات عند أول عملية شراء");
          }
        }

        // تسجيل الدخول تلقائياً بعد إنشاء الحساب
        if (data.session) {
          toast.success("تم إنشاء الحساب وتسجيل الدخول بنجاح!");
          navigate("/");
        } else {
          toast.success("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول");
        }
        setSignUpData({ email: "", password: "", confirmPassword: "" });
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(signInData.email);
      passwordSchema.parse(signInData.password);

      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        toast.error("البريد الإلكتروني أو كلمة السر غير صحيحة");
      } else {
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/10 animate-gradient"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="w-full max-w-md animate-scale-in relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-dark rounded-full blur-xl animate-pulse"></div>
            <img 
              src={veyronLogo} 
              alt="Veyron Logo" 
              className="relative w-32 h-32 rounded-full object-cover border-4 border-primary/30 shadow-luxury animate-float"
            />
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-dark bg-clip-text text-transparent animate-fade-in">Veyron</h1>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>اللبس القوة، وحس بالفخامة</p>
        </div>

        <Card className="shadow-luxury backdrop-blur-xl bg-card/80 border-primary/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl text-center font-bold bg-gradient-dark bg-clip-text text-transparent">مرحباً بك</CardTitle>
            <CardDescription className="text-center text-base">
              سجل دخولك أو أنشئ حساب جديد للاستمتاع بتجربة Veyron الفاخرة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">البريد الإلكتروني</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="example@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      dir="ltr"
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">كلمة السر</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  {referralCode && (
                    <div className="bg-primary/10 p-3 rounded-lg text-center">
                      <p className="text-sm font-medium text-primary">
                        🎉 تم الدعوة بواسطة صديقك! ستحصل على خصم خاص
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">البريد الإلكتروني</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      dir="ltr"
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">كلمة السر</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium">تأكيد كلمة السر</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                      }
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" 
                    disabled={isLoading}
                  >
                    {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
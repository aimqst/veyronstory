import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const phoneSchema = z.string().regex(/^01[0-2,5]{1}[0-9]{8}$/, "رقم الهاتف غير صحيح");
const passwordSchema = z.string().min(6, "كلمة السر يجب أن تكون 6 أحرف على الأقل");

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({ phone: "", password: "", confirmPassword: "" });
  const [signInData, setSignInData] = useState({ phone: "", password: "" });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من صحة البيانات
      phoneSchema.parse(signUpData.phone);
      passwordSchema.parse(signUpData.password);

      if (signUpData.password !== signUpData.confirmPassword) {
        toast.error("كلمة السر غير متطابقة");
        setIsLoading(false);
        return;
      }

      // إنشاء بريد إلكتروني وهمي من رقم الهاتف
      const email = `${signUpData.phone}@veyron-store.local`;

      const { error } = await supabase.auth.signUp({
        email,
        password: signUpData.password,
        options: {
          data: {
            phone: signUpData.phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("رقم الهاتف مسجل بالفعل");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول");
        setSignUpData({ phone: "", password: "", confirmPassword: "" });
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
      phoneSchema.parse(signInData.phone);
      passwordSchema.parse(signInData.password);

      const email = `${signInData.phone}@veyron-store.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: signInData.password,
      });

      if (error) {
        toast.error("رقم الهاتف أو كلمة السر غير صحيحة");
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
    <div className="min-h-screen flex items-center justify-center p-4 gradient-ice">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-dark flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-4xl font-bold text-primary-foreground">V</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Veyron</h1>
          <p className="text-muted-foreground">اللبس القوة، وحس بالفخامة</p>
        </div>

        <Card className="shadow-luxury">
          <CardHeader>
            <CardTitle className="text-2xl text-center">مرحباً بك</CardTitle>
            <CardDescription className="text-center">
              سجل دخولك أو أنشئ حساب جديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="signup">حساب جديد</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-phone">رقم الهاتف</Label>
                    <Input
                      id="signin-phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={signInData.phone}
                      onChange={(e) => setSignInData({ ...signInData, phone: e.target.value })}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">كلمة السر</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">رقم الهاتف</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">كلمة السر</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">تأكيد كلمة السر</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
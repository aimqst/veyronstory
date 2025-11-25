import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  Share2, 
  ShoppingBag, 
  Gift, 
  Tag,
  Users,
  ArrowRight
} from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">كيف يعمل نظام الإحالة والخصومات؟</h1>
          <p className="text-xl text-muted-foreground">
            شرح شامل لكل ميزات الموقع خطوة بخطوة
          </p>
        </div>

        {/* نظام الإحالة */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-10 h-10 text-primary" />
            <h2 className="text-4xl font-bold">نظام الإحالة (دعوة الأصدقاء)</h2>
          </div>

          <div className="grid gap-8 mb-8">
            <Card className="p-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <Share2 className="w-6 h-6" />
                    احصل على رابط الإحالة الخاص بك
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    بعد تسجيل الدخول، اذهب إلى صفحة "دعوة الأصدقاء" من القائمة العلوية
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="font-mono text-sm">
                      مثال للرابط: https://yoursite.com/?ref=ABC12345
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    شارك الرابط مع أصدقائك
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    أرسل الرابط لأصدقائك عبر:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      واتساب
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      فيسبوك
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      أي وسيلة تواصل أخرى
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    صديقك يسجل حساب جديد
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    عندما يفتح صديقك الرابط الخاص بك ويسجل حساب جديد، سيتم ربط حسابه بحسابك تلقائياً
                  </p>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <p className="text-green-600 font-medium">
                      ✓ سيرى صديقك رسالة تؤكد أنه تم دعوته بواسطتك
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" />
                    صديقك يشتري لأول مرة
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    عندما يقوم صديقك بأول عملية شراء، يحدث التالي:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      يتم تأكيد الإحالة
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      يتم إنشاء كوبون خصم 15% خاص بك تلقائياً
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">تحصل أنت على خصم 15%!</h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    سيتم إنشاء كوبون خصم خاص بك يمكنك استخدامه في طلبك التالي
                  </p>
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">مثال للكوبون:</p>
                    <p className="font-mono text-xl font-bold">REF7A3B2C</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/20">
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span>⚠️</span>
              نقاط مهمة:
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>الخصم يأتي عند <strong>أول عملية شراء فقط</strong> للشخص المُحال</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>لو صديقك اشترى مرة ثانية أو ثالثة، <strong>لن تحصل على خصومات إضافية</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>كل صديق جديد يشتري = <strong>كوبون خصم 15% جديد لك</strong></span>
              </li>
            </ul>
          </div>
        </div>

        {/* أكواد الخصم */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="w-10 h-10 text-primary" />
            <h2 className="text-4xl font-bold">أكواد الخصم</h2>
          </div>

          <Card className="p-8 mb-6">
            <h3 className="text-2xl font-bold mb-4">كيف تستخدم كود الخصم؟</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <p className="text-lg text-muted-foreground pt-1">
                  اختر المنتج الذي تريده واضغط "شراء الآن"
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <p className="text-lg text-muted-foreground pt-1">
                  في نافذة إتمام الطلب، ستجد حقل "كود الخصم"
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <p className="text-lg text-muted-foreground pt-1">
                  اكتب الكود واضغط "تطبيق"
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">4</span>
                </div>
                <p className="text-lg text-muted-foreground pt-1">
                  سيتم خصم النسبة من السعر الإجمالي مباشرة
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-bold text-lg mb-3">أنواع أكواد الخصم:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>أكواد الإحالة:</strong> تحصل عليها تلقائياً عند دعوة الأصدقاء</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>أكواد خاصة:</strong> يتم الإعلان عنها في العروض والمناسبات</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-lg mb-3">معلومات إضافية:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>بعض الأكواد لها حد أقصى للاستخدامات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>بعض الأكواد لها تاريخ صلاحية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>يمكنك استخدام كود واحد فقط في كل طلب</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* التقييمات */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Gift className="w-10 h-10 text-primary" />
            <h2 className="text-4xl font-bold">نظام التقييمات</h2>
          </div>

          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-4">التقييمات تظهر بالمتوسط (مثل 4.8 من 5)</h3>
            <p className="text-lg text-muted-foreground mb-4">
              عندما تقيّم منتج:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>يتم حساب متوسط كل التقييمات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>المتوسط يظهر بجانب النجوم (مثلاً 4.8 من 5)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>يمكنك تعديل تقييمك في أي وقت</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/referral")}
            className="text-lg px-8 py-6"
          >
            <Share2 className="w-5 h-5 ml-2" />
            ابدأ بدعوة أصدقائك الآن
          </Button>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;

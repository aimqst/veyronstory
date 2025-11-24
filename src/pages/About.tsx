import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
          {/* العنوان الرئيسي */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">نبذة عن الخامات والطباعة</h1>
            <p className="text-xl text-muted-foreground">
              أكثر الخامات الفاخرة متوفرة لدينا فقط في Veyron
            </p>
          </div>

          {/* قسم الخامة */}
          <Card className="p-8 shadow-luxury hover-lift">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">الخامة: ميلتون قطني فاخر معالج بالكامل</h2>
                <p className="text-lg text-muted-foreground">
                  نعتمد في صناعة منتجاتنا على خامة ميلتون قطني سفنجي عالية الجودة، معروفة بنعومتها
                  ومرونتها وثباتها. الخامة تُختار بعناية لضمان راحة كاملة أثناء الارتداء، فهي تجمع بين:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">✨ ملمس قطني ناعم</h3>
                  <p className="text-muted-foreground">
                    يمنح إحساس فخم طوال اليوم مع راحة استثنائية
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🌟 طبقة سفنج خفيفة</h3>
                  <p className="text-muted-foreground">
                    توفر دفء معتدل بدون ثقل، وتحافظ على شكل القطعة لفترة طويلة
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🛡️ معالجة ضد الوبر</h3>
                  <p className="text-muted-foreground">
                    تمنع ظهور الكرات الصغيرة التي تقلل من جودة المظهر، خصوصاً بعد الغسيل المتكرر
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">💎 ثبات عالي</h3>
                  <p className="text-muted-foreground">
                    في اللون والنسيج بحيث تفضل القطعة في شكلها الأصلي لأطول وقت ممكن
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🔒 مقاومة للانكماش</h3>
                  <p className="text-muted-foreground">
                    والتمدّد بفضل معالجة الألياف بشكل يحافظ على مقاس القطعة حتى بعد الاستخدام المستمر
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🌬️ تهوية ممتازة</h3>
                  <p className="text-muted-foreground">
                    تمنع الاحتباس الحراري وتبقي الجسم مرتاح في مختلف الفصول
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-accent/30 border-2 border-accent">
                <p className="text-lg font-semibold text-center">
                  باختصار، الخامة مش مجرد "ميلتون" عادي؛ هي خامة محسّنة ومختارة بمستوى يناسب المنتجات
                  الفاخرة.
                </p>
              </div>
            </div>
          </Card>

          {/* قسم الطباعة */}
          <Card className="p-8 shadow-luxury hover-lift">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">الطباعة: DTF عالية الدقة والجودة</h2>
                <p className="text-lg text-muted-foreground">
                  نستخدم تقنية DTF – Direct To Film المعروفة بأنها من أقوى وأحدث تقنيات الطباعة على
                  الملابس حاليًا، لأنها تقدم:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🎯 دقة عالية جداً</h3>
                  <p className="text-muted-foreground">تُظهر أدق التفاصيل في التصميم والألوان</p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🎨 ألوان زاهية وثابتة</h3>
                  <p className="text-muted-foreground">لا تتقشر ولا تتشقق بمرور الوقت</p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🧼 مقاومة للغسيل</h3>
                  <p className="text-muted-foreground">بدون فقدان للوضوح أو اللمعة</p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🤲 ملمس مريح</h3>
                  <p className="text-muted-foreground">لا يسبب صلابة على القماش ويحافظ على مرونته</p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🎪 ثبات كامل</h3>
                  <p className="text-muted-foreground">
                    على الخامة سواء في المناطق المسطحة أو الممتدة
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">🔍 تفاصيل دقيقة</h3>
                  <p className="text-muted-foreground">
                    قدرة على إبراز التدرجات والظلال والعناصر الرسومية الصغيرة
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-accent/30 border-2 border-accent">
                <p className="text-lg font-semibold text-center">
                  تقنية DTF تضمن إن القطعة تطلع بنفس دقة التصميم الأصلي، وبشكل احترافي يليق بالعلامات
                  التجارية القوية.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
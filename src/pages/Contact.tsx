import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Facebook, Instagram, MessageCircle, Code } from "lucide-react";

const Contact = () => {
  const navigate = useNavigate();
  const contacts = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "واتساب",
      description: "انضم لمجموعة واتساب",
      link: "https://chat.whatsapp.com/H0AJN63AuS4Jo2WPHOFp10?mode=wwt",
      buttonText: "انضم للمجموعة",
    },
    {
      icon: <Facebook className="w-8 h-8" />,
      title: "فيسبوك",
      description: "تابعنا على فيسبوك",
      link: "https://www.facebook.com/abdo.elhware.237745?mibextid=ZbWKwL",
      buttonText: "زيارة الصفحة",
    },
    {
      icon: <Instagram className="w-8 h-8" />,
      title: "إنستغرام",
      description: "تابعنا على إنستغرام",
      link: "https://www.instagram.com/vey.plus?igsh=MXhza3Vra3Eydmg0Nw==",
      buttonText: "زيارة الصفحة",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
          {/* العنوان */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">تواصل معنا</h1>
            <p className="text-xl text-muted-foreground">
              لو كنت عايز تشوف كل حاجة أول بأول، اقترح عليك الانضمام إلينا لتشاهد كل جديد
            </p>
          </div>

          {/* روابط التواصل الاجتماعي */}
          <div className="grid md:grid-cols-3 gap-6">
            {contacts.map((contact, index) => (
              <Card
                key={index}
                className="p-6 shadow-card hover-lift text-center space-y-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto">
                  {contact.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{contact.title}</h3>
                  <p className="text-muted-foreground">{contact.description}</p>
                </div>
                <Button asChild className="w-full">
                  <a href={contact.link} target="_blank" rel="noopener noreferrer">
                    {contact.buttonText}
                  </a>
                </Button>
              </Card>
            ))}
          </div>

          {/* أرقام الهواتف */}
          <Card className="p-8 shadow-luxury">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-dark flex items-center justify-center mx-auto">
                <Phone className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">التواصل الهاتفي</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-2">تواصل مع صاحب البراند</p>
                    <a
                      href="tel:01147124165"
                      className="text-2xl font-bold hover:text-primary transition-colors"
                      dir="ltr"
                    >
                      01147124165
                    </a>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      تواصل مع مصمم الويب سايت (للمزيد من الفرص)
                    </p>
                    <a
                      href="tel:01147124165"
                      className="text-2xl font-bold hover:text-primary transition-colors"
                      dir="ltr"
                    >
                      01147124165
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* طرق الدفع */}
          <Card className="p-8 shadow-luxury">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">طرق الدفع</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">فودافون كاش</h3>
                  <p className="text-2xl font-bold" dir="ltr">
                    01014491856
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-secondary/50 hover-scale">
                  <h3 className="text-xl font-bold mb-3">إنستا باي</h3>
                  <p className="text-2xl font-bold" dir="ltr">
                    01146202848
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                * مصاريف الشحن: 1% من إجمالي الطلب
              </p>
            </div>
          </Card>

          {/* زر تواصل مع المطور */}
          <div className="text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Button
              onClick={() => navigate("/developer")}
              size="lg"
              className="text-lg px-8 py-6 hover-scale shadow-luxury hover:shadow-hover transition-all bg-gradient-to-r from-primary to-accent"
            >
              <Code className="ml-2 h-5 w-5" />
              تواصل مع المطور
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
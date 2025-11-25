import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Facebook, MessageCircle, ArrowRight } from "lucide-react";

const Developer = () => {
  const navigate = useNavigate();
  const whatsappUrl = `https://wa.me/201123919317?text=${encodeURIComponent("مرحباً، أريد التواصل معك")}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 hover-scale"
          >
            <ArrowRight className="ml-2 h-5 w-5" />
            العودة
          </Button>

          <Card className="p-8 md:p-12 shadow-luxury hover-glow bg-gradient-to-br from-card to-accent/10 border-2 border-accent/20">
            <div className="text-center space-y-8">
              <div className="space-y-4 animate-scale-in">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  تواصل مع المطور
                </h1>
                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-pulse" />
              </div>

              <div className="space-y-6 text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="p-6 rounded-lg bg-accent/20 hover-scale transition-all">
                  <h2 className="text-3xl font-bold mb-2">محمد عاطف البدري</h2>
                  <p className="text-muted-foreground">مطور تطبيقات الويب</p>
                </div>

                <div className="space-y-4">
                  <a
                    href="tel:+201123919317"
                    className="flex items-center justify-center gap-3 p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-all hover-scale"
                  >
                    <Phone className="h-6 w-6 text-primary" />
                    <span dir="ltr">01123919317</span>
                  </a>

                  <a
                    href="mailto:atfm64803@gmail.com"
                    className="flex items-center justify-center gap-3 p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-all hover-scale"
                  >
                    <Mail className="h-6 w-6 text-primary" />
                    <span dir="ltr">atfm64803@gmail.com</span>
                  </a>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-6" style={{ animationDelay: "0.4s" }}>
                  <Button
                    onClick={() => window.open("https://www.facebook.com/profile.php?id=61575151770729", "_blank")}
                    className="h-16 text-lg hover-scale shadow-luxury hover:shadow-hover transition-all"
                    variant="outline"
                  >
                    <Facebook className="ml-2 h-6 w-6" />
                    فيسبوك
                  </Button>

                  <Button
                    onClick={() => window.open(whatsappUrl, "_blank")}
                    className="h-16 text-lg hover-scale shadow-luxury hover:shadow-hover transition-all bg-gradient-to-r from-primary to-accent"
                  >
                    <MessageCircle className="ml-2 h-6 w-6" />
                    واتساب
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Developer;

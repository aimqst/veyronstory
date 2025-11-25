import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import veyronLogo from "@/assets/veyron-logo.png";
import InstallPWA from "./InstallPWA";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminRole(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      checkAdminRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          {/* اللوجو والاسم */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <img 
                src={veyronLogo} 
                alt="Veyron Logo" 
                className="relative w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-dark bg-clip-text text-transparent">Veyron</h1>
              <p className="text-xs text-muted-foreground">اللبس القوة، وحس بالفخامة</p>
            </div>
          </Link>

          {/* القائمة */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              المتجر
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/about") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              نبذة عن الخامات
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              التواصل
            </Link>

            <InstallPWA />

            {session ? (
              <>
                <Link
                  to="/referral"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/referral") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  دعوة الأصدقاء
                </Link>
                <Link
                  to="/how-it-works"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/how-it-works") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  كيف يعمل؟
                </Link>
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin")}
                      className="gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden sm:inline">لوحة التحكم</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin/coupons")}
                      className="gap-2"
                    >
                      كوبونات
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
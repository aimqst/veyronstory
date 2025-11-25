import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Info, Phone, Store, MessageCircle, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import veyronLogo from "@/assets/veyron-logo.png";
import InstallPWA from "./InstallPWA";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const menuItems = [
    { path: "/", label: "المتجر", icon: Store },
    { path: "/about", label: "نبذة عن الخدمات", icon: Info },
    { path: "/contact", label: "التواصل", icon: Phone },
  ];

  const closeSheet = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          {/* اللوجو */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
              <img 
                src={veyronLogo} 
                alt="Veyron Logo" 
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/30 shadow-lg"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-dark bg-clip-text text-transparent">Veyron</h1>
              <p className="text-xs text-muted-foreground hidden md:block">اللبس القوة، وحس بالفخامة</p>
            </div>
          </Link>

          {/* Desktop Menu - مخفي على الموبايل */}
          <div className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <InstallPWA />

            {session ? (
              <>
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin")}
                      className="gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>لوحة التحكم</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/admin/coupons")}
                      className="gap-2"
                    >
                      <Ticket className="w-4 h-4" />
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
                  تسجيل الخروج
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
                تسجيل الدخول
              </Button>
            )}
          </div>

          {/* Mobile Menu - ظاهر على الموبايل فقط */}
          <div className="flex lg:hidden items-center gap-2">
            {session && !isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 px-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-right">القائمة</SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-4 mt-8">
                  {/* روابط القائمة */}
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 text-base h-12"
                        onClick={() => {
                          navigate(item.path);
                          closeSheet();
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    );
                  })}

                  <div className="border-t pt-4 mt-2">
                    {session ? (
                      <>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 text-base h-12 mb-2"
                              onClick={() => {
                                navigate("/admin");
                                closeSheet();
                              }}
                            >
                              <LayoutDashboard className="h-5 w-5" />
                              لوحة التحكم
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 text-base h-12 mb-2"
                              onClick={() => {
                                navigate("/admin/coupons");
                                closeSheet();
                              }}
                            >
                              <Ticket className="h-5 w-5" />
                              الكوبونات
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-3 text-base h-12"
                          onClick={() => {
                            handleLogout();
                            closeSheet();
                          }}
                        >
                          <LogOut className="h-5 w-5" />
                          تسجيل الخروج
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full justify-start gap-3 text-base h-12"
                        onClick={() => {
                          navigate("/auth");
                          closeSheet();
                        }}
                      >
                        <User className="h-5 w-5" />
                        تسجيل الدخول
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <InstallPWA />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
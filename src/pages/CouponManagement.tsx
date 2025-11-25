import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Session } from "@supabase/supabase-js";

type Coupon = {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
};

const CouponManagement = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_percentage: "",
    max_uses: "",
    valid_from: "",
    valid_until: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadCoupons();
    }
  }, [isAdmin]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setSession(session);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasAdminRole = roles?.some((r) => r.role === "admin");
    
    if (!hasAdminRole) {
      toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      navigate("/");
      return;
    }

    setIsAdmin(true);
  };

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل الكوبونات");
    } else {
      setCoupons(data || []);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_percentage) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    const discountPercentage = parseInt(newCoupon.discount_percentage);
    if (discountPercentage < 1 || discountPercentage > 100) {
      toast.error("نسبة الخصم يجب أن تكون بين 1 و 100");
      return;
    }

    const { error } = await supabase.from("discount_coupons").insert({
      code: newCoupon.code.toUpperCase(),
      discount_percentage: discountPercentage,
      max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
      valid_from: newCoupon.valid_from || null,
      valid_until: newCoupon.valid_until || null,
      created_by: session?.user.id,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("هذا الكود موجود بالفعل");
      } else {
        toast.error("خطأ في إنشاء الكوبون");
      }
    } else {
      toast.success("تم إنشاء الكوبون بنجاح");
      setDialogOpen(false);
      setNewCoupon({
        code: "",
        discount_percentage: "",
        max_uses: "",
        valid_from: "",
        valid_until: "",
      });
      loadCoupons();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("discount_coupons")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("خطأ في تحديث الكوبون");
    } else {
      toast.success(currentStatus ? "تم تعطيل الكوبون" : "تم تفعيل الكوبون");
      loadCoupons();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;

    const { error } = await supabase
      .from("discount_coupons")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("خطأ في حذف الكوبون");
    } else {
      toast.success("تم حذف الكوبون بنجاح");
      loadCoupons();
    }
  };

  if (!isAdmin) {
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

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">إدارة أكواد الخصم</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة كوبون جديد
          </Button>
        </div>

        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold">{coupon.code}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        coupon.is_active
                          ? "bg-green-500/20 text-green-600"
                          : "bg-red-500/20 text-red-600"
                      }`}
                    >
                      {coupon.is_active ? "نشط" : "معطل"}
                    </span>
                  </div>
                  <p className="text-lg">خصم: {coupon.discount_percentage}%</p>
                  <p className="text-muted-foreground">
                    الاستخدامات: {coupon.current_uses}
                    {coupon.max_uses ? ` / ${coupon.max_uses}` : " / غير محدود"}
                  </p>
                  {coupon.valid_from && (
                    <p className="text-sm text-muted-foreground">
                      صالح من: {new Date(coupon.valid_from).toLocaleDateString("ar-EG")}
                    </p>
                  )}
                  {coupon.valid_until && (
                    <p className="text-sm text-muted-foreground">
                      صالح حتى: {new Date(coupon.valid_until).toLocaleDateString("ar-EG")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={coupon.is_active ? "secondary" : "default"}
                    onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                  >
                    {coupon.is_active ? "تعطيل" : "تفعيل"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {coupons.length === 0 && (
            <div className="text-center py-16">
              <p className="text-2xl text-muted-foreground">
                لا توجد أكواد خصم بعد
              </p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة كوبون خصم جديد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="code">كود الخصم *</Label>
              <Input
                id="code"
                placeholder="مثال: SUMMER2024"
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div>
              <Label htmlFor="discount">نسبة الخصم (%) *</Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="100"
                placeholder="مثال: 15"
                value={newCoupon.discount_percentage}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, discount_percentage: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="max_uses">الحد الأقصى للاستخدامات (اختياري)</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                placeholder="اترك فارغاً لعدد غير محدود"
                value={newCoupon.max_uses}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, max_uses: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="valid_from">صالح من (اختياري)</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={newCoupon.valid_from}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, valid_from: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="valid_until">صالح حتى (اختياري)</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={newCoupon.valid_until}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, valid_until: e.target.value })
                }
              />
            </div>

            <Button onClick={handleCreateCoupon} className="w-full">
              إنشاء الكوبون
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponManagement;

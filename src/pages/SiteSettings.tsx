import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Upload, Eye } from "lucide-react";
import Header from "@/components/Header";

type SiteSettings = {
  brand_info: {
    name: string;
    logo_url: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  home_texts: {
    hero_title: string;
    hero_description: string;
  };
  contact_info: {
    phone: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
  };
};

export default function SiteSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    brand_info: { name: "", logo_url: "" },
    colors: { primary: "", secondary: "", accent: "", background: "", foreground: "" },
    home_texts: { hero_title: "", hero_description: "" },
    contact_info: { phone: "", whatsapp: "", facebook: "", instagram: "", twitter: "" },
  });

  useEffect(() => {
    checkAdminAndLoadSettings();
  }, []);

  const checkAdminAndLoadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        toast.error("غير مصرح لك بالوصول إلى هذه الصفحة");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadSettings();
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", true);

      if (error) throw error;

      // If no drafts exist, load published settings
      if (!data || data.length === 0) {
        const { data: publishedData, error: publishedError } = await supabase
          .from("site_settings")
          .select("*")
          .eq("is_draft", false);

        if (publishedError) throw publishedError;
        if (publishedData) {
          const settingsMap: any = {};
          publishedData.forEach((item: any) => {
            settingsMap[item.key] = item.value;
          });
          setSettings(settingsMap);
        }
      } else {
        const settingsMap: any = {};
        data.forEach((item: any) => {
          settingsMap[item.key] = item.value;
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("فشل تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);

      // Save each setting as draft
      for (const [key, value] of Object.entries(settings)) {
        // Delete existing draft for this key
        await supabase
          .from("site_settings")
          .delete()
          .eq("key", key)
          .eq("is_draft", true);

        // Insert new draft
        await supabase
          .from("site_settings")
          .insert({
            key,
            value: value as any,
            is_draft: true,
          });
      }

      toast.success("تم حفظ المسودة بنجاح");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("فشل حفظ المسودة");
    } finally {
      setSaving(false);
    }
  };

  const publishSettings = async () => {
    try {
      setSaving(true);

      // Delete all existing published settings
      await supabase
        .from("site_settings")
        .delete()
        .eq("is_draft", false);

      // Publish all draft settings
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from("site_settings")
          .insert({
            key,
            value: value as any,
            is_draft: false,
          });
      }

      // Delete drafts after publishing
      await supabase
        .from("site_settings")
        .delete()
        .eq("is_draft", true);

      toast.success("تم نشر التحديثات بنجاح! سيظهر التحديث للجميع الآن");
      
      // Reload page to apply new settings
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error publishing settings:", error);
      toast.error("فشل نشر التحديثات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">إعدادات الموقع</h1>
            <p className="text-muted-foreground mt-2">قم بتخصيص كل عناصر الموقع من هنا</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={saveDraft} disabled={saving} variant="outline">
              <Save className="w-4 h-4 ml-2" />
              حفظ كمسودة
            </Button>
            <Button onClick={publishSettings} disabled={saving}>
              <Upload className="w-4 h-4 ml-2" />
              نشر التحديثات
            </Button>
          </div>
        </div>

        <Tabs defaultValue="brand" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brand">الهوية البصرية</TabsTrigger>
            <TabsTrigger value="texts">نصوص الصفحة</TabsTrigger>
            <TabsTrigger value="contact">معلومات التواصل</TabsTrigger>
            <TabsTrigger value="colors">الألوان</TabsTrigger>
          </TabsList>

          <TabsContent value="brand">
            <Card>
              <CardHeader>
                <CardTitle>الهوية البصرية للموقع</CardTitle>
                <CardDescription>اللوجو واسم البراند</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="brand-name">اسم البراند</Label>
                  <Input
                    id="brand-name"
                    value={settings.brand_info.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        brand_info: { ...settings.brand_info, name: e.target.value },
                      })
                    }
                    placeholder="اسم البراند"
                  />
                </div>

                <div>
                  <Label htmlFor="logo-url">رابط اللوجو</Label>
                  <Input
                    id="logo-url"
                    value={settings.brand_info.logo_url}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        brand_info: { ...settings.brand_info, logo_url: e.target.value },
                      })
                    }
                    placeholder="https://example.com/logo.png"
                  />
                  {settings.brand_info.logo_url && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">معاينة اللوجو:</p>
                      <img
                        src={settings.brand_info.logo_url}
                        alt="Logo preview"
                        className="h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="texts">
            <Card>
              <CardHeader>
                <CardTitle>نصوص الصفحة الرئيسية</CardTitle>
                <CardDescription>العناوين والأوصاف التي تظهر للزوار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">عنوان البطل الرئيسي</Label>
                  <Input
                    id="hero-title"
                    value={settings.home_texts.hero_title}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        home_texts: { ...settings.home_texts, hero_title: e.target.value },
                      })
                    }
                    placeholder="مرحباً بك في متجرنا"
                  />
                </div>

                <div>
                  <Label htmlFor="hero-description">وصف البطل</Label>
                  <Textarea
                    id="hero-description"
                    value={settings.home_texts.hero_description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        home_texts: { ...settings.home_texts, hero_description: e.target.value },
                      })
                    }
                    placeholder="اكتشف منتجاتنا الفريدة..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
                <CardDescription>أرقام الهواتف وروابط السوشيال ميديا</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={settings.contact_info.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_info: { ...settings.contact_info, phone: e.target.value },
                      })
                    }
                    placeholder="+201234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">رقم الواتساب</Label>
                  <Input
                    id="whatsapp"
                    value={settings.contact_info.whatsapp}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_info: { ...settings.contact_info, whatsapp: e.target.value },
                      })
                    }
                    placeholder="+201234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="facebook">رابط الفيسبوك</Label>
                  <Input
                    id="facebook"
                    value={settings.contact_info.facebook}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_info: { ...settings.contact_info, facebook: e.target.value },
                      })
                    }
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">رابط الإنستجرام</Label>
                  <Input
                    id="instagram"
                    value={settings.contact_info.instagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_info: { ...settings.contact_info, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">رابط تويتر</Label>
                  <Input
                    id="twitter"
                    value={settings.contact_info.twitter}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_info: { ...settings.contact_info, twitter: e.target.value },
                      })
                    }
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>نظام الألوان</CardTitle>
                <CardDescription>
                  الألوان بصيغة HSL (Hue Saturation Lightness) - مثال: 262.1 83.3% 57.8%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">اللون الرئيسي (Primary)</Label>
                  <Input
                    id="primary-color"
                    value={settings.colors.primary}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, primary: e.target.value },
                      })
                    }
                    placeholder="262.1 83.3% 57.8%"
                  />
                </div>

                <div>
                  <Label htmlFor="secondary-color">اللون الثانوي (Secondary)</Label>
                  <Input
                    id="secondary-color"
                    value={settings.colors.secondary}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, secondary: e.target.value },
                      })
                    }
                    placeholder="220 14.3% 95.9%"
                  />
                </div>

                <div>
                  <Label htmlFor="accent-color">لون التمييز (Accent)</Label>
                  <Input
                    id="accent-color"
                    value={settings.colors.accent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, accent: e.target.value },
                      })
                    }
                    placeholder="220 14.3% 95.9%"
                  />
                </div>

                <div>
                  <Label htmlFor="background-color">لون الخلفية (Background)</Label>
                  <Input
                    id="background-color"
                    value={settings.colors.background}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, background: e.target.value },
                      })
                    }
                    placeholder="0 0% 100%"
                  />
                </div>

                <div>
                  <Label htmlFor="foreground-color">لون النص (Foreground)</Label>
                  <Input
                    id="foreground-color"
                    value={settings.colors.foreground}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        colors: { ...settings.colors, foreground: e.target.value },
                      })
                    }
                    placeholder="222.2 84% 4.9%"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

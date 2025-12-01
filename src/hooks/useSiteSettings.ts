import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", false);

      if (error) throw error;

      if (data) {
        const settingsMap: any = {
          brand_info: { name: "فيرون", logo_url: "/src/assets/veyron-logo.png" },
          colors: {
            primary: "262.1 83.3% 57.8%",
            secondary: "220 14.3% 95.9%",
            accent: "220 14.3% 95.9%",
            background: "0 0% 100%",
            foreground: "222.2 84% 4.9%",
          },
          home_texts: {
            hero_title: "مرحباً بك في فيرون",
            hero_description: "اكتشف منتجاتنا الفريدة",
          },
          contact_info: {
            phone: "+201234567890",
            whatsapp: "+201234567890",
            facebook: "",
            instagram: "",
            twitter: "",
          },
        };

        data.forEach((item: any) => {
          settingsMap[item.key] = item.value;
        });

        setSettings(settingsMap);

        // Apply colors to CSS variables
        if (settingsMap.colors) {
          const root = document.documentElement;
          root.style.setProperty("--primary", settingsMap.colors.primary);
          root.style.setProperty("--secondary", settingsMap.colors.secondary);
          root.style.setProperty("--accent", settingsMap.colors.accent);
          root.style.setProperty("--background", settingsMap.colors.background);
          root.style.setProperty("--foreground", settingsMap.colors.foreground);
        }
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
};

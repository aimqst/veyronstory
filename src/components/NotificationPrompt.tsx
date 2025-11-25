import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      return;
    }

    setPermission(Notification.permission);

    // Show prompt after 5 seconds if permission not granted
    if (Notification.permission === "default") {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("تم تفعيل الإشعارات بنجاح! 🔔");
        
        // Send a test notification
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          new Notification("Veyron Story", {
            body: "شكراً لتفعيل الإشعارات! سنبلغك بكل جديد 🎉",
            icon: "/pwa-icon.png",
            badge: "/pwa-icon.png",
          });
        }
      } else {
        toast.error("لن تصلك إشعارات بالمنتجات والعروض الجديدة");
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("حدث خطأ في تفعيل الإشعارات");
    }
  };

  if (!showPrompt || permission !== "default") {
    return null;
  }

  return (
    <Card className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[400px] p-4 shadow-2xl z-50 animate-fade-in border-2 border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm sm:text-base mb-1">
              فعّل الإشعارات
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              اسمح لنا بإرسال إشعارات عن المنتجات الجديدة والعروض الحصرية
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={requestPermission}
                size="sm"
                className="text-xs sm:text-sm"
              >
                تفعيل
              </Button>
              <Button 
                onClick={() => setShowPrompt(false)}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                لاحقاً
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPrompt(false)}
          className="h-6 w-6 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

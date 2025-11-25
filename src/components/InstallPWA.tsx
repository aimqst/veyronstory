import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info("التطبيق مثبت بالفعل أو غير متاح للتثبيت في هذا المتصفح");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("تم تثبيت التطبيق بنجاح! 🎉");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return (
      <div className="w-full p-3 bg-gradient-to-r from-primary to-primary/80 rounded-lg text-center">
        <p className="text-primary-foreground text-sm font-medium">
          💡 يمكنك تثبيت التطبيق على هاتفك للوصول السريع
        </p>
        <p className="text-primary-foreground/80 text-xs mt-1">
          iOS: اضغط زر المشاركة → "Add to Home Screen"
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={handleInstall}
      variant="default"
      size="sm"
      className="w-full justify-start gap-3 text-base h-12 hover-scale shadow-luxury bg-gradient-to-r from-primary to-primary/80 animate-pulse"
    >
      <Download className="h-5 w-5" />
      🎉 حمّل التطبيق الآن على هاتفك
    </Button>
  );
};

export default InstallPWA;

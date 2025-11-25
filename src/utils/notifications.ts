// Utility functions for web push notifications

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const sendNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const defaultOptions: NotificationOptions = {
      icon: "/pwa-icon.png",
      badge: "/pwa-icon.png",
      ...options,
    };

    const notification = new Notification(title, defaultOptions);
    
    // Vibrate if supported (outside of NotificationOptions)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    return notification;
  }
};

export const sendProductNotification = (productName: string, productImage?: string) => {
  sendNotification("منتج جديد في Veyron! 🎉", {
    body: `تم إضافة ${productName} إلى المتجر. شاهده الآن!`,
    icon: productImage || "/pwa-icon.png",
    tag: "new-product",
  });
};

export const sendOfferNotification = (offerTitle: string, offerDescription?: string) => {
  sendNotification("عرض جديد! 🔥", {
    body: offerDescription || offerTitle,
    tag: "new-offer",
  });
};

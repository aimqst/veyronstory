import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Maintenance from "./pages/Maintenance";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import CouponManagement from "./pages/CouponManagement";
import AIManagement from "./pages/AIManagement";
import Statistics from "./pages/Statistics";
import SiteSettings from "./pages/SiteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* صفحة الصيانة - جميع الصفحات العامة */}
          <Route path="/" element={<Maintenance />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* صفحات الأدمن - تبقى متاحة */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/coupons" element={<CouponManagement />} />
          <Route path="/admin/ai" element={<AIManagement />} />
          <Route path="/admin/statistics" element={<Statistics />} />
          <Route path="/admin/site-settings" element={<SiteSettings />} />
          
          {/* جميع الصفحات الأخرى تحول لصفحة الصيانة */}
          <Route path="*" element={<Maintenance />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

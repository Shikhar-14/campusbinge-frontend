import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Forum from "./pages/Forum";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import ApplicationTracker from "./pages/ApplicationTracker";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import ModerationQueue from "./pages/ModerationQueue";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Load and apply saved theme preferences
    const savedTheme = localStorage.getItem('theme');
    const savedColor = localStorage.getItem('themeColor');
    
    // Apply dark mode if saved
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    // Apply saved accent color or use default
    const accentColor = savedColor || '#019543';
    applyThemeColor(accentColor);
  }, []);

  const applyThemeColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    document.documentElement.style.setProperty('--primary', hsl);
  };

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AIAssistant />} />
          <Route path="/forum/*" element={
            <Layout>
              <Forum />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <Profile />
            </Layout>
          } />
          <Route path="/application-tracker" element={
            <Layout>
              <ApplicationTracker />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          <Route path="/user/:userId" element={
            <Layout>
              <UserProfile />
            </Layout>
          } />
          <Route path="/moderation" element={
            <Layout>
              <ModerationQueue />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;

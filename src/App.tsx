import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ApiConnectionProvider } from '@/contexts/ApiConnectionContext';
import { Dashboard } from '@/pages/Dashboard';
import { NewAnalysis } from '@/pages/NewAnalysis';
import { Reports } from '@/pages/Reports';
import { ReportDetail } from '@/pages/ReportDetail';
import { Presets } from '@/pages/Presets';
import { Team } from '@/pages/Team';
import { Admin } from '@/pages/Admin';
import { Help } from '@/pages/Help';
import { Research } from '@/pages/Research';
import NotFound from '@/pages/NotFound';
import TestPage from '@/pages/TestPage';

const queryClient = new QueryClient();

function ThemeInitializer() {
  const { theme } = useThemeStore();
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ApiConnectionProvider>
        <ThemeInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<NewAnalysis />} />
              <Route path="/new-analysis" element={<NewAnalysis />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/presets" element={<Presets />} />
              <Route path="/team" element={<Team />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/help" element={<Help />} />
              <Route path="/research" element={<Research />} />
              <Route path="/test" element={<TestPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ApiConnectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

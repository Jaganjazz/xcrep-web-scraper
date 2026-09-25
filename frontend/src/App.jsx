import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ScrapeProvider, useScrape } from './context/ScrapeContext';
import { ToastProvider } from './components/common/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ScrapePage } from './pages/ScrapePage';
import { HistoryPage } from './pages/HistoryPage';
import { SavedDataPage } from './pages/SavedDataPage';
import { ExportPage } from './pages/ExportPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent = () => {
  const { activeTab } = useScrape();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'scrape':
        return <ScrapePage />;
      case 'history':
        return <HistoryPage />;
      case 'saved':
        return <SavedDataPage />;
      case 'export':
        return <ExportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderActivePage()}</AppLayout>;
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ScrapeProvider>
          <AppContent />
        </ScrapeProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

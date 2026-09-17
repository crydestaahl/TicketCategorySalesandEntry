import React, { useState, useEffect } from 'react';
import { AppSettings, CustomDesign, DesignId, TicksterResponse } from './types';
import Dashboard from './components/Dashboard';
import CategoriesAndSections from './components/CategoriesAndSections';
import Settings from './Settings';
import { LayoutDashboard, Settings as SettingsIcon, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Language = 'sv' | 'en';
type Theme = 'dark' | 'light';
type FetchOptions = {
  ignoreCooldown?: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  eogRequestCode: '',
  eventRequestCode: '',
  apikey: '',
  username: '',
  password: '',
};

const translations = {
  sv: {
    navDashboard: 'Dashboard',
    navCategories: 'Kategori & Sekt.',
    navSettings: 'Inställningar',
    toggleLanguage: 'EN',
    lightTheme: 'Byt till ljust tema',
    darkTheme: 'Byt till mörkt tema',
    designTitle: 'Design',
    designDescription: 'Välj appens visuella stil',
    designDefault: 'Default',
    designOldFuture: 'Old Future',
    designCustom: 'Custom',
    customDesignTitle: 'Skapa egen design',
    customDesignDescription: 'Justera färger och se resultatet direkt',
    customDesignName: 'Designnamn',
    customDesignNamePlaceholder: 'Min design',
    customBackground: 'Bakgrund',
    customText: 'Text',
    customCards: 'Rutor',
    customAccent: 'Accent',
    customPreview: 'Förhandsvisning',
    customPreviewTitle: 'Biljettstatus',
    customPreviewText: 'Din design visas här',
    saveCustomDesign: 'Spara design',
    cancel: 'Tillbaka',
    savedDesigns: 'Sparade designer',
    deleteDesign: 'Ta bort design',
    missingFieldsError: 'Vänligen fyll i alla fält i inställningarna.',
    fetchDataError: 'Kunde inte hämta data',
    settingsTitle: 'Inställningar',
    settingsDescription: 'Konfigurera din koppling lokalt',
    stageOrganizerApi: '1. Arrangör & API-nyckel',
    labelOrganizerId: 'Arrangörs ID (eogRequestCode)',
    labelApiKey: 'API Nyckel',
    placeholderOrganizerId: 'T.ex. G72XGAEATMY9GUX',
    placeholderApiKey: 'Din Tickster API-nyckel',
    fetchEvents: 'HÄMTA EVENEMANG',
    fetchingEvents: 'HÄMTAR EVENEMANG...',
    fillOrganizerAndApi: 'Fyll i Arrangörs ID och API Nyckel först.',
    fetchEventsFailed: 'Misslyckades att hämta evenemang',
    stageSelectEvent: '2. Välj Evenemang',
    selectFromList: 'Välj från lista ({count} st)',
    selectAnEvent: '-- Välj ett evenemang --',
    placeholderManualEventId: 'Insprat ID eller skriv in manuellt...',
    eventIdInputLabel: 'Egen inställning: Evenemangs ID (eventRequestCode)',
    usernamePlaceholder: 'User',
    passwordPlaceholder: 'Pass',
    stageLogin: '3. Inloggning',
    labelUsername: 'Användarnamn',
    labelPassword: 'Lösenord',
    saveSettings: 'Spara & Tillämpa Inställningar',
    eventHelpText: 'Spara eller fyll i Arrangörs ID & API-nyckel och klicka på "Hämta evenemang" ovan för att välja från din lista.',
    dashboardLoading: 'Hämtar biljettdata...',
    categoriesLoading: 'Hämtar fördelning...',
    dashboardErrorTitle: 'Ett fel uppstod',
    tryAgain: 'Försök igen',
    updated: 'Uppdaterad',
    never: 'Aldrig',
    admitted: 'Insläppta',
    of: 'av',
    scanned: 'Scannade',
    sold: 'Sålda',
    remaining: 'Kvar',
    latestStatus: 'Senaste status',
    live: 'Live',
    totalInSystem: 'Totalt i systemet',
    allTicketTypes: 'Alla biljettyper',
    admittedNow: 'Insläppta nu',
    scannedTickets: 'Scannade biljetter',
    categorySplitTitle: 'Uppdelning',
    categorySplitHeading: 'Uppdelning',
    categorySplitOverview: 'Kategori- & Sektionsfördelning',
    categoriesTab: 'Kategorier',
    sectionsTab: 'Sektioner',
    searchCategoryPlaceholder: 'Sök på kategori...',
    searchSectionPlaceholder: 'Sök på sektion...',
    clear: 'Rensa',
    noMatchesFound: 'Inga matchande resultat hittades',
    noCategoriesAvailable: 'Inga kategorier tillgängliga',
    noSectionsAvailable: 'Inga sektioner tillgängliga',
    viewAll: 'Visa alla',
    leftToScan: 'st kvar att skanna',
    sectionDataMissing: 'Ingen sektionsdata finns för denna kategori.',
    sectionsIn: 'Sektioner i {name}',
    admittedOfSold: '{admitted} av {sold} insläppta',
    admittedSold: '{admitted} insläppta / {sold} sålda',
    admittedPercentage: '{percent}% insläppta',
    eventFallback: 'Väntar på data...',
  },
  en: {
    navDashboard: 'Dashboard',
    navCategories: 'Category & Sec.',
    navSettings: 'Settings',
    toggleLanguage: 'SV',
    lightTheme: 'Switch to light theme',
    darkTheme: 'Switch to dark theme',
    designTitle: 'Design',
    designDescription: 'Choose the visual style',
    designDefault: 'Default',
    designOldFuture: 'Old Future',
    designCustom: 'Custom',
    customDesignTitle: 'Create custom design',
    customDesignDescription: 'Adjust colors and preview the result live',
    customDesignName: 'Design name',
    customDesignNamePlaceholder: 'My design',
    customBackground: 'Background',
    customText: 'Text',
    customCards: 'Cards',
    customAccent: 'Accent',
    customPreview: 'Preview',
    customPreviewTitle: 'Ticket status',
    customPreviewText: 'Your design appears here',
    saveCustomDesign: 'Save design',
    cancel: 'Back',
    savedDesigns: 'Saved designs',
    deleteDesign: 'Delete design',
    missingFieldsError: 'Please fill in all settings fields.',
    fetchDataError: 'Could not fetch data',
    settingsTitle: 'Settings',
    settingsDescription: 'Configure your connection locally',
    stageOrganizerApi: '1. Organizer & API key',
    labelOrganizerId: 'Organizer ID (eogRequestCode)',
    labelApiKey: 'API Key',
    placeholderOrganizerId: 'Ex. G72XGAEATMY9GUX',
    placeholderApiKey: 'Your Tickster API key',
    fetchEvents: 'FETCH EVENTS',
    fetchingEvents: 'FETCHING EVENTS...',
    fillOrganizerAndApi: 'Fill in Organizer ID and API Key first.',
    fetchEventsFailed: 'Failed to fetch events',
    stageSelectEvent: '2. Select Event',
    selectFromList: 'Choose from list ({count})',
    selectAnEvent: '-- Select an event --',
    placeholderManualEventId: 'Paste event ID or type manually...',
    eventIdInputLabel: 'Custom event ID (eventRequestCode)',
    usernamePlaceholder: 'User',
    passwordPlaceholder: 'Pass',
    stageLogin: '3. Login',
    labelUsername: 'Username',
    labelPassword: 'Password',
    saveSettings: 'Save & Apply Settings',
    eventHelpText: 'Save or fill in Organizer ID & API Key and click "FETCH EVENTS" above to choose from your list.',
    dashboardLoading: 'Loading ticket data...',
    categoriesLoading: 'Loading breakdown...',
    dashboardErrorTitle: 'An error occurred',
    tryAgain: 'Try again',
    updated: 'Updated',
    never: 'Never',
    admitted: 'Admitted',
    of: 'of',
    scanned: 'Scanned',
    sold: 'Sold',
    remaining: 'Remaining',
    latestStatus: 'Latest status',
    live: 'Live',
    totalInSystem: 'Total in system',
    allTicketTypes: 'All ticket types',
    admittedNow: 'Admitted now',
    scannedTickets: 'Scanned tickets',
    categorySplitTitle: 'Breakdown',
    categorySplitHeading: 'Breakdown',
    categorySplitOverview: 'Category & Section breakdown',
    categoriesTab: 'Categories',
    sectionsTab: 'Sections',
    searchCategoryPlaceholder: 'Search category...',
    searchSectionPlaceholder: 'Search section...',
    clear: 'Clear',
    noMatchesFound: 'No matching results found',
    noCategoriesAvailable: 'No categories available',
    noSectionsAvailable: 'No sections available',
    viewAll: 'View all',
    leftToScan: 'left to scan',
    sectionDataMissing: 'No section data available for this category.',
    sectionsIn: 'Sections in {name}',
    admittedOfSold: '{admitted} of {sold} admitted',
    admittedSold: '{admitted} admitted / {sold} sold',
    admittedPercentage: '{percent}% admitted',
    eventFallback: 'Waiting for data...',
  },
} as const;

const TICKET_CACHE_KEY = 'tickster_cache';
const TICKET_CACHE_TIME_KEY = 'tickster_cache_time';
const TICKET_CACHE_SETTINGS_KEY = 'tickster_cache_settings_key';
const CUSTOM_DESIGNS_KEY = 'tickster_custom_designs';

const readCustomDesigns = (): CustomDesign[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_DESIGNS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const normalizeSettings = (settings: Partial<AppSettings> | null | undefined): AppSettings => ({
  ...DEFAULT_SETTINGS,
  ...(settings ?? {}),
});

const getSettingsCacheKey = (settings: Pick<AppSettings, 'eogRequestCode' | 'eventRequestCode'>) => {
  const eogRequestCode = settings.eogRequestCode?.trim();
  const eventRequestCode = settings.eventRequestCode?.trim();

  if (!eogRequestCode || !eventRequestCode) {
    return null;
  }

  return `${eogRequestCode}:${eventRequestCode}`;
};

const hasCompleteSettings = (settings: AppSettings) => Boolean(
  settings.apikey &&
  settings.eogRequestCode &&
  settings.eventRequestCode &&
  settings.username &&
  settings.password
);

export default function App() {
  const [view, setView] = useState<'dashboard' | 'categories' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('tickster_language');
    return saved === 'en' ? 'en' : 'sv';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tickster_theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  const [customDesigns, setCustomDesigns] = useState<CustomDesign[]>(readCustomDesigns);
  const [design, setDesign] = useState<DesignId>(() => {
    const saved = localStorage.getItem('tickster_design');
    return saved === 'old-future' || saved?.startsWith('custom:') ? saved as DesignId : 'default';
  });
  const texts = translations[language];
  
  // Lifted state for Ticket database
  const [data, setData] = useState<TicksterResponse | null>(null);
  const [dataCacheKey, setDataCacheKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Load initial settings and cached data on mount
  useEffect(() => {
    const saved = localStorage.getItem('tickster_settings');
    let loadedSettings = DEFAULT_SETTINGS;
    let hasSettings = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const parsedSettings = normalizeSettings(parsed);
        loadedSettings = parsedSettings;
        setSettings(parsedSettings);
        if (hasCompleteSettings(parsedSettings)) {
          hasSettings = true;
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    if (!hasSettings) {
      setView('settings'); // Force settings if none exist
    }

    // Load cached tickets
    const cachedData = localStorage.getItem(TICKET_CACHE_KEY);
    const cachedTime = localStorage.getItem(TICKET_CACHE_TIME_KEY);
    const cachedSettingsKey = localStorage.getItem(TICKET_CACHE_SETTINGS_KEY);
    const currentSettingsKey = getSettingsCacheKey(loadedSettings);
    if (cachedData && cachedTime && currentSettingsKey && cachedSettingsKey === currentSettingsKey) {
      try {
        setData(JSON.parse(cachedData));
        setDataCacheKey(currentSettingsKey);
        setLastUpdated(new Date(parseInt(cachedTime)));
      } catch (e) {
        console.error("Failed to parse cached data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tickster_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('tickster_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tickster_design', design);
  }, [design]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_DESIGNS_KEY, JSON.stringify(customDesigns));
  }, [customDesigns]);

  useEffect(() => {
    if (design.startsWith('custom:') && !customDesigns.some(item => item.id === design.slice(7))) {
      setDesign('default');
    }
  }, [customDesigns, design]);

  const saveCustomDesign = (customDesign: Omit<CustomDesign, 'id'>) => {
    const savedDesign: CustomDesign = {
      ...customDesign,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setCustomDesigns(current => [...current, savedDesign]);
    setDesign(`custom:${savedDesign.id}`);
  };

  const deleteCustomDesign = (id: string) => {
    setCustomDesigns(current => current.filter(item => item.id !== id));
    if (design === `custom:${id}`) setDesign('default');
  };

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Unified ticket fetcher
  const fetchData = async (currentSettings = settings, options: FetchOptions = {}) => {
    if (!options.ignoreCooldown && cooldown > 0) return;
    
    if (!hasCompleteSettings(currentSettings)) {
      setError(texts.missingFieldsError);
      setView('settings');
      return;
    }

    const requestCacheKey = getSettingsCacheKey(currentSettings);
    if (!requestCacheKey) {
      setError(texts.missingFieldsError);
      setView('settings');
      return;
    }

    if (dataCacheKey && dataCacheKey !== requestCacheKey) {
      setData(null);
      setDataCacheKey(null);
      setLastUpdated(null);
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fetch-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || texts.fetchDataError);
      }

      const result = await response.json();
      const now = new Date();
      
      setData(result);
      setDataCacheKey(requestCacheKey);
      setLastUpdated(now);
      localStorage.setItem(TICKET_CACHE_KEY, JSON.stringify(result));
      localStorage.setItem(TICKET_CACHE_TIME_KEY, now.getTime().toString());
      localStorage.setItem(TICKET_CACHE_SETTINGS_KEY, requestCacheKey);
      
      setCooldown(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only auto-fetch if setup is finished and we have no loaded data yet
  useEffect(() => {
    const settingsCacheKey = getSettingsCacheKey(settings);
    if (hasCompleteSettings(settings) && settingsCacheKey && dataCacheKey !== settingsCacheKey && !loading) {
      fetchData(settings, { ignoreCooldown: true });
    }
  }, [settings, dataCacheKey, loading]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setView('dashboard');
    setCooldown(0);
    // Force instant refresh after saving settings
    fetchData(newSettings, { ignoreCooldown: true });
  };

  const currentDataCacheKey = getSettingsCacheKey(settings);
  const tickets = dataCacheKey === currentDataCacheKey ? data?.tickets || [] : [];
  const activeCustomDesign = design.startsWith('custom:')
    ? customDesigns.find(item => item.id === design.slice(7))
    : undefined;
  const customStyle = activeCustomDesign ? {
    '--custom-background': activeCustomDesign.backgroundColor,
    '--custom-text': activeCustomDesign.textColor,
    '--custom-card': activeCustomDesign.cardColor,
    '--custom-accent': activeCustomDesign.accentColor,
  } as React.CSSProperties : undefined;

  return (
    <div
      className={`app-shell theme-${theme} ${activeCustomDesign ? 'design-custom' : `design-${design}`} min-h-screen font-sans`}
      style={customStyle}
    >
      {/* Content Area */}
      <main className="pb-28">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Dashboard 
                settings={settings} 
                texts={texts}
                tickets={tickets} 
                loading={loading} 
                error={error} 
                lastUpdated={lastUpdated} 
                cooldown={cooldown} 
                fetchData={() => fetchData()} 
                theme={theme}
                toggleTheme={toggleTheme}
                design={design}
              />
            </motion.div>
          )}

          {view === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <CategoriesAndSections 
                settings={settings} 
                texts={texts}
                tickets={tickets} 
                loading={loading} 
                error={error} 
                lastUpdated={lastUpdated} 
                cooldown={cooldown} 
                fetchData={() => fetchData()} 
                theme={theme}
                toggleTheme={toggleTheme}
              />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Settings
                onSave={handleSaveSettings}
                initialSettings={settings}
                texts={texts}
                language={language}
                setLanguage={setLanguage}
                design={design}
                setDesign={setDesign}
                customDesigns={customDesigns}
                saveCustomDesign={saveCustomDesign}
                deleteCustomDesign={deleteCustomDesign}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="app-nav fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md backdrop-blur-xl rounded-[32px] p-2 flex items-center justify-around z-50">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition-all ${
            view === 'dashboard' 
              ? 'nav-active text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{texts.navDashboard}</span>
        </button>

        <button
          onClick={() => {
            // Only switch to view if we have settings populated, otherwise it pushes to settings
            const hasSettings = settings.apikey && settings.eogRequestCode && settings.eventRequestCode && settings.username && settings.password;
            if (hasSettings) {
              setView('categories');
            } else {
              setView('settings');
            }
          }}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition-all ${
            view === 'categories' 
              ? 'nav-active text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{texts.navCategories}</span>
        </button>
        
        <button
          onClick={() => setView('settings')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition-all ${
            view === 'settings' 
              ? 'nav-active text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{texts.navSettings}</span>
        </button>
      </nav>
    </div>
  );
}

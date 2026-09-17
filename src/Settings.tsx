import React, { useEffect, useState } from 'react';
import { AppSettings, CustomDesign, DesignId, TicksterEventItem } from './types';
import { Save, Shield, Key, User, Building2, Calendar, RefreshCcw, AlertCircle, Globe, Palette, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

type Language = 'sv' | 'en';

interface SettingsProps {
  onSave: (settings: AppSettings) => void;
  initialSettings: AppSettings;
  texts: Record<string, string>;
  language: Language;
  setLanguage: (lang: Language | ((prev: Language) => Language)) => void;
  design: DesignId;
  setDesign: (design: DesignId) => void;
  customDesigns: CustomDesign[];
  saveCustomDesign: (design: Omit<CustomDesign, 'id'>) => void;
  deleteCustomDesign: (id: string) => void;
}

const EVENTS_CACHE_KEY = 'tickster_events_cache';

const getEventRequestCode = (event: TicksterEventItem) => {
  return String(
    event.eventRequestCode ??
    event.requestCode ??
    event.request_code ??
    event.code ??
    event.id ??
    ''
  );
};

const readCachedEvents = (eogRequestCode: string): TicksterEventItem[] => {
  const cached = localStorage.getItem(EVENTS_CACHE_KEY);
  if (!cached) return [];

  try {
    const parsed = JSON.parse(cached);

    if (
      parsed &&
      !Array.isArray(parsed) &&
      parsed.eogRequestCode === eogRequestCode &&
      Array.isArray(parsed.items)
    ) {
      return parsed.items;
    }
  } catch (e) {
    console.error("Failed to parse cached events", e);
  }

  return [];
};

export default function Settings({ onSave, initialSettings, texts, language, setLanguage, design, setDesign, customDesigns, saveCustomDesign, deleteCustomDesign }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customColors, setCustomColors] = useState({
    backgroundColor: '#111633',
    textColor: '#f5f7ff',
    cardColor: '#202958',
    accentColor: '#ff3b91',
  });
  
  // Load cached events from local storage on mount
  const [events, setEvents] = useState<TicksterEventItem[]>(() => readCachedEvents(initialSettings.eogRequestCode));

  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [fetchEventsError, setFetchEventsError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
    setEvents(readCachedEvents(initialSettings.eogRequestCode));
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'eogRequestCode') {
      setSettings(prev => ({
        ...prev,
        eogRequestCode: value,
        eventRequestCode: value === prev.eogRequestCode ? prev.eventRequestCode : '',
      }));
      setEvents(readCachedEvents(value));
      return;
    }

    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchEvents = async () => {
    if (!settings.eogRequestCode || !settings.apikey) {
      setFetchEventsError(texts.fillOrganizerAndApi);
      return;
    }
    
    setFetchingEvents(true);
    setFetchEventsError(null);
    try {
      const response = await fetch('/api/fetch-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eogRequestCode: settings.eogRequestCode,
          apikey: settings.apikey
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || texts.fetchEventsFailed);
      }

      const data = await response.json();
      const fetchedItems = data.items || [];
      setEvents(fetchedItems);
      localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify({
        eogRequestCode: settings.eogRequestCode,
        items: fetchedItems,
      }));
    } catch (err: any) {
      setFetchEventsError(err.message || texts.fetchEventsFailed);
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    const safeSettings = {
      eogRequestCode: settings.eogRequestCode,
      eventRequestCode: settings.eventRequestCode,
    };
    localStorage.setItem('tickster_settings', JSON.stringify(safeSettings));
  };

  const colorFields: { key: keyof typeof customColors; label: string }[] = [
    { key: 'backgroundColor', label: texts.customBackground },
    { key: 'textColor', label: texts.customText },
    { key: 'cardColor', label: texts.customCards },
    { key: 'accentColor', label: texts.customAccent },
  ];

  const handleSaveCustomDesign = () => {
    const name = customName.trim();
    if (!name) return;
    saveCustomDesign({ name, ...customColors });
    setCustomName('');
    setShowCustomEditor(false);
  };

  if (showCustomEditor) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="custom-design-editor p-6 max-w-md mx-auto space-y-6"
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setShowCustomEditor(false)}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 active:scale-95 transition-all"
            aria-label={texts.cancel}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{texts.customDesignTitle}</h1>
            <p className="text-slate-500">{texts.customDesignDescription}</p>
          </div>
        </div>

        <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">
              {texts.customDesignName}
            </label>
            <input
              type="text"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder={texts.customDesignNamePlaceholder}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-semibold text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {colorFields.map(field => (
              <label key={field.key} className="custom-color-field bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">{field.label}</span>
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColors[field.key]}
                    onChange={(event) => setCustomColors(current => ({ ...current, [field.key]: event.target.value }))}
                    aria-label={field.label}
                    className="custom-color-input"
                  />
                  <span className="text-xs text-slate-600 uppercase">{customColors[field.key]}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">{texts.customPreview}</h2>
          <div
            className="custom-design-preview rounded-3xl border p-5"
            style={{
              backgroundColor: customColors.backgroundColor,
              color: customColors.textColor,
              borderColor: customColors.accentColor,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xl font-bold">{texts.customPreviewTitle}</p>
                <p className="text-sm opacity-60">{texts.customPreviewText}</p>
              </div>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: customColors.accentColor }} />
            </div>
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: customColors.cardColor, borderColor: `${customColors.accentColor}66` }}>
              <div className="flex justify-between items-end gap-4">
                <span className="text-sm uppercase tracking-wider opacity-70">{texts.admitted}</span>
                <span className="text-2xl font-black">72%</span>
              </div>
              <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: `${customColors.textColor}22` }}>
                <div className="h-full w-[72%] rounded-full" style={{ backgroundColor: customColors.accentColor }} />
              </div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleSaveCustomDesign}
          disabled={!customName.trim()}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40"
        >
          <Save className="w-5 h-5" />
          {texts.saveCustomDesign}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{texts.settingsTitle}</h1>
          <p className="text-slate-500">{texts.settingsDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => setLanguage(prev => prev === 'sv' ? 'en' : 'sv')}
          className="flex-shrink-0 px-3 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Globe className="w-4 h-4" />
          {texts.toggleLanguage}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Section 1: Connection details and fetch helper */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.stageOrganizerApi}</h3>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelOrganizerId}</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="eogRequestCode"
                  value={settings.eogRequestCode}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder={texts.placeholderOrganizerId}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelApiKey}</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="apikey"
                  value={settings.apikey}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder={texts.placeholderApiKey}
                  required
                />
              </div>
            </div>

            {/* Fetch Events Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFetchEvents}
                disabled={fetchingEvents || !settings.eogRequestCode || !settings.apikey}
                className="w-full bg-emerald-50 hover:bg-emerald-100 active:scale-98 disabled:opacity-50 disabled:active:scale-100 text-emerald-700 text-xs font-black py-3 px-4 rounded-2xl border border-emerald-100/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {fetchingEvents ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    {texts.fetchingEvents}
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    {texts.fetchEvents}
                  </>
                )}
              </button>
              
              {fetchEventsError && (
                <div className="text-xs text-red-600 font-semibold mt-2.5 flex items-start gap-1.5 px-3 py-2.5 bg-red-50 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{fetchEventsError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Choose Event */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.stageSelectEvent}</h3>
            </div>

            {/* Dropdown list of events if they are available */}
            {events.length > 0 ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block ml-1">
                  {texts.selectFromList.replace('{count}', events.length.toString())}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <select
                    value={settings.eventRequestCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings(prev => ({ ...prev, eventRequestCode: val }));
                    }}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-850 appearance-none cursor-pointer"
                  >
                    <option value="">{texts.selectAnEvent}</option>
                    {events.map((ev) => {
                      const eventRequestCode = getEventRequestCode(ev);
                      const dateStr = ev.startUtc ? new Date(ev.startUtc).toLocaleDateString('sv-SE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '';
                      const venueStr = ev.venue?.name ? ` @ ${ev.venue.name}` : '';
                      return (
                        <option key={`${ev.id ?? eventRequestCode}-${eventRequestCode}`} value={eventRequestCode}>
                          {ev.name} {dateStr || venueStr ? `(${dateStr}${venueStr})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-xs text-slate-450 font-medium">
                {texts.eventHelpText}
              </div>
            )}

            {/* Input field for selected Event ID */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.eventIdInputLabel}</label>
              <div className="relative">
                <input
                  type="text"
                  name="eventRequestCode"
                  value={settings.eventRequestCode}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder={texts.placeholderManualEventId}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Credentials */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.stageLogin}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelUsername}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={settings.username}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                    placeholder={texts.usernamePlaceholder}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelPassword}</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={settings.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                    placeholder={texts.passwordPlaceholder}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          <Save className="w-5 h-5" />
          {texts.saveSettings}
        </button>
      </form>

      <section className="design-picker bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.designTitle}</h2>
            <p className="text-xs text-slate-500">{texts.designDescription}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDesign('default')}
            aria-pressed={design === 'default'}
            className={`design-option design-option-default rounded-2xl border p-3 text-left transition-all ${design === 'default' ? 'is-selected' : ''}`}
          >
            <span className="design-swatch block mb-2" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-wider">{texts.designDefault}</span>
          </button>
          <button
            type="button"
            onClick={() => setDesign('old-future')}
            aria-pressed={design === 'old-future'}
            className={`design-option design-option-old-future rounded-2xl border p-3 text-left transition-all ${design === 'old-future' ? 'is-selected' : ''}`}
          >
            <span className="design-swatch block mb-2" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-wider">{texts.designOldFuture}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCustomEditor(true)}
            className="design-option design-option-custom rounded-2xl border p-3 text-left transition-all"
          >
            <span className="design-swatch custom-swatch flex items-center justify-center mb-2" aria-hidden="true">
              <Plus className="w-5 h-5" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider">{texts.designCustom}</span>
          </button>
        </div>

        {customDesigns.length > 0 && (
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.savedDesigns}</h3>
            {customDesigns.map(customDesign => {
              const designId: DesignId = `custom:${customDesign.id}`;
              return (
                <div key={customDesign.id} className={`saved-design-row flex items-center gap-2 rounded-2xl border p-2 ${design === designId ? 'is-selected' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setDesign(designId)}
                    className="flex flex-1 min-w-0 items-center gap-3 text-left p-1"
                    aria-pressed={design === designId}
                  >
                    <span
                      className="w-9 h-9 rounded-xl border flex-shrink-0"
                      style={{ background: customDesign.cardColor, borderColor: customDesign.accentColor }}
                    />
                    <span className="text-sm font-bold text-slate-800 truncate">{customDesign.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomDesign(customDesign.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={`${texts.deleteDesign}: ${customDesign.name}`}
                    title={texts.deleteDesign}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}

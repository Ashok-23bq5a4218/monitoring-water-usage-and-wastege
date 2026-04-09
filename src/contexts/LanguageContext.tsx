import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'te';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    home: 'Home',
    map: 'Map',
    report: 'Report',
    admin: 'Admin',
    dashboard: 'save water & save life',
    overview: 'Overview of recent water issues',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    statusOverview: 'Status Overview',
    recentReports: 'Recent Reports',
    noReports: 'No reports yet.',
    reportIssue: 'Report Issue',
    helpUsFix: 'Help us fix water leakages',
    description: 'Description',
    describeIssue: 'Describe the leakage or wastage...',
    location: 'Location',
    getCurrentLocation: 'Get Current Location',
    locationCaptured: 'Location Captured ✓',
    photoOptional: 'Photo (Optional)',
    tapToPhoto: 'Tap to take a photo',
    submitReport: 'Submit Report',
    submitting: 'Submitting...',
    voiceInput: 'Tap to speak',
    listening: 'Listening...',
    issueMap: 'Issue Map',
    viewLeakages: 'View reported leakages in your area',
    adminDashboard: 'Admin Dashboard',
    manageIssues: 'Manage and resolve reported issues',
    allReports: 'All Reports',
    markPending: 'Mark Pending',
    markInProgress: 'Mark In Progress',
    markResolved: 'Mark Resolved',
    reportedBy: 'Reported by:',
    welcome: 'Welcome to AquaGuard',
    loginSubtitle: 'Report water leakages and help save water in your community.',
    signInGoogle: 'Sign in with Google',
    signingIn: 'Signing in...',
    role: 'Role',
  },
  te: {
    home: 'హోమ్',
    map: 'మ్యాప్',
    report: 'నివేదిక',
    admin: 'అడ్మిన్',
    dashboard: 'నీటిని ఆదా చేయండి & ప్రాణాలను రక్షించండి',
    overview: 'ఇటీవలి నీటి సమస్యల అవలోకనం',
    pending: 'పెండింగ్',
    inProgress: 'పురోగతిలో ఉంది',
    resolved: 'పరిష్కరించబడింది',
    statusOverview: 'స్థితి అవలోకనం',
    recentReports: 'ఇటీవలి నివేదికలు',
    noReports: 'ఇంకా నివేదికలు లేవు.',
    reportIssue: 'సమస్యను నివేదించండి',
    helpUsFix: 'నీటి లీకేజీలను పరిష్కరించడంలో మాకు సహాయపడండి',
    description: 'వివరణ',
    describeIssue: 'లీకేజీ లేదా వృధాను వివరించండి...',
    location: 'స్థానం',
    getCurrentLocation: 'ప్రస్తుత స్థానాన్ని పొందండి',
    locationCaptured: 'స్థానం సంగ్రహించబడింది ✓',
    photoOptional: 'ఫోటో (ఐచ్ఛికం)',
    tapToPhoto: 'ఫోటో తీయడానికి నొక్కండి',
    submitReport: 'నివేదికను సమర్పించండి',
    submitting: 'సమర్పిస్తోంది...',
    voiceInput: 'మాట్లాడటానికి నొక్కండి',
    listening: 'వింటున్నాము...',
    issueMap: 'సమస్య మ్యాప్',
    viewLeakages: 'మీ ప్రాంతంలో నివేదించబడిన లీకేజీలను వీక్షించండి',
    adminDashboard: 'అడ్మిన్ డాష్‌బోర్డ్',
    manageIssues: 'నివేదించబడిన సమస్యలను నిర్వహించండి మరియు పరిష్కరించండి',
    allReports: 'అన్ని నివేదికలు',
    markPending: 'పెండింగ్ అని గుర్తించండి',
    markInProgress: 'పురోగతిలో ఉందని గుర్తించండి',
    markResolved: 'పరిష్కరించబడిందని గుర్తించండి',
    reportedBy: 'నివేదించిన వారు:',
    welcome: 'AquaGuard కు స్వాగతం',
    loginSubtitle: 'నీటి లీకేజీలను నివేదించండి మరియు మీ సంఘంలో నీటిని ఆదా చేయడంలో సహాయపడండి.',
    signInGoogle: 'Google తో సైన్ ఇన్ చేయండి',
    signingIn: 'సైన్ ఇన్ అవుతోంది...',
    role: 'పాత్ర',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'te') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

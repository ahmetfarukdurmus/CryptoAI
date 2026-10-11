import React, { createContext, useContext, useState } from 'react';

export type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  tr: {
    // Nav & Titles
    market_radar: 'Piyasa Radarı',
    portfolio: 'Sanal Cüzdan',
    autopilot: 'AI Otopilot',
    settings: 'Ayarlar & Güvenlik',
    coin_detail: 'Varlık Detayı',
    
    // Auth
    login_title: 'CryptoAI Giriş',
    login_subtitle: 'Yapay Zeka Destekli Karar Destek Sistemi',
    email: 'E-Posta Adresi',
    password: 'Şifre',
    login_button: 'Giriş Yap',
    register_button: 'Hesap Oluştur',
    or_continue_with: 'veya şununla devam et',
    google_login: 'Google ile Giriş',
    apple_login: 'Apple ile Giriş',
    demo_login: 'Demo Hesabı ile Hızlı Giriş',
    no_account: 'Hesabınız yok mu? Kayıt Olun',
    have_account: 'Zaten hesabınız var mı? Giriş Yapın',
    logout: 'Çıkış Yap',
    name: 'Ad Soyad',
    otp_title: 'E-Posta Doğrulama',
    otp_subtitle: '6 haneli doğrulama kodunuzu girin',
    otp_button: 'Kodu Doğrula & Başla',
    otp_resend: 'Kodu Tekrar Gönder',
    otp_sent_to: 'Doğrulama kodu şu adrese gönderildi:',

    // Market Radar
    top_20_assets: 'En Hacimli 20 Varlık (Binance Canlı)',
    search_placeholder: 'Sembol veya coin ara (örn: BTC, ETH)...',
    filter_all: 'Tümü',
    filter_ai_signals: 'AI Sinyalleri',
    filter_gainers: 'Yükselenler',
    filter_losers: 'Düşenler',
    price: 'Fiyat',
    change_24h: '24s Değişim',
    volume_24h: '24s Hacim',
    ai_signal: 'AI Sinyali',

    // XAI Card
    explainable_ai: 'Şeffaf Karar Kartı (Explainable AI)',
    ai_confidence: 'Model Güven Skoru',
    take_profit: 'Hedef Kâr (Take-Profit)',
    stop_loss: 'Zarar Kes (Stop-Loss)',
    reasoning_title: 'Neden Bu Karar Verildi?',
    technical_indicators: 'Teknik Göstergeler (Screener)',
    support_resistance: 'Destek & Direnç Seviyeleri',
    support: 'Destek',
    resistance: 'Direnç',
    quick_trade: 'Hızlı Sanal İşlem',

    // Autopilot
    autopilot_title: 'Yapay Zeka Otopilot',
    autopilot_desc: 'Belirlediğiniz risk kurallarına göre AI sinyallerini otomatik sanal emirlerle yürütür.',
    autopilot_active: 'Otopilot Aktif',
    autopilot_inactive: 'Otopilot Devre Dışı',
    risk_settings: 'Risk Yönetimi Parametreleri',
    max_trade_ratio: 'İşlem Başına Bakiye Sınırı',
    max_positions: 'Maksimum Açık Pozisyon',
    min_confidence: 'Minimum AI Güven Eşiği',
    live_activity_logs: 'Canlı Otopilot Aktivite Günlüğü',

    // Portfolio
    total_balance: 'Toplam Sanal Bakiye',
    initial_cash: 'Nakit Bakiye',
    active_positions: 'Açık Pozisyonlar',
    trade_history: 'İşlem Geçmişi',
    total_pnl: 'Toplam Kâr / Zarar',
    no_positions: 'Henüz açık pozisyon bulunmuyor.',
    close_position: 'Pozisyonu Kapat',
    buy: 'Alım Yap (Buy)',
    sell: 'Satış Yap (Sell)',

    // Settings
    academic_info: 'Akademik Bilgi & Bitirme Projesi',
    academic_desc: 'Kripto Para Piyasalarında Çoklu Katmanlı Yapay Zeka Karar Destek Sistemi.',
    security: 'Güvenlik & Oturum',
    jwt_status: 'JWT Oturum Belirteci',
    biometric_login: 'Biyometrik Kimlik Doğrulama',
    app_language: 'Uygulama Dili',
  },
  en: {
    // Nav & Titles
    market_radar: 'Market Radar',
    portfolio: 'Virtual Wallet',
    autopilot: 'AI Autopilot',
    settings: 'Settings & Security',
    coin_detail: 'Asset Details',

    // Auth
    login_title: 'CryptoAI Login',
    login_subtitle: 'AI-Powered Decision Support System',
    email: 'Email Address',
    password: 'Password',
    login_button: 'Sign In',
    register_button: 'Create Account',
    or_continue_with: 'or continue with',
    google_login: 'Sign in with Google',
    apple_login: 'Sign in with Apple',
    demo_login: 'Quick Demo Access',
    no_account: "Don't have an account? Sign Up",
    have_account: 'Already have an account? Sign In',
    logout: 'Log Out',
    name: 'Full Name',
    otp_title: 'Email Verification',
    otp_subtitle: 'Enter your 6-digit verification code',
    otp_button: 'Verify Code & Get Started',
    otp_resend: 'Resend Code',
    otp_sent_to: 'Verification code was sent to:',

    // Market Radar
    top_20_assets: 'Top 20 Assets (Binance Live Feed)',
    search_placeholder: 'Search symbol or name (e.g. BTC, ETH)...',
    filter_all: 'All',
    filter_ai_signals: 'AI Signals',
    filter_gainers: 'Top Gainers',
    filter_losers: 'Top Losers',
    price: 'Price',
    change_24h: '24h Change',
    volume_24h: '24h Volume',
    ai_signal: 'AI Signal',

    // XAI Card
    explainable_ai: 'Explainable AI Decision Card',
    ai_confidence: 'Model Confidence',
    take_profit: 'Take-Profit',
    stop_loss: 'Stop-Loss',
    reasoning_title: 'Why was this decision made?',
    technical_indicators: 'Technical Indicators (Screener)',
    support_resistance: 'Support & Resistance Levels',
    support: 'Support',
    resistance: 'Resistance',
    quick_trade: 'Quick Virtual Trade',

    // Autopilot
    autopilot_title: 'AI Autopilot Engine',
    autopilot_desc: 'Automatically executes virtual trades based on AI signals and strict risk limits.',
    autopilot_active: 'Autopilot Active',
    autopilot_inactive: 'Autopilot Disabled',
    risk_settings: 'Risk Management Parameters',
    max_trade_ratio: 'Max Balance per Trade',
    max_positions: 'Max Concurrent Positions',
    min_confidence: 'Min AI Confidence Threshold',
    live_activity_logs: 'Live Autopilot Activity Log',

    // Portfolio
    total_balance: 'Total Virtual Balance',
    initial_cash: 'Available Cash',
    active_positions: 'Active Positions',
    trade_history: 'Trade History',
    total_pnl: 'Total PnL',
    no_positions: 'No active positions yet.',
    close_position: 'Close Position',
    buy: 'Buy (Long)',
    sell: 'Sell (Short)',

    // Settings
    academic_info: 'Academic Info & Thesis Context',
    academic_desc: 'Multi-Tier AI Decision Support System for Cryptocurrency Markets.',
    security: 'Security & Session',
    jwt_status: 'JWT Session Token',
    biometric_login: 'Biometric Authentication',
    app_language: 'App Language',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'tr',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

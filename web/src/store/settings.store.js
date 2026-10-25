import { create } from 'zustand';
import { settingsApi } from '../api';

const useSettingsStore = create((set, get) => ({
  offerBadgeColor: '#e91e8c',
  offerBadgeTextColor: '#ffffff',
  // Combos entry appearance (admin → Combos → "Combo icon & theme")
  comboIconUrl: null,
  comboThemeEnabled: false,
  comboThemeColor: '#e91e8c',
  comboThemeBgColor: '#1a0a12',
  fetched: false,

  fetchSettings: async () => {
    if (get().fetched) return;
    try {
      const res = await settingsApi.getPayment();
      set({
        offerBadgeColor: res.data.offer_badge_color || '#e91e8c',
        offerBadgeTextColor: res.data.offer_badge_text_color || '#ffffff',
        comboIconUrl: res.data.combo_icon_url || null,
        comboThemeEnabled: !!res.data.combo_theme_enabled,
        comboThemeColor: res.data.combo_theme_color || '#e91e8c',
        comboThemeBgColor: res.data.combo_theme_bg_color || '#1a0a12',
        fetched: true,
      });
    } catch {
      set({ fetched: true });
    }
  },
}));

export default useSettingsStore;

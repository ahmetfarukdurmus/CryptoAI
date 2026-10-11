import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeSelectorCard: React.FC = () => {
  const { themeMode, setThemeMode, colors } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { mode: 'dark', label: '🌙 Koyu', icon: 'moon' },
    { mode: 'light', label: '☀️ Açık', icon: 'sunny' },
    { mode: 'system', label: '⚙️ Sistem', icon: 'phone-portrait-outline' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Görünüm ve Tema</Text>
      </View>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              onPress={() => setThemeMode(opt.mode)}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: isActive ? colors.primaryMuted : colors.cardBgElevated,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon}
                size={16}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

export const AutopilotMasterSwitch: React.FC<Props> = ({ enabled, onToggle }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.masterCard,
        {
          backgroundColor: enabled ? colors.cardBg : colors.cardBg,
          borderColor: enabled ? colors.bullish : colors.border,
        },
      ]}
    >
      <View style={styles.masterTop}>
        <View style={styles.masterInfo}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: enabled ? colors.bullish : colors.bearish },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: enabled ? colors.bullish : colors.bearish },
              ]}
            >
              {enabled ? t('autopilot_active') : t('autopilot_inactive')}
            </Text>
          </View>
          <Text style={[styles.masterTitle, { color: colors.textPrimary }]}>{t('autopilot_title')}</Text>
          <Text style={[styles.masterDesc, { color: colors.textSecondary }]}>{t('autopilot_desc')}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.bullish }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={[styles.archBadge, { backgroundColor: colors.cardBgElevated }]}>
        <Ionicons name="git-network-outline" size={14} color={colors.primary} />
        <Text style={[styles.archText, { color: colors.textSecondary }]}>
          Python FastAPI (AI) ➔ C# ASP.NET Core (BackgroundService) ➔ SignalR Dağıtım
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  masterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  masterInfo: {
    flex: 1,
    paddingRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  masterTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  masterDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  archBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  archText: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
});

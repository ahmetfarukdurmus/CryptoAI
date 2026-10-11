import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AutopilotLog } from '../../types/crypto';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  logs: AutopilotLog[];
  onClear: () => void;
}

export const AutopilotActivityFeed: React.FC<Props> = ({ logs, onClear }) => {
  const { t } = useLanguage();
  const { colors } = useTheme();

  const getTypeColor = (type: AutopilotLog['type']) => {
    switch (type) {
      case 'profit':
        return colors.bullish;
      case 'loss':
        return colors.bearish;
      case 'trade':
        return colors.primary;
      case 'info':
      default:
        return colors.neutral;
    }
  };

  const getTypeMutedBg = (type: AutopilotLog['type']) => {
    switch (type) {
      case 'profit':
        return colors.bullishMuted;
      case 'loss':
        return colors.bearishMuted;
      case 'trade':
        return colors.primaryMuted;
      case 'info':
      default:
        return colors.neutralMuted;
    }
  };

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="terminal-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('autopilot_logs')}</Text>
        </View>
        {logs.length > 0 && (
          <TouchableOpacity onPress={onClear} style={[styles.clearBtn, { backgroundColor: colors.cardBgElevated }]}>
            <Text style={[styles.clearText, { color: colors.textMuted }]}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyLogs}>
          <Ionicons name="hardware-chip-outline" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyLogsText, { color: colors.textSecondary }]}>
            Henüz otopilot işlemi gerçekleşmedi. Otopilot açıkken model koşulları sağlandığında emirler burada loglanacaktır.
          </Text>
        </View>
      ) : (
        logs.map((log) => {
          const typeColor = getTypeColor(log.type);
          const typeBg = getTypeMutedBg(log.type);
          return (
            <View
              key={log.id}
              style={[
                styles.logItem,
                {
                  backgroundColor: colors.cardBgElevated,
                  borderLeftColor: typeColor,
                },
              ]}
            >
              <View style={styles.logTop}>
                <View
                  style={[
                    styles.actionBadge,
                    { backgroundColor: typeBg },
                  ]}
                >
                  <Text style={[styles.actionText, { color: typeColor }]}>
                    {log.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.logTime, { color: colors.textMuted }]}>{log.time}</Text>
              </View>
              <Text style={[styles.logReason, { color: colors.textPrimary }]}>{log.message}</Text>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyLogs: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyLogsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  logItem: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logTime: {
    fontSize: 10,
  },
  logReason: {
    fontSize: 12,
    lineHeight: 16,
  },
});

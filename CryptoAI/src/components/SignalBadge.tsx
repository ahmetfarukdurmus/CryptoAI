import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SignalAction } from '../types/crypto';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SignalBadgeProps {
  action: SignalAction;
  confidence?: number;
  compact?: boolean;
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({ action, confidence, compact = false }) => {
  const { colors } = useTheme();

  const getBadgeConfig = () => {
    switch (action) {
      case 'GÜÇLÜ AL':
        return {
          bg: colors.bullishMuted,
          border: colors.bullish,
          color: colors.bullish,
          icon: 'trending-up' as const,
        };
      case 'AL':
        return {
          bg: colors.bullishMuted,
          border: 'rgba(0, 230, 118, 0.4)',
          color: colors.bullish,
          icon: 'arrow-up' as const,
        };
      case 'SAT':
        return {
          bg: colors.bearishMuted,
          border: 'rgba(255, 82, 82, 0.4)',
          color: colors.bearish,
          icon: 'arrow-down' as const,
        };
      case 'GÜÇLÜ SAT':
        return {
          bg: colors.bearishMuted,
          border: colors.bearish,
          color: colors.bearish,
          icon: 'trending-down' as const,
        };
      case 'NÖTR':
      default:
        return {
          bg: colors.neutralMuted,
          border: 'rgba(255, 160, 0, 0.4)',
          color: colors.neutral,
          icon: 'swap-horizontal' as const,
        };
    }
  };

  const config = getBadgeConfig();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: config.bg, borderColor: config.border }]}>
        <Ionicons name={config.icon} size={11} color={config.color} />
        <Text style={[styles.compactText, { color: config.color }]}>{action}</Text>
        {confidence !== undefined && (
          <Text style={[styles.compactConfidence, { color: config.color }]}>%{confidence}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={styles.actionRow}>
        <Ionicons name={config.icon} size={14} color={config.color} style={{ marginRight: 4 }} />
        <Text style={[styles.text, { color: config.color }]}>{action}</Text>
      </View>
      {confidence !== undefined && (
        <View style={[styles.confidenceBadge, { backgroundColor: config.border }]}>
          <Text style={styles.confidenceText}>%{confidence}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  compactText: {
    fontSize: 10,
    fontWeight: '700',
  },
  compactConfidence: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.85,
  },
});

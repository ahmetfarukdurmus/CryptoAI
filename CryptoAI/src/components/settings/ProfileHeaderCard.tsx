import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../types/crypto';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolio } from '../../context/PortfolioContext';

interface Props {
  user: UserProfile | null;
}

export const ProfileHeaderCard: React.FC<Props> = ({ user }) => {
  const { colors } = useTheme();
  const { totalBalance, positions } = usePortfolio();

  const getInitials = () => {
    if (!user) return 'AI';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {getInitials()}
          </Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user ? user.name : 'Misafir Kullanıcı'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user ? user.email : 'Oturum açılmadı'}
          </Text>
          <View style={[styles.providerBadge, { backgroundColor: colors.cardBgElevated }]}>
            <Ionicons
              name={
                user?.authProvider === 'google'
                  ? 'logo-google'
                  : user?.authProvider === 'apple'
                  ? 'logo-apple'
                  : 'mail-outline'
              }
              size={12}
              color={colors.primary}
            />
            <Text style={[styles.providerText, { color: colors.textSecondary }]}>
              {user?.authProvider === 'google'
                ? 'Google OAuth 2.0 Doğrulandı'
                : user?.authProvider === 'apple'
                ? 'Apple Kimliği ile Giriş'
                : 'E-Posta & Şifreli Giriş'}
            </Text>
          </View>
        </View>
      </View>

      {/* User Assets & Balance Summary Banner */}
      <View style={[styles.assetBanner, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}>
        <View style={styles.assetStat}>
          <Text style={[styles.assetLabel, { color: colors.textMuted }]}>Sanal Portföy Değeri</Text>
          <Text style={[styles.assetVal, { color: colors.bullish }]}>
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.assetStat}>
          <Text style={[styles.assetLabel, { color: colors.textMuted }]}>Açık Pozisyonlar</Text>
          <Text style={[styles.assetVal, { color: colors.primary }]}>
            {positions.length} Varlık
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 19,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    marginBottom: 6,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  providerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  assetStat: {
    alignItems: 'center',
  },
  assetLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  assetVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 22,
  },
});

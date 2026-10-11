import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { authStyles as styles } from '../../styles/authStyles';
import { authService } from '../../services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = typeof params.email === 'string' ? params.email : '';

  const { verifyOtp } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleVerify = async () => {
    const trimmedEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      showAlert('Geçersiz E-Posta', 'Lütfen geçerli bir e-posta adresi giriniz');
      return;
    }

    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      showAlert('Eksik Kod', 'Lütfen 6 haneli doğrulama kodunuzu eksiksiz girin.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(trimmedEmail, cleanOtp);
    setLoading(false);

    if (res.success) {
      showAlert('Hesap Doğrulandı', 'E-posta adresiniz başarıyla onaylandı. Ana sayfaya yönlendiriliyorsunuz.');
      router.replace('/(tabs)');
    } else {
      showAlert('Doğrulama Başarısız', res.error || 'Girdiğiniz kod hatalı veya süresi dolmuş.');
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      showAlert('Geçersiz E-Posta', 'Lütfen geçerli bir e-posta adresi giriniz');
      return;
    }

    setResending(true);
    const res = await authService.resendOtp(trimmedEmail);
    setResending(false);

    if (res.success) {
      showAlert(
        'Kod Tekrar Gönderildi',
        'Yeni doğrulama kodu e-posta adresinize gönderildi.'
      );
    } else {
      showAlert('Kod Gönderilemedi', res.error || 'Kod tekrar gönderilirken bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand & Navigation Header */}
        <View style={styles.brandHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={[styles.logoBadge, { backgroundColor: colors.cardBgElevated, borderColor: colors.primary }]}>
            <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
          </View>

          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            E-Posta <Text style={{ color: colors.primary }}>Doğrulama</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            {t('otp_subtitle')}
          </Text>
        </View>

        {/* Verification Card */}
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
            {t('otp_title')}
          </Text>

          {/* Email Info Badge */}
          {email ? (
            <View style={[styles.otpEmailBadge, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="mail" size={14} color={colors.primary} />
              <Text style={[styles.otpEmailText, { color: colors.primary }]}>
                {email}
              </Text>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('email')}</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="ornek@universite.edu.tr"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          )}

          {/* 6-Digit OTP Input */}
          <View style={styles.otpInputContainer}>
            <TextInput
              style={[
                styles.otpTextInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: otp.length === 6 ? colors.primary : colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
              autoFocus
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleVerify}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.background }]}>
                {t('otp_button')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend Code Button */}
          <TouchableOpacity
            onPress={handleResend}
            activeOpacity={0.7}
            disabled={resending}
            style={styles.resendBtn}
          >
            {resending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={16} color={colors.primary} />
                <Text style={[styles.resendBtnText, { color: colors.primary }]}>
                  {t('otp_resend')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Switch to login */}
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.switchAuthBtn}>
            <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>
              {t('have_account')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

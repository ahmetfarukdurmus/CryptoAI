import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { GoogleIcon } from '../../components/common/GoogleIcon';
import { Ionicons } from '@expo/vector-icons';
import { authStyles as styles } from '../../styles/authStyles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { loginWithEmail, isAuthenticated } = useAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.success) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
    } else if (!res.cancelled) {
      showAlert('Giriş Başarısız', res.error || 'Google ile giriş yapılamadı.');
    }
  };

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    // 1. Sıkı Regex E-posta kontrolü
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      showAlert('Geçersiz E-Posta', 'Lütfen geçerli bir e-posta adresi giriniz');
      return;
    }

    // 2. Minimum 6 karakter Şifre kontrolü
    if (!password || password.length < 6) {
      showAlert('Geçersiz Şifre', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    const res = await loginWithEmail(cleanEmail, password);
    setLoading(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      const err = res.error || 'E-posta veya şifre hatalı.';
      if (err.toLowerCase().includes('doğrula') || err.toLowerCase().includes('verify')) {
        if (Platform.OS === 'web') {
          const goOtp = window.confirm(`${err}\n\nDoğrulama ekranına gitmek istiyor musunuz?`);
          if (goOtp) {
            router.push({ pathname: '/(auth)/verify-otp', params: { email: cleanEmail } });
          }
        } else {
          Alert.alert('E-Posta Doğrulanmadı', `${err}\n\nDoğrulama ekranına gitmek istiyor musunuz?`, [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: 'Kodu Doğrula',
              onPress: () => router.push({ pathname: '/(auth)/verify-otp', params: { email: cleanEmail } }),
            },
          ]);
        }
      } else {
        showAlert('Giriş Başarısız', err);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoBadge, { backgroundColor: colors.cardBgElevated, borderColor: colors.primary }]}>
            <Ionicons name="hardware-chip-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            Crypto<Text style={{ color: colors.primary }}>AI</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>{t('login_subtitle')}</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{t('login_title')}</Text>

          {/* Email input */}
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

          {/* Password input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('password')}</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="Şifreniz"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.background }]}>{t('login_button')}</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.authDivider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>{t('or_continue_with')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            style={[
              styles.googleBtn,
              {
                backgroundColor: colors.cardBgElevated || '#1E2329',
                borderColor: colors.border,
              },
            ]}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <GoogleIcon size={18} />
                <Text style={[styles.googleBtnText, { color: colors.textPrimary }]}>
                  {t('google_login')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Go to register */}
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.switchAuthBtn}>
            <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>{t('no_account')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { authStyles as styles } from '../../styles/authStyles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[@$!%*?&#]/;

export interface PasswordRules {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function checkPasswordStrength(pwd: string): PasswordRules {
  return {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: SPECIAL_CHAR_REGEX.test(pwd),
  };
}

export function isStrongPassword(rules: PasswordRules): boolean {
  return (
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial
  );
}

function CriteriaItem({
  met,
  text,
  submitted,
  colors,
}: {
  met: boolean;
  text: string;
  submitted: boolean;
  colors: any;
}) {
  const iconName = met ? 'checkmark-circle' : submitted ? 'close-circle-outline' : 'ellipse-outline';
  const color = met ? colors.bullish : submitted ? colors.bearish : colors.textMuted;

  return (
    <View style={styles.criteriaRow}>
      <Ionicons name={iconName} size={14} color={color} />
      <Text style={[styles.criteriaText, { color }]}>{text}</Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { registerWithEmail } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(() => checkPasswordStrength(password), [password]);
  const isPasswordValid = useMemo(() => isStrongPassword(passwordRules), [passwordRules]);
  const isConfirmPasswordMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleRegister = async () => {
    setSubmitted(true);

    // 1. İsim alanı kontrolü
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('Eksik Bilgi', 'Lütfen adınızı ve soyadınızı giriniz');
      return;
    }

    // 2. Sıkı Regex E-posta kontrolü
    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      showAlert('Geçersiz E-Posta', 'Lütfen geçerli bir e-posta adresi giriniz');
      return;
    }

    // 3. Güçlü Şifre doğrulaması (8+ karakter, büyük/küçük harf, rakam, özel karakter @$!%*?&#)
    if (!isPasswordValid) {
      const missingList: string[] = [];
      if (!passwordRules.minLength) missingList.push('En az 8 karakter');
      if (!passwordRules.hasUpper) missingList.push('En az bir büyük harf (A-Z)');
      if (!passwordRules.hasLower) missingList.push('En az bir küçük harf (a-z)');
      if (!passwordRules.hasNumber) missingList.push('En az bir rakam (0-9)');
      if (!passwordRules.hasSpecial) missingList.push('En az bir özel karakter (@$!%*?&#)');

      showAlert(
        'Güçlü Şifre Gerekli',
        `Şifreniz güvenlik kriterlerini karşılamıyor:\n\n• ${missingList.join('\n• ')}`
      );
      return;
    }

    // 4. Şifre eşleşme kontrolü
    if (password !== confirmPassword) {
      showAlert('Şifre Uyuşmazlığı', 'Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setLoading(true);
    const res = await registerWithEmail(firstName, lastName, cleanEmail, password);
    setLoading(false);

    if (res.success) {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email: cleanEmail },
      });
    } else {
      showAlert('Kayıt Başarısız', res.error || 'Kayıt işlemi sırasında bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.brandHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.cardBgElevated, borderColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
            Yeni Hesap <Text style={{ color: colors.primary }}>Oluştur</Text>
          </Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            {t('register_subtitle')} • Anında $10.000 Sanal Bakiye
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{t('register_title')}</Text>

          {/* First Name & Last Name inputs */}
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ad</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Ionicons name="person-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Adınız"
                  placeholderTextColor={colors.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Soyad</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Soyadınız"
                  placeholderTextColor={colors.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          </View>

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
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    submitted && !isPasswordValid ? colors.bearish : colors.inputBorder,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="En az 8 karakter, büyük/küçük harf, özel karakter"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputEyeBtn}
                accessibilityLabel="Şifreyi Göster/Gizle"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Inline Password Error Message */}
            {submitted && !isPasswordValid && (
              <Text style={[styles.inlineErrorText, { color: colors.bearish }]}>
                Şifre en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter (@$!%*?&#) içermelidir.
              </Text>
            )}

            {/* Dynamic Password Requirements Checklist */}
            {(password.length > 0 || submitted) && (
              <View
                style={[
                  styles.passwordValidationCard,
                  {
                    backgroundColor: colors.cardBgElevated,
                    borderColor: submitted && !isPasswordValid ? colors.bearish : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.passwordValidationTitle,
                    {
                      color: submitted && !isPasswordValid ? colors.bearish : colors.textSecondary,
                    },
                  ]}
                >
                  Şifre Güvenlik Kriterleri
                </Text>
                <View style={styles.criteriaGrid}>
                  <CriteriaItem
                    met={passwordRules.minLength}
                    text="En az 8 karakter"
                    submitted={submitted}
                    colors={colors}
                  />
                  <CriteriaItem
                    met={passwordRules.hasUpper}
                    text="En az bir büyük harf (A-Z)"
                    submitted={submitted}
                    colors={colors}
                  />
                  <CriteriaItem
                    met={passwordRules.hasLower}
                    text="En az bir küçük harf (a-z)"
                    submitted={submitted}
                    colors={colors}
                  />
                  <CriteriaItem
                    met={passwordRules.hasNumber}
                    text="En az bir rakam (0-9)"
                    submitted={submitted}
                    colors={colors}
                  />
                  <CriteriaItem
                    met={passwordRules.hasSpecial}
                    text="En az bir özel karakter (@$!%*?&#)"
                    submitted={submitted}
                    colors={colors}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('confirm_password')}</Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    submitted && !isConfirmPasswordMatch
                      ? colors.bearish
                      : colors.inputBorder,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.inputEyeBtn}
                accessibilityLabel="Şifre Tekrarını Göster/Gizle"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Inline Confirm Password Error */}
            {submitted && !isConfirmPasswordMatch && (
              <Text style={[styles.inlineErrorText, { color: colors.bearish }]}>
                Girdiğiniz şifreler birbiriyle eşleşmiyor.
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={[styles.submitBtnText, { color: colors.background }]}>{t('register_button')}</Text>
            )}
          </TouchableOpacity>

          {/* Go to login */}
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.switchAuthBtn}>
            <Text style={[styles.switchAuthText, { color: colors.textSecondary }]}>{t('has_account')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

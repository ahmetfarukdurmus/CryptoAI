import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { authStyles as styles } from '../../styles/authStyles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const { registerWithEmail } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleRegister = async () => {
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

    // 3. Minimum 6 karakter Şifre kontrolü
    if (!password || password.length < 6) {
      showAlert('Geçersiz Şifre', 'Şifre en az 6 karakter olmalıdır');
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
            <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="En az 6 karakter"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Confirm Password input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('confirm_password')}</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary }]}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.8}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            <Text style={[styles.submitBtnText, { color: colors.background }]}>{t('register_button')}</Text>
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

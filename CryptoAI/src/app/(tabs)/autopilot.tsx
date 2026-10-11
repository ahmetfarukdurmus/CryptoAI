import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { useAutopilot } from '../../context/AutopilotContext';
import { useTheme } from '../../context/ThemeContext';
import { AutopilotMasterSwitch } from '../../components/autopilot/AutopilotMasterSwitch';
import { RiskConfigSliders } from '../../components/autopilot/RiskConfigSliders';
import { AutopilotActivityFeed } from '../../components/autopilot/AutopilotActivityFeed';

export default function AutopilotScreen() {
  const { config, logs, toggleAutopilot, updateConfig, clearLogs } = useAutopilot();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <AutopilotMasterSwitch enabled={config.enabled} onToggle={toggleAutopilot} />
        <RiskConfigSliders config={config} onUpdate={updateConfig} />
        <AutopilotActivityFeed logs={logs} onClear={clearLogs} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
});

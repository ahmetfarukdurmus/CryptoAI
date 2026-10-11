import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  title,
  type = 'success',
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(-120));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#00E676';
      case 'error':
        return '#FF5252';
      case 'info':
      default:
        return '#00D2FF';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const accentColor = getColor();

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 8, 16),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onDismiss}
        style={[
          styles.card,
          {
            borderColor: accentColor,
            shadowColor: accentColor,
          },
        ]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}20` }]}>
          <Ionicons name={getIcon()} size={22} color={accentColor} />
        </View>

        <View style={styles.textContainer}>
          {title ? (
            <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
          ) : null}
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>

        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.6)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
      },
    }),
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: 17,
  },
  closeBtn: {
    padding: 4,
  },
});

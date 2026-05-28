import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Svg, { Text as SvgText, TSpan } from 'react-native-svg';
import { signInWithGoogle } from '../lib/auth';
import { colors, spacing, typography } from '../theme';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Svg width={200} height={56} viewBox="0 0 320 90">
          <SvgText
            x="0"
            y="80"
            fontFamily="Arial Black, Helvetica Neue, Arial, sans-serif"
            fontSize="96"
            fontWeight="900"
            letterSpacing="-3"
            fill="#FFFFFF"
          >
            {'GR'}
            <TSpan fill="#3DFF5C">Y</TSpan>
            {'T'}
          </SvgText>
        </Svg>
        <Text style={styles.tagline}>Treine com propósito</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'flex-start',
  },
  tagline: {
    ...typography.small,
    color: colors.textSubtle,
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  footer: {
    gap: spacing.md,
  },
  googleButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  googleButtonText: {
    ...typography.label,
    color: '#000',
    fontWeight: '700',
  },
});

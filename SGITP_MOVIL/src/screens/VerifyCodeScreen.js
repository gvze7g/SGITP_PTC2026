import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MailCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { BrandFooter } from '../components/BrandFooter';
import { Button } from '../components/Button';
import { CodeInput } from '../components/CodeInput';
import { IconBadge } from '../components/IconBadge';
import { colors } from '../constants/colors';
import { useVerifyCodeForm } from '../hooks/useVerifyCodeForm';

// Pantalla para escribir el código de 6 caracteres que llega por correo.
// Se usa en 2 casos distintos, según el parámetro "mode" que le pasa la
// pantalla anterior: "register" (verificar cuenta nueva) o "recovery"
// (recuperar contraseña). Esa lógica vive en useVerifyCodeForm.
export function VerifyCodeScreen({ route, navigation }) {
  const { mode, email } = route.params ?? {};
  const { code, setCode, submit, resend, isSubmitting, isResending } = useVerifyCodeForm({
    mode,
    email,
    onSuccess: () => navigation.replace(mode === 'register' ? 'Login' : 'NewPassword'),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Círculo decorativo detrás del logo/título, no se puede tocar (pointerEvents="none") */}
      <View style={styles.glow} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText variant="wordmark" style={styles.wordmark}>
            PEQUES
          </AppText>

          <IconBadge size={72} backgroundColor={colors.surface}>
            <MailCheck size={28} color={colors.text} />
          </IconBadge>

          <AppText variant="headingMedium" style={styles.title}>
            Verificar Código
          </AppText>
          <AppText variant="bodyRegular" style={styles.subtitle}>
            Ingresa el código de 6 dígitos enviado a tu correo
          </AppText>

          <View style={styles.codeInput}>
            <CodeInput value={code} onChangeText={setCode} />
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              label="Verificar"
              onPress={submit}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </View>

          {/* El botón de reenviar solo existe en modo "recovery": el registro no
              tiene un endpoint para reenviar el código, así que aquí no aparece */}
          {resend ? (
            <View style={styles.resendRow}>
              <AppText variant="muted">¿No recibiste el código? </AppText>
              <Pressable onPress={resend} disabled={isResending} hitSlop={8}>
                <AppText variant="link" style={styles.resendLink}>
                  {isResending ? 'Enviando…' : 'Reenviar código'}
                </AppText>
              </Pressable>
            </View>
          ) : null}

          <BrandFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    top: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.glow,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  wordmark: {
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  codeInput: {
    alignSelf: 'stretch',
    marginBottom: 28,
  },
  buttonWrapper: {
    alignSelf: 'stretch',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendLink: {
    textDecorationLine: 'underline',
  },
});

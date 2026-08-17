import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { Apple, Globe } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Divider } from '../components/Divider';
import { KeyboardAvoidingScreen } from '../components/KeyboardAvoidingScreen';
import { TextField } from '../components/TextField';
import { useTheme } from '../context/ThemeContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { useSocialAuth } from '../hooks/useSocialAuth';

// Pantalla de inicio de sesión. Toda la lógica (validación, llamada al
// backend, mensajes) vive en useLoginForm; aquí solo armamos la vista.
export function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const goToApp = () => navigation.replace('MainTabs');

  const { control, errors, onSubmit, isSubmitting, rememberMe, toggleRememberMe } =
    useLoginForm(goToApp);

  // Login con Google y Apple: la lógica vive en useSocialAuth.
  const {
    signInWithGoogle,
    signInWithApple,
    isGoogleReady,
    isAppleAvailable,
    isGoogleLoading,
    isAppleLoading,
  } = useSocialAuth(goToApp);

  const isBusy = isSubmitting || isGoogleLoading || isAppleLoading;

  return (
    <KeyboardAvoidingScreen contentStyle={styles.content}>
      <AppText variant="wordmark" style={styles.wordmark}>
        PEQUES
      </AppText>
      <AppText variant="muted" style={styles.subtitle}>
        Bienvenido de nuevo
      </AppText>

      {/* Controller conecta cada TextField con react-hook-form: le pasa el valor
          actual y avisa cuando el usuario escribe, para poder validar el formulario */}
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            placeholder="Email"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="email-address"
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            placeholder="Contraseña"
            value={field.value}
            onChangeText={field.onChange}
            secureField
            error={errors.password?.message}
          />
        )}
      />

      <View style={styles.optionsRow}>
        <Checkbox label="Recordarme" checked={rememberMe} onToggle={toggleRememberMe} />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
          <AppText variant="link">Recuperar contraseña</AppText>
        </Pressable>
      </View>

      <Button
        label="Iniciar sesión"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isBusy}
      />

      <View style={styles.divider}>
        <Divider label="o" />
      </View>

      {/* Apple solo aparece en iOS: en Android su SDK no existe.
          Google funciona en ambas plataformas. */}
      <View style={styles.socialGroup}>
        {isAppleAvailable ? (
          <>
            <Button
              label="Continuar con Apple"
              variant="outline"
              icon={<Apple size={18} color={colors.text} />}
              onPress={signInWithApple}
              loading={isAppleLoading}
              disabled={isBusy}
            />
            <View style={styles.socialGap} />
          </>
        ) : null}

        <Button
          label="Continuar con Google"
          variant="outline"
          icon={<Globe size={18} color={colors.text} />}
          onPress={signInWithGoogle}
          loading={isGoogleLoading}
          disabled={isBusy || !isGoogleReady}
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="muted">¿No tienes cuenta? </AppText>
        <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
          <AppText variant="link" style={styles.footerLink}>
            CREAR CUENTA
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingScreen>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    content: {
      paddingTop: 32,
    },
    wordmark: {
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 32,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    divider: {
      marginVertical: 24,
    },
    socialGroup: {
      marginBottom: 8,
    },
    socialGap: {
      height: 14,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 28,
    },
    footerLink: {
      textDecorationLine: 'underline',
    },
  });
}

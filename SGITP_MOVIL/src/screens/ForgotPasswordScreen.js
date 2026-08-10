import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight, LockKeyholeOpen } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { IconBadge } from '../components/IconBadge';
import { KeyboardAvoidingScreen } from '../components/KeyboardAvoidingScreen';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { colors } from '../constants/colors';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

// Pantalla "Recuperar Acceso": el usuario escribe su correo y le mandamos un
// código de 6 caracteres. Luego lo llevamos a VerifyCode en modo "recovery".
export function ForgotPasswordScreen({ navigation }) {
  const { control, errors, onSubmit, isSubmitting } = useForgotPasswordForm((email) =>
    navigation.navigate('VerifyCode', { mode: 'recovery', email })
  );

  return (
    <KeyboardAvoidingScreen
      header={<ScreenHeader onBack={() => navigation.goBack()} />}
      contentStyle={styles.content}
    >
      <View style={styles.card}>
        <IconBadge size={64} backgroundColor={colors.background}>
          <LockKeyholeOpen size={26} color={colors.text} />
        </IconBadge>

        <AppText variant="headingMedium" style={styles.title}>
          Recuperar Acceso
        </AppText>
        <AppText variant="bodyRegular" style={styles.subtitle}>
          Ingresa el correo electrónico asociado a tu cuenta para recibir un código de
          verificación seguro.
        </AppText>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Correo electrónico"
              variant="underline"
              placeholder="tu@correo.com"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        <Button
          label="Enviar código"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<ArrowRight size={16} color={colors.white} />}
          iconPosition="right"
        />

        <Pressable
          style={styles.backToLogin}
          onPress={() => navigation.replace('Login')}
          hitSlop={8}
        >
          <AppText variant="label" style={styles.backToLoginLabel}>
            Volver a iniciar sesión
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.cardTan,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    textAlign: 'center',
    marginTop: 18,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  backToLogin: {
    marginTop: 20,
    alignItems: 'center',
  },
  backToLoginLabel: {
    letterSpacing: 1,
  },
});

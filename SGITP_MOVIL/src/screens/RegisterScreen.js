import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { KeyboardAvoidingScreen } from '../components/KeyboardAvoidingScreen';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { lettersOnly } from '../utils/inputFilters';

// Pantalla de registro. Al crear la cuenta, el backend manda un código por
// correo, así que aquí mandamos al usuario a VerifyCode (modo "register")
// para que lo confirme antes de poder iniciar sesión.
export function RegisterScreen({ navigation }) {
  const { control, errors, onSubmit, isSubmitting } = useRegisterForm((email) =>
    navigation.replace('VerifyCode', { mode: 'register', email })
  );

  return (
    <KeyboardAvoidingScreen
      header={<ScreenHeader onBack={() => navigation.goBack()} />}
      contentStyle={styles.content}
    >
      <AppText variant="headingMedium" style={styles.title}>
          Crear Cuenta
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Únete a nuestra comunidad para descubrir colecciones exclusivas.
        </AppText>

        <View style={styles.row}>
          <View style={styles.rowField}>
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => (
                <TextField
                  label="Nombre"
                  variant="underline"
                  placeholder="Ej. Ana"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCapitalize="words"
                  filter={lettersOnly}
                  maxLength={50}
                  error={errors.firstName?.message}
                />
              )}
            />
          </View>
          <View style={styles.rowField}>
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => (
                <TextField
                  label="Apellido"
                  variant="underline"
                  placeholder="Ej. García"
                  value={field.value}
                  onChangeText={field.onChange}
                  autoCapitalize="words"
                  filter={lettersOnly}
                  maxLength={50}
                  error={errors.lastName?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Correo electrónico"
              variant="underline"
              placeholder="hola@ejemplo.com"
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
              label="Contraseña"
              variant="underline"
              placeholder="········"
              value={field.value}
              onChangeText={field.onChange}
              secureField
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <TextField
              label="Confirmar contraseña"
              variant="underline"
              placeholder="········"
              value={field.value}
              onChangeText={field.onChange}
              secureField
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <Button
          label="Crear cuenta"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />

        <View style={styles.footer}>
          <AppText variant="muted">¿Ya tienes una cuenta? </AppText>
          <Pressable onPress={() => navigation.replace('Login')} hitSlop={8}>
            <AppText variant="link" style={styles.footerLink}>
              INICIAR SESIÓN
            </AppText>
          </Pressable>
        </View>
    </KeyboardAvoidingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 24,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  rowField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

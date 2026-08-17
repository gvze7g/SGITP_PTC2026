import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Info } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { BrandFooter } from '../components/BrandFooter';
import { Button } from '../components/Button';
import { KeyboardAvoidingScreen } from '../components/KeyboardAvoidingScreen';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { useTheme } from '../context/ThemeContext';
import { useNewPasswordForm } from '../hooks/useNewPasswordForm';

// Última pantalla del flujo de recuperación: el usuario ya verificó el
// código y ahora define su nueva contraseña.
export function NewPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { control, errors, onSubmit, isSubmitting } = useNewPasswordForm(() =>
    navigation.replace('Login')
  );

  return (
    <KeyboardAvoidingScreen
      header={<ScreenHeader onBack={() => navigation.goBack()} />}
      contentStyle={styles.content}
    >
      <AppText variant="headingMedium" style={styles.title}>
        Nueva Contraseña
      </AppText>
      <AppText variant="bodyRegular" style={styles.subtitle}>
        Crea una contraseña segura para proteger tu cuenta
      </AppText>

      <Controller
        control={control}
        name="newPassword"
        render={({ field }) => (
          <TextField
            label="Nueva contraseña"
            variant="underline"
            placeholder="········"
            value={field.value}
            onChangeText={field.onChange}
            secureField
            error={errors.newPassword?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmNewPassword"
        render={({ field }) => (
          <TextField
            label="Confirmar contraseña"
            variant="underline"
            placeholder="········"
            value={field.value}
            onChangeText={field.onChange}
            secureField
            error={errors.confirmNewPassword?.message}
          />
        )}
      />

      <View style={styles.infoRow}>
        <Info size={16} color={colors.textMuted} style={styles.infoIcon} />
        <AppText variant="muted" style={styles.infoText}>
          Mínimo 8 caracteres, incluyendo una letra mayúscula y un número.
        </AppText>
      </View>

      <Button
        label="Restablecer contraseña"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
      />

      <BrandFooter />
    </KeyboardAvoidingScreen>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    content: {
      paddingTop: 28,
    },
    title: {
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    subtitle: {
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 28,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 24,
      marginTop: 4,
    },
    infoIcon: {
      marginTop: 2,
      marginRight: 8,
    },
    infoText: {
      flex: 1,
    },
  });
}

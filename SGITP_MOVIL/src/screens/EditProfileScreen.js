import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { digitsOnly, lettersOnly } from '../utils/inputFilters';

// Pantalla "Mis Datos" / "Editar Perfil" (las dos entradas del menú de
// Perfil llevan aquí: no tenía sentido tener dos pantallas casi iguales).
// Solo deja editar nombre y teléfono — el correo no es editable desde acá
// porque cambiarlo implicaría re-verificar la cuenta, y eso no lo pidieron.
export function EditProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [mainPhone, setMainPhone] = useState(user?.main_phone ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    if (fullName.trim().length < 3) {
      showToast('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ full_name: fullName.trim(), main_phone: mainPhone });
      showToast('Datos actualizados', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppText variant="headingMedium" style={styles.title}>
          Mis Datos
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Información personal y contacto.
        </AppText>

        <View style={styles.form}>
          <TextField
            label="Nombre completo"
            placeholder="Tu nombre completo"
            value={fullName}
            onChangeText={setFullName}
            filter={lettersOnly}
            maxLength={50}
          />
          <TextField
            label="Teléfono principal"
            placeholder="00000000"
            value={mainPhone}
            onChangeText={setMainPhone}
            keyboardType="phone-pad"
            filter={digitsOnly}
            maxLength={12}
          />
          <TextField label="Correo electrónico" value={user?.email ?? ''} editable={false} />

          <Button label="Guardar cambios" loading={isSubmitting} onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      marginTop: 4,
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 20,
    },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
    },
  });
}

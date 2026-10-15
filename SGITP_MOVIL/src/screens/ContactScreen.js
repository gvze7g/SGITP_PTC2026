import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AtSign, MessageCircle } from 'lucide-react-native';

import { Accordion } from '../components/Accordion';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { StoreHeader } from '../components/StoreHeader';
import { TextField } from '../components/TextField';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useBranches } from '../hooks/useBranches';
import { lettersOnly } from '../utils/inputFilters';
import { isValidEmail, isValidName } from '../utils/validators';

const SUPPORT_EMAIL = 'hola@peques.com';

const FAQ_ITEMS = [
  {
    question: '¿Cuánto tarda el envío?',
    answer:
      'El envío estándar tarda de 3 a 5 días hábiles. También ofrecemos envío exprés de 24 a 48 horas.',
  },
  {
    question: '¿Aceptan devoluciones?',
    answer:
      'Sí, puedes devolver el producto dentro de los primeros 30 días si no ha sido usado.',
  },
  {
    question: 'Guía de tallas',
    answer:
      'Cada producto muestra las tallas disponibles en su ficha. Si tienes dudas, escríbenos por WhatsApp o correo y te ayudamos a elegir.',
  },
];

// Pantalla "Hablemos": canales de contacto + un formulario que, como no hay
// backend para mensajes de soporte, solo confirma visualmente el envío
// (mismo patrón que el newsletter de Inicio).
export function ContactScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showToast } = useToast();
  const { data: branches } = useBranches();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function openWhatsApp() {
    const phone = branches?.[0]?.phone?.replace(/\D/g, '');
    if (!phone) {
      showToast('Todavía no hay un número de WhatsApp disponible', 'error');
      return;
    }
    Linking.openURL(`https://wa.me/${phone}`);
  }

  function openEmail() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  }

  function handleSend() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Completa todos los campos', 'error');
      return;
    }
    if (!isValidName(name)) {
      showToast('El nombre debe tener al menos 3 letras, sin números ni símbolos', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Ingresa un correo válido', 'error');
      return;
    }
    if (message.trim().length < 10) {
      showToast('El mensaje debe tener al menos 10 caracteres', 'error');
      return;
    }

    const body = `Nombre: ${name.trim()}\nCorreo: ${email.trim()}\n\n${message.trim()}`;
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Consulta desde la app')}&body=${encodeURIComponent(body)}`,
    );
    showToast('Abrimos tu correo con el mensaje listo para enviar', 'success');
    setName('');
    setEmail('');
    setMessage('');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StoreHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <AppText variant="heading" style={styles.title}>
          Hablemos.
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Estamos aquí para ayudarte a encontrar lo mejor para tu pequeño. Escríbenos o revisa
          nuestras preguntas frecuentes.
        </AppText>

        <View style={styles.channelCard}>
          <MessageCircle size={28} color={colors.text} />
          <AppText variant="headingSemiBold" style={styles.channelTitle}>
            WhatsApp
          </AppText>
          <AppText variant="muted" style={styles.channelText}>
            Atención rápida e inmediata para tus dudas de compra o tallas.
          </AppText>
          <Button label="Iniciar Chat" variant="outline" onPress={openWhatsApp} />
        </View>

        <View style={styles.channelCard}>
          <AtSign size={28} color={colors.text} />
          <AppText variant="headingSemiBold" style={styles.channelTitle}>
            Correo
          </AppText>
          <AppText variant="muted" style={styles.channelText}>
            Para consultas extensas o problemas con pedidos.
          </AppText>
          <AppText variant="link" style={styles.emailLink} onPress={openEmail}>
            {SUPPORT_EMAIL}
          </AppText>
        </View>

        <View style={styles.form}>
          <TextField
            label="Nombre"
            placeholder="Tu nombre completo"
            value={name}
            onChangeText={setName}
            filter={lettersOnly}
            maxLength={50}
          />
          <TextField
            label="Email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            maxLength={100}
          />
          <TextField
            label="Mensaje"
            placeholder="¿En qué te podemos ayudar hoy?"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <Button label="Enviar Mensaje" onPress={handleSend} />
        </View>

        <AppText variant="headingMedium" style={styles.faqTitle}>
          Preguntas Frecuentes
        </AppText>
        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item) => (
            <Accordion key={item.question} title={item.question}>
              <AppText variant="bodyRegular" style={styles.faqAnswer}>
                {item.answer}
              </AppText>
            </Accordion>
          ))}
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
      paddingBottom: 40,
    },
    title: {
      marginTop: 8,
      paddingHorizontal: 20,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: 12,
      paddingHorizontal: 32,
      textAlign: 'center',
      lineHeight: 20,
    },
    channelCard: {
      marginTop: 20,
      marginHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 22,
      alignItems: 'center',
      gap: 8,
    },
    channelTitle: {
      marginTop: 4,
    },
    channelText: {
      textAlign: 'center',
      marginBottom: 8,
    },
    emailLink: {
      textDecorationLine: 'underline',
    },
    form: {
      marginTop: 28,
      marginHorizontal: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 20,
    },
    faqTitle: {
      marginTop: 36,
      textAlign: 'center',
    },
    faqList: {
      marginTop: 16,
      paddingHorizontal: 20,
    },
    faqAnswer: {
      lineHeight: 20,
    },
  });
}

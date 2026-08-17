import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Heart,
  House,
  LayoutGrid,
  MessageCircleQuestionMark,
  ScrollText,
  Store,
  User,
  X,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { AppText } from './AppText';

// Panel del menú hamburguesa: accesos directos a las 5 secciones de siempre
// más "Nuestra Historia" y "Contacto y Ayuda", que no tienen su propia
// pestaña abajo (ver StoreHeader.js, que es quien lo abre).
const LINKS = [
  { icon: House, label: 'Inicio', target: { screen: 'MainTabs', params: { screen: 'Inicio' } } },
  {
    icon: LayoutGrid,
    label: 'Colección',
    target: { screen: 'MainTabs', params: { screen: 'Colección' } },
  },
  {
    icon: Heart,
    label: 'Favoritos',
    target: { screen: 'MainTabs', params: { screen: 'Favoritos' } },
  },
  { icon: Store, label: 'Tiendas', target: { screen: 'MainTabs', params: { screen: 'Tiendas' } } },
  { icon: User, label: 'Perfil', target: { screen: 'MainTabs', params: { screen: 'Perfil' } } },
];

const CONTENT_LINKS = [
  { icon: ScrollText, label: 'Nuestra Historia', target: { screen: 'About' } },
  { icon: MessageCircleQuestionMark, label: 'Contacto y Ayuda', target: { screen: 'Contact' } },
];

export function HamburgerMenu({ visible, onClose }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();

  function goTo(target) {
    onClose();
    navigation.navigate(target.screen, target.params);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.panelWrapper} onPress={(event) => event.stopPropagation()}>
          <SafeAreaView style={styles.panel} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <AppText variant="wordmark" style={styles.wordmark}>
                MENÚ
              </AppText>
              <Pressable onPress={onClose} hitSlop={12}>
                <X size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.section}>
              {LINKS.map(({ icon: Icon, label, target }) => (
                <Pressable key={label} style={styles.item} onPress={() => goTo(target)}>
                  <Icon size={18} color={colors.text} />
                  <AppText variant="bodySemiBold">{label}</AppText>
                </Pressable>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              {CONTENT_LINKS.map(({ icon: Icon, label, target }) => (
                <Pressable key={label} style={styles.item} onPress={() => goTo(target)}>
                  <Icon size={18} color={colors.text} />
                  <AppText variant="bodySemiBold">{label}</AppText>
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      flexDirection: 'row',
    },
    panelWrapper: {
      width: '78%',
      maxWidth: 320,
    },
    panel: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    wordmark: {
      fontSize: 14,
      letterSpacing: 3,
    },
    section: {
      paddingHorizontal: 20,
      gap: 4,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
      marginHorizontal: 20,
    },
  });
}

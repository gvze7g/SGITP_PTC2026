import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Sección que se abre/cierra al tocarla (ej. "Materiales & Cuidado" en el
// detalle de producto). Empieza cerrada y muestra "children" al abrirse.
export function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setIsOpen((prev) => !prev)}>
        <AppText variant="label" style={styles.title}>
          {title}
        </AppText>
        <ChevronDown
          size={16}
          color={colors.textMuted}
          style={isOpen ? styles.iconOpen : undefined}
        />
      </Pressable>
      {isOpen ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

//Estilos
const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    letterSpacing: 1,
  },
  iconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    marginTop: 12,
  },
});

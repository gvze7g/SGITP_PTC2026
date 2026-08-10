import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { fontFamily } from '../constants/typography';

// Barra de búsqueda con lupa, usada arriba de la grilla en Colección.
export function SearchInput({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.container}>
      <Search size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.text,
  },
});

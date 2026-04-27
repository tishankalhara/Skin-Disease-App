import { TouchableOpacity, Text, StyleSheet, View, TextInput } from 'react-native';

const Colors = {
  primary: '#1976D2',
  success: '#2E7D32',
  warning: '#F9A825',
  danger: '#D32F2F',
  background: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
};
export const SecondaryButton = ({ title, onPress }: any) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: '#64748B' }]} 
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export const PrimaryButton = ({ title, onPress, disabled = false }: any) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: Colors.primary }, disabled && { opacity: 0.5 }]} 
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  }
});
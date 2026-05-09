import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE_URL } from '../config'; 

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'OTP sent to your email!');


        router.push({
          pathname: '/(auth)/reset-password'as any,
          params: { email: email }

        });

      }
       else {
        Alert.alert('Error', data.detail || data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      Alert.alert('Connection Error', 'Could not connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.shieldIcon}>
            <MaterialCommunityIcons name="lock-reset" size={50} color="#1976D2" />
          </View>
        </View>
        
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address to receive a 6-digit OTP code to reset your password.
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.btn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backButton: { padding: 5, width: 40 },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', marginTop: -80 },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  shieldIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  inputContainer: { marginBottom: 25 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 60 },
  input: { flex: 1, marginLeft: 12, fontSize: 16 },
  btn: { width: '100%', backgroundColor: '#1976D2', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOpacity: 0.1 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
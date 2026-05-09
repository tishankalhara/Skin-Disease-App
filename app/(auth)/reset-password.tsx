import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BASE_URL } from '../config';

export default function ResetPasswordScreen() {
  const router = useRouter();
  
  
  const { email } = useLocalSearchParams(); 
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Error', 'Please enter both OTP and New Password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          otp: otp, 
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Password reset successfully! Please login with your new password.');
        
        router.replace('/(auth)/login'); 
      } else {
        Alert.alert('Error', data.detail || data.message || 'Invalid OTP or expired.');
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      Alert.alert('Connection Error', 'Could not connect to server.');
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
            <MaterialCommunityIcons name="shield-key-outline" size={50} color="#1976D2" />
          </View>
        </View>
        
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to {email} and create a new password.
        </Text>
        
        <View style={styles.inputContainer}>
          
          {/* OTP Input */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="key-outline" size={22} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* New Password Input */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Enter New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
              <MaterialCommunityIcons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          </View>

        </View>

        <TouchableOpacity 
          style={[styles.btn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Save & Login</Text>
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
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', marginTop: -60 },
  iconContainer: { alignItems: 'center', marginBottom: 20 },
  shieldIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  inputContainer: { gap: 15, marginBottom: 25 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 60 },
  input: { flex: 1, marginLeft: 12, fontSize: 16 },
  btn: { width: '100%', backgroundColor: '#1976D2', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOpacity: 0.1 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    // 1. Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
    
      const BASE_URL = 'http://192.168.8.61:8000'; 
      
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        router.replace('/(auth)/login');
      } else {
        Alert.alert("Sign Up Failed", data.detail || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Cannot connect to server. Check your IP and Wi-Fi connection.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.shieldIcon}>
            <MaterialCommunityIcons name="account-plus-outline" size={50} color="#1976D2" />
          </View>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subText}>Join us to start monitoring your skin health</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#64748B" />
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

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

          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#64748B" />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry 
            />
          </View>

          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="lock-check-outline" size={22} color="#64748B" />
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry 
            />
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity style={styles.footer} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.footerText}>Already have an account? <Text style={styles.loginLink}>Sign In</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 50 },
  shieldIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  subText: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8 },
  inputContainer: { gap: 15, marginBottom: 25 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 60 },
  input: { flex: 1, marginLeft: 12, fontSize: 16 },
  signUpBtn: { backgroundColor: '#1976D2', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  signUpText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 14 },
  loginLink: { color: '#1976D2', fontWeight: 'bold' },
});
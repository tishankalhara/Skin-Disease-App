import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../_layout';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);

  
  const handleEmailChange = (text: string) => {
    if (text.endsWith('@') && !email.includes('@')) {
      setEmail(text + 'gmail.com');
    } else {
      setEmail(text);
    }
  };

  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      
      const response = await fetch('http://192.168.8.61:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        
        login(data.role); 
      await AsyncStorage.setItem('userEmail', email);  
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Connection Error", "Cannot connect to the server. Please check your IP address and ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.shieldIcon}>
            <MaterialCommunityIcons name="shield-check" size={60} color="#1976D2" />
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Sign in to continue your skin health journey</Text>
        </View>

        {/* Input Fields */}
        
        <View style={styles.inputContainer}>
          
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#64748B" />
            <TextInput 
              style={styles.input} 
              placeholder="Email Address" 
              value={email}
              
              onChangeText={handleEmailChange} 
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

        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={[styles.signInBtn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Create New Account */}
        <TouchableOpacity 
          style={styles.createAccountBtn} 
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={styles.createAccountText}>Create New Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          "This is a supportive screening tool, not a medical diagnosis."
        </Text>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  shieldIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  welcomeText: { fontSize: 32, fontWeight: 'bold', color: '#0F172A' },
  subText: { fontSize: 16, color: '#050f3f', textAlign: 'center', marginTop: 10 },
  inputContainer: { gap: 15, marginBottom: 25 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 60 },
  input: { flex: 1, marginLeft: 12, fontSize: 16 },
  signInBtn: { width: '80%', alignSelf: 'center', backgroundColor: '#1976D2', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOpacity: 0.1 },
  signInText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  createAccountBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  createAccountText: { color: '#1976D2', fontWeight: '700', fontSize: 16 },
  footerText: { marginTop: 50, color: '#94A3B8', fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
  
});
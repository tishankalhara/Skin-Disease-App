import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  
  // States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Auto-completion Function
  const handleEmailChange = (text: string) => {
    if (text.endsWith('@') && !email.includes('@')) {
      setEmail(text + 'gmail.com');
    } else {
      setEmail(text);
    }
  };

  // Password Validation
  const isLengthValid = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  
  const isPasswordValid = isLengthValid && hasUppercase && hasNumber && hasSpecialChar;

  const handleSignUp = async () => {
    // 1. Validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (!isPasswordValid) {
      Alert.alert("Weak Password", "Please make sure your password meets all the security requirements.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      
      const BASE_URL = 'http://192.168.205.61:8000'; 
      
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

  // Checklist Component 
  const ValidationRow = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <View style={styles.validationRow}>
      <MaterialCommunityIcons 
        name={isValid ? "check-circle" : "close-circle-outline"} 
        size={16} 
        color={isValid ? "#4CAF50" : "#94A3B8"} 
      />
      <Text style={[styles.validationText, { color: isValid ? "#4CAF50" : "#64748B" }]}>
        {text}
      </Text>
    </View>
  );

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
              onChangeText={handleEmailChange} 
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input with Eye Icon */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#64748B" />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <MaterialCommunityIcons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          </View>

          {/* Real-time Password Checklist */}
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>Password must contain:</Text>
            <View style={styles.rulesGrid}>
              <ValidationRow isValid={isLengthValid} text="At least 8 characters" />
              <ValidationRow isValid={hasUppercase} text="At least 1 Uppercase letter (A-Z)" />
              <ValidationRow isValid={hasNumber} text="At least 1 Number (0-9)" />
              <ValidationRow isValid={hasSpecialChar} text="At least 1 Special char (@, $, ! etc.)" />
            </View>
          </View>

          {/* Confirm Password Input with Eye Icon */}
          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="lock-check-outline" size={22} color="#64748B" />
            <TextInput 
              style={styles.input} 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword} 
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <MaterialCommunityIcons 
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          </View>

        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpBtn, { opacity: isPasswordValid ? 1 : 0.7 }]} 
          onPress={handleSignUp}
        >
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
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A' },
  eyeIcon: { padding: 5 },
  
  // Checklist Styles
  checklistContainer: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: -5, marginBottom: 5 },
  checklistTitle: { fontSize: 12, color: '#0F172A', marginBottom: 8, fontWeight: 'bold' },
  rulesGrid: { gap: 6 },
  validationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  validationText: { fontSize: 12 },
  
  signUpBtn: { backgroundColor: '#1976D2', height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  signUpText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 14 },
  loginLink: { color: '#1976D2', fontWeight: 'bold' },
});
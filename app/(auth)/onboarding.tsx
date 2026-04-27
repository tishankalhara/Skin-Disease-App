import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const router = useRouter();

  const TipCard = ({ icon, title, desc, color, borderColor }: any) => (
    <View style={[styles.tipCard, { borderColor: borderColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Quick Tips for Best Results</Text>
        <Text style={styles.headerSub}>Follow these guidelines for accurate screening</Text>

        <TipCard 
          icon="lightbulb-outline" 
          title="Use Good Lighting" 
          desc="Take photos in bright, natural light. Avoid shadows and dark areas."
          color="#1976D2"
          borderColor="#E3F2FD"
        />

        <TipCard 
          icon="focus-auto" 
          title="Focus on the Lesion" 
          desc="Center the affected area and keep the camera steady for clear images."
          color="#2E7D32"
          borderColor="#E8F5E9"
        />

        <TipCard 
          icon="alert-circle-outline" 
          title="One Lesion at a Time" 
          desc="Capture single lesions only. Avoid multiple spots in one image."
          color="#EF6C00"
          borderColor="#FFF3E0"
        />

        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <MaterialCommunityIcons name="alert-outline" size={24} color="#D32F2F" />
            <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This is <Text style={{fontWeight: 'bold'}}>NOT a medical diagnosis</Text>. This tool is for screening purposes only. Always consult a dermatologist or healthcare professional for proper diagnosis and treatment.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.continueBtn} 
          onPress={() => router.push('/(auth)/login' as any)}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginTop: 20 },
  headerSub: { fontSize: 14, color: '#64748B', marginBottom: 30, marginTop: 5 },
  tipCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 15,
    width: '100%',
    alignItems: 'center'
  },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 15, flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  tipDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  disclaimerCard: { 
    backgroundColor: '#FFF5F5', 
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#FFEBEB', 
    width: '100%', 
    marginTop: 10 
  },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  disclaimerTitle: { fontSize: 16, fontWeight: 'bold', color: '#D32F2F', marginLeft: 10 },
  disclaimerText: { fontSize: 13, color: '#D32F2F', lineHeight: 18 },
  continueBtn: { 
    backgroundColor: '#1976D2', 
    width: '100%', 
    height: 50, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 30,
    marginBottom: 20
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
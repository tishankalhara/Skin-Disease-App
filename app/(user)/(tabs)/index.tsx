import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Platform,
  Alert // Added Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker'; 

// 1. Added ImagePicker import
const { width } = Dimensions.get('window');

export default function UserHome() {
  const router = useRouter();

  // 2. Added Camera logic function
  const handleCapture = async () => {

    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Required", "Allow camera access to capture skin images.");
      return;
    }

    // Launch camera immediately
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Navigate to your upload/preview page with the image URI
      router.push({
        pathname: '/(user)/upload',
        params: { imageUri: result.assets[0].uri }
      } as any);
    }
  };

  // 3. Added Gallery logic function
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: '/(user)/upload',
        params: { imageUri: result.assets[0].uri }
      } as any);
    }
  };

  // Helper component for disease labels
  const ConditionBadge = ({ label }: { label: string }) => (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar configuration for clear visibility */}
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Blue Header Section with Top Padding fix */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Skin Disease Detection</Text>
          <Text style={styles.headerSub}>Instant Skin Check</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Main Action Buttons */}
        <View style={styles.actionContainer}>
          {/* 4. Connected handleCapture to this button */}
          <TouchableOpacity 
            style={styles.captureBtn}
            onPress={handleCapture} 
          >
            <MaterialCommunityIcons name="camera-outline" size={24} color="white" />
            <Text style={styles.captureText}>Capture Image</Text>
          </TouchableOpacity>

          {/* 5. Connected handleGallery to this button */}
          <TouchableOpacity 
            style={styles.uploadBtn}
            onPress={handleGallery}
          >
            <MaterialCommunityIcons name="image-outline" size={24} color="#1976D2" />
            <Text style={styles.uploadText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Guidelines Link */}
        <TouchableOpacity 
         style={styles.guidelinesContainer} 
        onPress={() => router.push('/(user)/guidelines')}
          >
         <MaterialCommunityIcons name="help-circle-outline" size={20} color="#1976D2" />
           <Text style={styles.guidelineText}>Photo Guidelines & Best Practices</Text>
         </TouchableOpacity>

        {/* Medical Disclaimer Card */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#EF6C00" />
            <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This tool supports screening only, <Text style={{fontWeight: 'bold'}}>not a medical diagnosis</Text>. Always consult with a healthcare professional for proper evaluation and treatment.
          </Text>
        </View>

        {/* List of detectable conditions */}
        <View style={styles.conditionsSection}>
          <Text style={styles.sectionTitle}>Detects 6 Skin Conditions:</Text>
          <View style={styles.badgeGrid}>
            <ConditionBadge label="Melanoma" />
            <ConditionBadge label="Melanocytic Nevus" />
            <ConditionBadge label="Basal Cell Carcinoma" />
            <ConditionBadge label="Benign Keratosis" />
            <ConditionBadge label="Actinic Keratosis" />
            <ConditionBadge label="Vascular Lesions" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar Implementation */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)')}>
          <MaterialCommunityIcons name="home" size={28} color="#1976D2" />
          <Text style={[styles.tabLabel, { color: '#1976D2' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/history')}>
          <MaterialCommunityIcons name="history" size={28} color="#64748B" />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/profile')}>
          <MaterialCommunityIcons name="account-circle-outline" size={28} color="#64748B" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ... styles keep exactly as you provided ...
const styles = StyleSheet.create({
  guidelinesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  guidelinesText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    backgroundColor: '#1976D2', paddingHorizontal: 20, paddingBottom: 20,
    paddingTop: Constants.statusBarHeight + 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 
  },
  headerContent: { justifyContent: 'center' },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  scrollContainer: { padding: 20, paddingBottom: 110 },
  actionContainer: { gap: 12, marginBottom: 25 },
  captureBtn: { backgroundColor: '#1976D2', height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  captureText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  uploadBtn: { backgroundColor: 'white', height: 55, borderRadius: 12, borderWidth: 1.5, borderColor: '#1976D2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  uploadText: { color: '#1976D2', fontSize: 18, fontWeight: 'bold' },
  guidelineLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 30 },
  guidelineText: { color: '#1976D2', fontSize: 16, fontWeight: '600' },
  disclaimerCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 30, elevation: 2 },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  disclaimerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  disclaimerText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  conditionsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', width: (width / 2) - 25 },
  badgeText: { fontSize: 13, color: '#475569', fontWeight: '500', textAlign: 'center' },
  bottomTabBar: { position: 'absolute', bottom: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', width: '100%', height: 80, borderTopWidth: 1, borderTopColor: '#F1F5F9', justifyContent: 'space-around', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 20 : 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, color: '#64748B' }
});
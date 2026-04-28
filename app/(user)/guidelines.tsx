import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function GuidelinesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Guidelines</Text>
        <View style={{ width: 26 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.mainDescription}>
          To help us provide you with the best possible results, please keep these simple tips in mind when taking a photo of your skin.
        </Text>

        {/* Guideline 1 */}
        <View style={styles.guidelineCard}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="white-balance-sunny" size={28} color="#1976D2" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Good Lighting is Key</Text>
            <Text style={styles.cardDesc}>Use natural daylight if possible. Avoid harsh shadows or taking photos in dark rooms. Do not use the camera flash as it can change the true color of the skin.</Text>
          </View>
        </View>

        {/* Guideline 2 */}
        <View style={styles.guidelineCard}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="focus-auto" size={28} color="#1976D2" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Keep it in Focus</Text>
            <Text style={styles.cardDesc}>Ensure the image is sharp and not blurry. Tap on your screen to focus the camera directly on the skin lesion before capturing.</Text>
          </View>
        </View>

        {/* Guideline 3 */}
        <View style={styles.guidelineCard}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="ruler" size={28} color="#1976D2" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Right Distance</Text>
            <Text style={styles.cardDesc}>Keep the camera about 10-15 cm away from the skin. Don't go too close (it might blur) or too far (the AI won't see the details).</Text>
          </View>
        </View>

        {/* Guideline 4 */}
        <View style={styles.guidelineCard}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="crop-free" size={28} color="#1976D2" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Center the Lesion</Text>
            <Text style={styles.cardDesc}>Make sure the skin mark or mole is right in the middle of the photo. Try to include a little bit of normal skin around it for comparison.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.gotItBtn} onPress={() => router.back()}>
          <Text style={styles.gotItBtnText}>I Understand</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1976D2', 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  mainDescription: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 25 },
  guidelineCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05
  },
  iconBox: { 
    width: 50, 
    height: 50, 
    backgroundColor: '#E3F2FD', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15
  },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  gotItBtn: { 
    backgroundColor: '#1976D2', 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 20,
    marginBottom: 40
  },
  gotItBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
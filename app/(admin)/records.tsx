import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar, 
  Platform,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Picker } from '@react-native-picker/picker'; // Install this: npx expo install @react-native-picker/picker
import Slider from '@react-native-community/slider'; // Install this: npx expo install @react-native-community/slider

const { width } = Dimensions.get('window');

export default function PredictionsRecordsScreen() {
  const router = useRouter();
  const [selectedDisease, setSelectedDisease] = useState('All Diseases');
  const [minConfidence, setMinConfidence] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper component for Record Cards
  const PredictionRecord = ({ id, condition, risk, user, date, confidence }: any) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordId}>{id}</Text>
        <View style={[styles.riskBadge, { backgroundColor: risk === 'High' ? '#FFEBEE' : risk === 'Medium' ? '#FFF3E0' : '#E8F5E9' }]}>
          <Text style={[styles.riskText, { color: risk === 'High' ? '#D32F2F' : risk === 'Medium' ? '#EF6C00' : '#2E7D32' }]}>{risk}</Text>
        </View>
      </View>
      <Text style={styles.conditionTitle}>{condition}</Text>
      <View style={styles.recordMeta}>
        <Text style={styles.metaText}>{user}</Text>
        <Text style={styles.metaText}>{date}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${confidence}%` }]} />
        </View>
        <Text style={styles.confidencePercentage}>{confidence}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Blue Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Predictions & Records</Text>
          
        </View>
        <Text style={styles.headerSub}>Admin Panel</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Filter Section */}
        <View style={styles.filterCard}>
          <View style={styles.filterRow}>
            <MaterialCommunityIcons name="filter-variant" size={20} color="#64748B" />
            <Text style={styles.filterLabel}>Disease Type</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDisease}
              onValueChange={(itemValue) => setSelectedDisease(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="All Diseases" value="All Diseases" />
              <Picker.Item label="Melanoma" value="Melanoma" />
              <Picker.Item label="Benign Keratosis" value="Benign Keratosis" />
              <Picker.Item label="Melanocytic Nevus" value="Melanocytic Nevus" />
              <Picker.Item label="Basal Cell Carcinoma" value="Basal Cell Carcinoma" />
              <Picker.Item label="Actinic Keratosis" value="Actinic Keratosis" />
              <Picker.Item label="Vascular Lesions" value="Vascular Lesions" />
            </Picker>
          </View>

          <Text style={styles.sliderLabel}>Min Confidence: {Math.round(minConfidence)}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#1976D2"
            maximumTrackTintColor="#CBD5E1"
            thumbTintColor="#1976D2"
            value={minConfidence}
            onValueChange={setMinConfidence}
          />
        </View>

        {/* 2. Search and Export (image_9d363f.png) */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={22} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search predictions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.exportBtn}>
          <MaterialCommunityIcons name="download-outline" size={22} color="#1976D2" />
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>

        {/* 3. Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}><Text style={styles.statVal}>Total</Text><Text style={styles.statNum}>6</Text></View>
          <View style={[styles.statBox, {borderColor: '#FFEBEE'}]}><Text style={[styles.statVal, {color: '#D32F2F'}]}>High</Text><Text style={styles.statNum}>2</Text></View>
          <View style={[styles.statBox, {borderColor: '#FFF3E0'}]}><Text style={[styles.statVal, {color: '#EF6C00'}]}>Med</Text><Text style={styles.statNum}>1</Text></View>
          <View style={[styles.statBox, {borderColor: '#E8F5E9'}]}><Text style={[styles.statVal, {color: '#2E7D32'}]}>Low</Text><Text style={styles.statNum}>3</Text></View>
        </View>

        {/* 4. Predictions Records List */}
        <PredictionRecord id="PRED-1245" condition="Melanoma" risk="High" user="USR-001" date="2026-02-09 10:30" confidence={87} />
        <PredictionRecord id="PRED-1244" condition="Basal Cell Carcinoma" risk="Medium" user="USR-003" date="2026-02-09 09:45" confidence={78} />
        <PredictionRecord id="PRED-1242" condition="Benign Keratosis" risk="Low" user="USR-002" date="2026-02-08 16:20" confidence={91} />
        <PredictionRecord id="PRED-1241" condition="Actinic Keratosis" risk="Medium" user="USR-006" date="2026-02-08 14:35" confidence={85} />
        <PredictionRecord id="PRED-1240" condition="Vascular Lesions" risk="Low" user="USR-004" date="2026-02-08 11:50" confidence={89} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1976D2', paddingHorizontal: 20, paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 20 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 30, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  scrollContent: { padding: 15, paddingBottom: 100 },
  filterCard: { backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  filterLabel: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
  pickerContainer: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginBottom: 15 },
  picker: { height: 50, width: '100%' },
  sliderLabel: { fontSize: 13, color: '#64748B', marginBottom: 5, fontWeight: '600' },
  slider: { width: '100%', height: 40 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#1976D2', borderRadius: 12, height: 50, gap: 8, marginBottom: 20 },
  exportText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: 'white', width: (width / 4) - 15, padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statVal: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginTop: 4 },
  recordCard: { backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  recordId: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  riskText: { fontSize: 11, fontWeight: 'bold' },
  conditionTitle: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  recordMeta: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  metaText: { fontSize: 12, color: '#94A3B8' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#1976D2', borderRadius: 4 },
  confidencePercentage: { fontSize: 12, fontWeight: 'bold', color: '#1976D2' }
});
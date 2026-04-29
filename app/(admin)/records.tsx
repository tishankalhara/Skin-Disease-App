import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');


const BACKEND_URL = 'http://192.168.8.61:8000/admin/records'; 

export default function PredictionsRecordsScreen() {
  const router = useRouter();
  
  const [selectedDisease, setSelectedDisease] = useState('All Diseases');
  const [minConfidence, setMinConfidence] = useState(0);
  
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Get Predictions Records from Backend 
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(BACKEND_URL);
        const data = await response.json();
        
        if (data.success) {
          setRecords(data.records);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
    const interval = setInterval(fetchRecords, 10000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Filter Records based on selected disease and confidence
  useEffect(() => {
    let result = records;

    // Disease Type 
    if (selectedDisease !== 'All Diseases') {
      result = result.filter(record => record.condition === selectedDisease);
    }

    // Confidence filtering 
    result = result.filter(record => {
      const confValue = parseFloat(record.confidence.replace('%', '')) || 0;
      return confValue >= minConfidence;
    });

    setFilteredRecords(result);
  }, [records, selectedDisease, minConfidence]);

  // 3. Summary Stats for the current filter
  const totalScans = filteredRecords.length;
  const highRisk = filteredRecords.filter(r => r.risk === 'High').length;
  const medRisk = filteredRecords.filter(r => r.risk === 'Medium').length;
  const lowRisk = filteredRecords.filter(r => r.risk === 'Low').length;

  // 4. CSV File Export Function
  const exportToCSV = async () => {
    try {
      if (filteredRecords.length === 0) {
        Alert.alert("No Data", "There are no records to export.");
        return;
      }

      // CSV header
      let csvString = "Record ID,Condition,Risk Level,User Email,Date,Confidence\n";
      
      // CSV rows
      filteredRecords.forEach(record => {
        csvString += `${record.id},${record.condition},${record.risk},${record.user_email},${record.date},${record.confidence}\n`;
      });

      // create a temporary file and write the CSV string into it

      const fileUri = (FileSystem as any).documentDirectory + "SkinCheck_Records.csv";
      await (FileSystem as any).writeAsStringAsync(fileUri, csvString, { encoding: (FileSystem as any).EncodingType.UTF8 });

      // share the file (WhatsApp / Email etc.)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Records' });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error:any) {
      console.error(error);
      Alert.alert("CSV Error", error.message ||"Unknown error occurred.");
    }
  };

  // Helper component for Record Cards
  const PredictionRecord = ({ id, condition, risk, user, date, confidence }: any) => {
    const confValue = parseFloat(confidence.replace('%', '')) || 0;
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordId}>ID: {id.slice(-6)}</Text> 
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
            <View style={[styles.progressBarFill, { width: `${confValue}%` }]} />
          </View>
          <Text style={styles.confidencePercentage}>{confidence}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Blue Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Predictions & Records</Text>
        </View>
        <Text style={styles.headerSub}>Clinical Case Repository</Text>
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
              <Picker.Item label="Melanocytic Nevi" value="Melanocytic Nevi" />
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

        {/* 2. Export Button*/}
        <TouchableOpacity style={styles.exportBtn} onPress={exportToCSV}>
          <MaterialCommunityIcons name="download-outline" size={22} color="#1976D2" />
          <Text style={styles.exportText}>Export CSV</Text>
        </TouchableOpacity>

        {/* 3. Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}><Text style={styles.statVal}>Total</Text><Text style={styles.statNum}>{totalScans}</Text></View>
          <View style={[styles.statBox, {borderColor: '#FFEBEE'}]}><Text style={[styles.statVal, {color: '#D32F2F'}]}>High</Text><Text style={styles.statNum}>{highRisk}</Text></View>
          <View style={[styles.statBox, {borderColor: '#FFF3E0'}]}><Text style={[styles.statVal, {color: '#EF6C00'}]}>Med</Text><Text style={styles.statNum}>{medRisk}</Text></View>
          <View style={[styles.statBox, {borderColor: '#E8F5E9'}]}><Text style={[styles.statVal, {color: '#2E7D32'}]}>Low</Text><Text style={styles.statNum}>{lowRisk}</Text></View>
        </View>

        {/* 4. Predictions Records List */}
        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={{marginTop: 30}} />
        ) : filteredRecords.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#94A3B8', marginTop: 30}}>No records found for this filter.</Text>
        ) : (
          filteredRecords.map((record, index) => (
            <PredictionRecord 
              key={index}
              id={record.id} 
              condition={record.condition} 
              risk={record.risk} 
              user={record.user_email} 
              date={record.date} 
              confidence={record.confidence} 
            />
          ))
        )}

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
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#1976D2', borderRadius: 12, height: 50, gap: 8, marginBottom: 20, backgroundColor: '#E3F2FD' },
  exportText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: 'white', width: (width / 4) - 15, padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statVal: { fontSize: 12, color: '#64748B', fontWeight: 'bold' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginTop: 4 },
  recordCard: { backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  recordId: { fontSize: 14, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' },
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
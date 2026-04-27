import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  TextInput,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper component for Stats Cards
  const SummaryCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color: color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  // Helper component for History Record Items
  const HistoryRecord = ({ condition, risk, confidence, date, riskColor, riskBg }: any) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.recordTitle}>{condition}</Text>
          <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
            <Text style={[styles.riskText, { color: riskColor }]}>{risk}</Text>
          </View>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="delete-outline" size={22} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.recordDetails}>
        <Text style={styles.detailText}>Confidence: <Text style={styles.confidenceValue}>{confidence}</Text></Text>
        <Text style={styles.detailText}>{date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* 1. Header with Search Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screening History</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={22} color="white" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by condition..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 2. Download Report Button */}
        <TouchableOpacity style={styles.downloadBtn}>
          <MaterialCommunityIcons name="download-outline" size={24} color="#1976D2" />
          <Text style={styles.downloadText}>Download/View Full Report</Text>
        </TouchableOpacity>

        {/* 3. Summary Stats Grid */}
        <View style={styles.summaryGrid}>
          <SummaryCard label="Total Scans" value="5" color="#1976D2" />
          <SummaryCard label="High Risk" value="2" color="#D32F2F" />
          <SummaryCard label="Latest" value="Feb" color="#475569" />
        </View>

        {/* 4. History Records List */}
        <HistoryRecord 
          condition="Melanoma" 
          risk="High" 
          confidence="87%" 
          date="2026-02-09 at 10:30 AM"
          riskColor="#D32F2F"
          riskBg="#FFEBEE"
        />
        
        <HistoryRecord 
          condition="Melanocytic Nevus" 
          risk="Low" 
          confidence="92%" 
          date="2026-02-08 at 02:15 PM"
          riskColor="#2E7D32"
          riskBg="#E8F5E9"
        />

        <HistoryRecord 
          condition="Actinic Keratosis" 
          risk="Medium" 
          confidence="78%" 
          date="2026-02-05 at 09:10 AM"
          riskColor="#EF6C00"
          riskBg="#FFF3E0"
        />

      </ScrollView>

      {/* 5. Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)')}>
          <MaterialCommunityIcons name="home-outline" size={28} color="#64748B" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/history')}>
          <MaterialCommunityIcons name="history" size={28} color="#1976D2" />
          <Text style={[styles.tabLabel, { color: '#1976D2' }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/profile')}>
          <MaterialCommunityIcons name="account-circle-outline" size={28} color="#64748B" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1976D2', 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    paddingTop: Constants.statusBarHeight + 10,
    borderBottomLeftRadius: 5, 
    borderBottomRightRadius: 5 
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 10, 
    paddingHorizontal: 12,
    height: 45
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: 'white', fontSize: 16 },
  scrollContainer: { padding: 15, paddingBottom: 110 },
  downloadBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1.5, 
    borderColor: '#1976D2', 
    borderRadius: 12, 
    height: 55, 
    marginBottom: 20,
    gap: 10,
    backgroundColor: 'white'
  },
  downloadText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  summaryCard: { 
    backgroundColor: 'white', 
    width: (width / 3) - 18, 
    paddingVertical: 15, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2
  },
  summaryValue: { fontSize: 22, fontWeight: 'bold' },
  summaryLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  recordCard: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleArea: { flex: 1 },
  recordTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
  riskText: { fontSize: 12, fontWeight: 'bold' },
  actionIcons: { flexDirection: 'row', gap: 5 },
  iconBtn: { padding: 5 },
  recordDetails: { marginTop: 12 },
  detailText: { fontSize: 14, color: '#64748B', marginBottom: 2 },
  confidenceValue: { color: '#1976D2', fontWeight: 'bold' },
  bottomTabBar: {
    position: 'absolute', bottom: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', width: '100%', height: 80,
    borderTopWidth: 1, borderTopColor: '#F1F5F9', justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, elevation: 20
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, color: '#64748B' }
});
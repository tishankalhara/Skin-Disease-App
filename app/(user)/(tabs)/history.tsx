import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');


const BACKEND_BASE_URL = 'http://192.168.8.61:8000'; 

type ScanRecord = {
  id: string;
  condition: string;
  risk: string;
  confidence: string;
  date: string;
  timestamp: number;
};

export default function HistoryScreen() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // 1. Data from MongoDB 
  const loadHistory = async () => {
    try {
      setLoading(true);
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      if (!userEmail) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_BASE_URL}/history/${userEmail}`);
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error("Failed to load history from database", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Delete Record from History 
  const deleteRecord = (id: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this scan result from the database?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${BACKEND_BASE_URL}/history/${id}`, { method: 'DELETE' });
              
              loadHistory(); 
            } catch (error) {
              Alert.alert("Error", "Could not delete record.");
            }
          } 
        }
      ]
    );
  };

  // 3. create a full report in HTML format and share as PDF
  const generateFullReport = async () => {
    if (historyData.length === 0) {
      Alert.alert("No Records", "You don't have any scan records to generate a report.");
      return;
    }

    try {
      const tableRows = historyData.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.date}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>${item.condition}</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.risk}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.confidence}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #1976D2; text-align: center;">Complete Screening History</h1>
            <p style="text-align: center; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left;">
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 10px;">Date & Time</th>
                <th style="padding: 10px;">Condition</th>
                <th style="padding: 10px;">Risk Level</th>
                <th style="padding: 10px;">Confidence</th>
              </tr>
              ${tableRows}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Error", "Could not generate report.");
    }
  };

  // 4. Real-time Summary 
  const totalScans = historyData.length.toString();
  const highRiskCount = historyData.filter(item => item.risk === 'High').length.toString();
  
  
  const getLatestMonth = () => {
    if (historyData.length === 0) return '-';
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObj = new Date(historyData[0].timestamp);
    return monthNames[dateObj.getMonth()];
  };

  
  const getRiskStyle = (risk: string) => {
    if (risk === 'High') return { bg: '#FFEBEE', text: '#D32F2F' };
    if (risk === 'Medium') return { bg: '#FFF3E0', text: '#EF6C00' };
    return { bg: '#E8F5E9', text: '#2E7D32' };
  };

  // Helper component for Stats Cards
  const SummaryCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color: color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* 1. Header (Search Bar එක අයින් කර ඇත) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screening History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 2. Download Report Button */}
        <TouchableOpacity style={styles.downloadBtn} onPress={generateFullReport}>
          <MaterialCommunityIcons name="download-outline" size={24} color="#1976D2" />
          <Text style={styles.downloadText}>Download/View Full Report</Text>
        </TouchableOpacity>

        {/* 3. Summary Stats Grid (Real-time දත්ත සමග) */}
        <View style={styles.summaryGrid}>
          <SummaryCard label="Total Scans" value={totalScans} color="#1976D2" />
          <SummaryCard label="High Risk" value={highRiskCount} color="#D32F2F" />
          <SummaryCard label="Latest" value={getLatestMonth()} color="#475569" />
        </View>

        {/* 4. History Records List */}
        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 50 }} />
        ) : historyData.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 30, fontSize: 16 }}>
            No history records found.
          </Text>
        ) : (
          historyData.map((record) => {
            const riskStyle = getRiskStyle(record.risk);
            return (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.titleArea}>
                    <Text style={styles.recordTitle}>{record.condition}</Text>
                    <View style={[styles.riskBadge, { backgroundColor: riskStyle.bg }]}>
                      <Text style={[styles.riskText, { color: riskStyle.text }]}>{record.risk}</Text>
                    </View>
                  </View>
                  <View style={styles.actionIcons}>
                    {/* Delete Button */}
                    <TouchableOpacity style={styles.iconBtn} onPress={() => deleteRecord(record.id)}>
                      <MaterialCommunityIcons name="delete-outline" size={22} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.recordDetails}>
                  <Text style={styles.detailText}>Confidence: <Text style={styles.confidenceValue}>{record.confidence}</Text></Text>
                  <Text style={styles.detailText}>{record.date}</Text>
                </View>
              </View>
            );
          })
        )}

      </ScrollView>

      {/* 5. Bottom Tab Bar*/}
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
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 20,
    borderBottomLeftRadius: 5, 
    borderBottomRightRadius: 5 
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
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
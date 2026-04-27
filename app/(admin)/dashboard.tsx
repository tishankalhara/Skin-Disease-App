import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../_layout';
const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [stats, setStats] = useState({ totalUsers: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        
        const response = await fetch('http://192.168.8.61:8000/admin/stats');
        const data = await response.json();
        
        setStats({
          totalUsers: data.totalUsers || 0,
          totalScans: data.totalScans || 0
        });
      } catch (error) {
        console.error("Stats fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login' as any);
  };

  // Stats Card Component
  const StatCard = ({ icon, title, value, subtext, color, iconBg }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color: color }]}>{value}</Text>
      <Text style={[styles.statSub, { color: color }]}>{subtext}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Real-time Insights</Text>
        </View>
        
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center'}}>
           <ActivityIndicator size="large" color="#1976D2" />
           <Text style={{textAlign: 'center', marginTop: 10, color: '#64748B'}}>Connecting to Database...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. Stats Grid Section */}
          <View style={styles.statsGrid}>
            <StatCard 
               icon="account-group" 
               title="Total Users" 
               value={stats.totalUsers.toString()} 
               subtext="Live from MongoDB" 
               color="#1976D2" 
               iconBg="#E3F2FD" 
            />
            <StatCard 
               icon="pulse" 
               title="Total Scans" 
               value={stats.totalScans.toString()} 
               subtext="System Total" 
               color="#2E7D32" 
               iconBg="#E8F5E9" 
            />
            <StatCard 
               icon="trending-up" 
               title="Scans Today" 
               value="0" 
               subtext="Reset at Midnight" 
               color="#EF6C00" 
               iconBg="#FFF3E0" 
            />
            <StatCard 
               icon="clock-outline" 
               title="Avg Confidence" 
               value="--" 
               subtext="Target: 85%+" 
               color="#9C27B0" 
               iconBg="#F3E5F5" 
            />
          </View>

          {/* 2. Disease Distribution Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Disease Distribution</Text>
            <View style={styles.pieContainer}>
               <View style={styles.pieChartPlaceholder} />
               <View style={styles.legendContainer}>
                  <View style={styles.legendRow}>
                     <LegendItem color="#D32F2F" label="Melanoma (18%)" />
                     <LegendItem color="#F9A825" label="BCC (25%)" />
                  </View>
                  <View style={styles.legendRow}>
                     <LegendItem color="#2E7D32" label="Nevus (35%)" />
                     <LegendItem color="#1976D2" label="B.Keratosis (12%)" />
                  </View>
               </View>
            </View>
          </View>

          {/* 3. Recent Activity Section */}
          <View style={[styles.card, { marginBottom: 30 }]}>
            <Text style={styles.cardHeader}>Recent Activity</Text>
            <ActivityItem title="Melanoma Case" user="User_441" time="Just Now" score="87%" />
            <ActivityItem title="Nevus Detected" user="User_921" time="15 min ago" score="91%" />
            <ActivityItem title="BCC Scan" user="User_102" time="1 hour ago" score="78%" />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Helper Components
const LegendItem = ({ color, label }: any) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const ActivityItem = ({ title, user, time, score }: any) => (
  <View style={styles.activityItem}>
    <View style={styles.activityIcon}>
      <MaterialCommunityIcons name="pulse" size={20} color="#1976D2" />
    </View>
    <View style={styles.activityDetails}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityUser}>{user}</Text>
    </View>
    <View style={styles.activityMeta}>
      <Text style={styles.activityScore}>{score}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1976D2', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 25, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  scrollContent: { padding: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { 
    backgroundColor: 'white', 
    width: (width / 2) - 22, 
    padding: 15, 
    borderRadius: 16, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  statTitle: { color: '#64748B', fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  statSub: { fontSize: 11, fontWeight: '600' },
  card: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 16, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  cardHeader: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  pieContainer: { alignItems: 'center' },
  pieChartPlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 15, 
    borderColor: '#2E7D32', 
    borderTopColor: '#D32F2F', 
    borderRightColor: '#F9A825', 
    borderLeftColor: '#1976D2', 
    marginBottom: 20 
  },
  legendContainer: { width: '100%' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#64748B' },
  activityItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  activityIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#E3F2FD', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  activityDetails: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  activityUser: { fontSize: 12, color: '#64748B' },
  activityMeta: { alignItems: 'flex-end' },
  activityScore: { fontSize: 14, fontWeight: 'bold', color: '#1976D2' },
  activityTime: { fontSize: 11, color: '#94A3B8' }
});
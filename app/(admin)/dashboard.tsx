import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import { useAuth } from '../_layout';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');


const BACKEND_URL = `${BASE_URL}/admin/dashboard`; 

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalScans: 0,
    scansToday: 0,
    avgConfidence: "--",
    diseaseDistribution: [] as any[],
    recentActivity: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(BACKEND_URL);
        const data = await response.json();
        
        if (data.success) {
          setDashboardData({
            totalUsers: data.total_users,
            totalScans: data.total_scans,
            scansToday: data.scans_today,
            avgConfidence: data.avg_confidence,
            diseaseDistribution: data.disease_distribution,
            recentActivity: data.recent_activity
          });
        }
      } catch (error) {
        console.error("Dashboard fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login' as any);
  };

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

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just Now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  // CHART DATA PREPARATION
  const chartColors = ['#D32F2F', '#F9A825', '#2E7D32', '#1976D2', '#9C27B0', '#009688'];
  
  const pieData = dashboardData.diseaseDistribution.map((item, index) => ({
    value: item.percentage,
    color: chartColors[index % chartColors.length],
    text: `${item.percentage}%`,
    label: item.name
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
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
          
          <View style={styles.statsGrid}>
            <StatCard icon="account-group" title="Total Users" value={dashboardData.totalUsers.toString()} subtext="Live from MongoDB" color="#1976D2" iconBg="#E3F2FD" />
            <StatCard icon="pulse" title="Total Scans" value={dashboardData.totalScans.toString()} subtext="System Total" color="#2E7D32" iconBg="#E8F5E9" />
            <StatCard icon="trending-up" title="Scans Today" value={dashboardData.scansToday.toString()} subtext="Reset at Midnight" color="#EF6C00" iconBg="#FFF3E0" />
            <StatCard icon="clock-outline" title="Avg Confidence" value={dashboardData.avgConfidence} subtext="Target: 85%+" color="#9C27B0" iconBg="#F3E5F5" />
          </View>

          {/* 2. Disease Distribution Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Disease Distribution</Text>
            
            <View style={styles.pieContainer}>
               <View style={{alignItems: 'center', marginVertical: 15}}>
                 <PieChart
                    data={pieData.length > 0 ? pieData : [{ value: 100, color: '#E2E8F0' }]}
                    donut
                    radius={75}
                    innerRadius={55}
                    innerCircleColor={'white'}
                    centerLabelComponent={() => {
                      return (
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#0F172A' }}>
                            {dashboardData.totalScans}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>Total</Text>
                        </View>
                      );
                    }}
                 />
               </View>

               <View style={styles.legendContainer}>
                  {dashboardData.diseaseDistribution.length === 0 ? (
                    <Text style={{textAlign: 'center', color: '#94A3B8'}}>No scan data yet.</Text>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
                      {dashboardData.diseaseDistribution.map((item, index) => (
                        <LegendItem 
                          key={index} 
                          color={chartColors[index % chartColors.length]} 
                          label={`${item.name} (${item.percentage}%)`} 
                        />
                      ))}
                    </View>
                  )}
               </View>
            </View>
          </View>

          {/* 3. Recent Activity Section */}
          <View style={[styles.card, { marginBottom: 30 }]}>
            <Text style={styles.cardHeader}>Recent Activity</Text>
            {dashboardData.recentActivity.length === 0 ? (
               <Text style={{textAlign: 'center', color: '#94A3B8', marginVertical: 10}}>No recent scans.</Text>
            ) : (
               dashboardData.recentActivity.map((activity, index) => (
                 <ActivityItem 
                    key={index}
                    title={activity.condition} 
                    user={activity.user} 
                    time={formatTimeAgo(activity.timestamp)} 
                    score={activity.confidence} 
                 />
               ))
            )}
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
  header: { backgroundColor: '#1976D2', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  scrollContent: { padding: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { backgroundColor: 'white', width: (width / 2) - 22, padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statTitle: { color: '#64748B', fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  statSub: { fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { fontSize: 17, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  pieContainer: { alignItems: 'center' },
  legendContainer: { width: '100%' },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '48%', marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#64748B' },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  activityIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  activityDetails: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  activityUser: { fontSize: 12, color: '#64748B' },
  activityMeta: { alignItems: 'flex-end' },
  activityScore: { fontSize: 14, fontWeight: 'bold', color: '#1976D2' },
  activityTime: { fontSize: 11, color: '#94A3B8' }
});
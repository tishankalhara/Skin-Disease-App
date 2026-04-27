import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Platform,
  Image,
  Switch,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '../../_layout'; 

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  // State for the Preference toggles
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  // --- DYNAMIC THEME COLORS ---
  const themeContainer = isDarkModeEnabled ? '#121212' : '#F8FAFC';
  const themeCard = isDarkModeEnabled ? '#1E1E1E' : '#FFFFFF';
  const themeText = isDarkModeEnabled ? '#FFFFFF' : '#0F172A';
  const themeSubText = isDarkModeEnabled ? '#A0A0A0' : '#64748B';
  const themeBorder = isDarkModeEnabled ? '#333333' : '#F1F5F9';

  const handleClearHistory = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all saved screenings? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete All", style: "destructive", onPress: () => console.log("History Cleared") }
      ]
    );
  };

  // Helper component for Profile Menu Items
  const MenuItem = ({ icon, title, subtitle, onPress, color = "#475569" }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: themeBorder }]} 
      onPress={onPress}
    >
      <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, { color: themeText }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: themeSubText }]}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={themeSubText} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeContainer }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* 1. Profile Header with Blue Background */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={50} color="#1976D2" />
            <TouchableOpacity style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Tishan Kalhara</Text>
          <Text style={styles.userEmail}>tishan@gmail.com</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* NEW FEATURE: Clear All History Action */}
        <View style={[styles.menuGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          <MenuItem 
            icon="delete-sweep-outline" 
            title="Clear All History" 
            subtitle="Delete all saved screenings"
            color="#D32F2F"
            onPress={handleClearHistory}
          />
        </View>

        {/* 2. Account Settings Group */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={[styles.menuGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          <MenuItem 
            icon="account-edit-outline" 
            title="Edit Profile" 
            subtitle="Change name, email, and photo"
            color="#1976D2"
          />
          <MenuItem 
            icon="shield-check-outline" 
            title="Privacy & Security" 
            subtitle="Manage your data and password"
            color="#2E7D32"
          />
        </View>

        {/* NEW FEATURE: Preferences Group (Notifications & Dark Mode) */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={[styles.menuGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          {/* Notifications Toggle */}
          <View style={styles.preferenceRow}>
            <View style={[styles.iconBg, { backgroundColor: '#1976D215' }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color="#1976D2" />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: themeText }]}>Notifications</Text>
              <Text style={[styles.menuSubtitle, { color: themeSubText }]}>Reminders and updates</Text>
            </View>
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: "#CBD5E1", true: "#1976D2" }}
            />
          </View>

          {/* Dark Mode Toggle - Now Fully Functional */}
          <View style={[styles.preferenceRow, { borderTopWidth: 1, borderTopColor: themeBorder }]}>
            <View style={[styles.iconBg, { backgroundColor: '#1E293B15' }]}>
              <MaterialCommunityIcons 
                name="weather-night" 
                size={22} 
                color={isDarkModeEnabled ? "#FFD700" : "#1E293B"} 
              />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: themeText }]}>Dark Mode</Text>
              <Text style={[styles.menuSubtitle, { color: themeSubText }]}>Switch between light and dark theme</Text>
            </View>
            <Switch 
              value={isDarkModeEnabled} 
              onValueChange={setIsDarkModeEnabled}
              trackColor={{ false: "#CBD5E1", true: "#1976D2" }}
            />
          </View>
        </View>

        {/* 3. Support & More Group */}
        <Text style={styles.sectionLabel}>Support & Legal</Text>
        <View style={[styles.menuGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          <MenuItem 
            icon="help-circle-outline" 
            title="Help Center" 
            color="#64748B"
          />
          <MenuItem 
            icon="file-document-outline" 
            title="Terms & Conditions" 
            color="#64748B"
          />
          <MenuItem 
            icon="information-outline" 
            title="About SkinCheck AI" 
            subtitle="Version 1.0.2"
            color="#64748B"
          />
        </View>

        {/* 4. Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={22} color="#D32F2F" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* 5. Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { backgroundColor: themeCard, borderTopColor: themeBorder }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)')}>
          <MaterialCommunityIcons name="home-outline" size={28} color={themeSubText} />
          <Text style={[styles.tabLabel, { color: themeSubText }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/history')}>
          <MaterialCommunityIcons name="history" size={28} color={themeSubText} />
          <Text style={[styles.tabLabel, { color: themeSubText }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <MaterialCommunityIcons name="account-circle" size={28} color="#1976D2" />
          <Text style={[styles.tabLabel, { color: '#1976D2' }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    backgroundColor: '#1976D2', 
    paddingHorizontal: 20, 
    paddingBottom: 40,
    paddingTop: Constants.statusBarHeight + 10,
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    alignItems: 'center'
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 20 },
  profileInfo: { alignItems: 'center' },
  avatarContainer: { 
    width: 90, height: 90, borderRadius: 45, backgroundColor: 'white', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5
  },
  editBadge: { 
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2E7D32', 
    width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white',
    justifyContent: 'center', alignItems: 'center'
  },
  userName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  scrollContent: { padding: 20, paddingBottom: 110 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#94A3B8', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  menuGroup: { borderRadius: 20, padding: 5, marginBottom: 25, elevation: 1, overflow: 'hidden', borderWidth: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#FFEBEE', padding: 15, borderRadius: 15, gap: 10, marginTop: 10 
  },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
  bottomTabBar: {
    position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80,
    borderTopWidth: 1, justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, elevation: 20
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 }
});
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

const { width } = Dimensions.get('window');

export default function UserManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper component for individual User Cards
  const UserCard = ({ name, email, role, status }: any) => (
    <View style={styles.userCard}>
      <View style={styles.userInfoArea}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userNameText}>{name}</Text>
          <Text style={styles.userEmailText}>{email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <View style={[styles.statusIndicator, { backgroundColor: status === 'Active' ? '#4CAF50' : '#FFC107' }]} />
        <TouchableOpacity style={styles.actionBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* 1. Header with Search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="account-plus-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Statistics Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>124</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>118</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* User List */}
        <UserCard name="Justin Mason" email="justin.m@example.com" role="Patient" status="Active" />
        <UserCard name="Sarah Connor" email="sarah.c@medical.com" role="Doctor" status="Active" />
        <UserCard name="Alex Rivers" email="alex.r@test.com" role="Patient" status="Pending" />
        <UserCard name="Michael Scott" email="michael.s@office.com" role="Admin" status="Active" />
        <UserCard name="Pam Beesly" email="pam.b@design.com" role="Patient" status="Active" />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    backgroundColor: '#1976D2', 
    paddingHorizontal: 20, 
    paddingBottom: 25,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10,
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 30, 
    fontWeight: 'bold' 
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    height: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#0F172A'
  },
  scrollContainer: { 
    padding: 20,
    paddingBottom: 40 
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2'
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1
  },
  userInfoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 18
  },
  userDetails: {
    marginLeft: 15
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  userEmailText: {
    fontSize: 13,
    color: '#64748B'
  },
  roleBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  roleText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600'
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5
  },
  actionBtn: {
    padding: 5
  }
});
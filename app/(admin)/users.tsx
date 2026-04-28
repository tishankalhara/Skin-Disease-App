import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar, 
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');


const BACKEND_URL = 'http://192.168.8.61:8000/admin/users';

export default function UserManagementScreen() {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(BACKEND_URL);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // delete user function with confirmation alert
  const handleDeleteUser = (email: string, name: string) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to permanently delete ${name}? This will also delete their scan history.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/${email}`, {
                method: 'DELETE'
              });
              const data = await response.json();
              
              if (data.success) {
                // Real-time update - delete user from state without refetching
                setUsers(users.filter(user => user.email !== email));
                Alert.alert("Success", "User deleted successfully.");
              } else {
                Alert.alert("Error", "Could not delete user.");
              }
            } catch (error) {
              Alert.alert("Error", "Server connection failed.");
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({ name, email, role, status }: any) => (
    <View style={styles.userCard}>
      <View style={styles.userInfoArea}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
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
        
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteUser(email, name)}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={{ width: 26 }} /> 
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

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
           <ActivityIndicator size="large" color="#1976D2" />
           <Text style={{color: '#64748B', marginTop: 10}}>Loading Users...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{users.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          {filteredUsers.length === 0 ? (
             <Text style={{textAlign: 'center', color: '#94A3B8', marginTop: 30}}>No users found matching "{searchQuery}"</Text>
          ) : (
             filteredUsers.map((user, index) => (
               <UserCard 
                 key={index} 
                 name={user.name} 
                 email={user.email} 
                 role={user.role} 
                 status="Active" 
               />
             ))
          )}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#1976D2', 
    paddingHorizontal: 20, 
    paddingBottom: 25,
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10,
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 15, alignItems: 'center', height: 50, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1976D2' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  userCard: { backgroundColor: 'white', borderRadius: 16, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  userInfoArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1976D2', fontWeight: 'bold', fontSize: 18 },
  userDetails: { marginLeft: 15, flex: 1 },
  userNameText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  userEmailText: { fontSize: 13, color: '#64748B' },
  roleBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  actionBtn: { padding: 5 }
});
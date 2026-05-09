import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../_layout';
import { BASE_URL } from '../../config';


const BACKEND_BASE_URL = BASE_URL; 

const districtsList = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isHelpModalVisible, setHelpModalVisible] = useState(false);
  const [isTermsModalVisible, setTermsModalVisible] = useState(false);
  const [editAgeInput, setEditAgeInput] = useState('');   
  const [editGenderInput, setEditGenderInput] = useState(''); 
  const [editdistrictInput, setEditdistrictInput] = useState(''); 
  const [isSecurityModalVisible, setSecurityModalVisible] = useState(false);
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  // --- DYNAMIC THEME COLORS ---
  const themeContainer = isDarkModeEnabled ? '#121212' : '#F8FAFC';
  const themeCard = isDarkModeEnabled ? '#1E1E1E' : '#FFFFFF';
  const themeText = isDarkModeEnabled ? '#FFFFFF' : '#0F172A';
  const themeSubText = isDarkModeEnabled ? '#A0A0A0' : '#64748B';
  const themeBorder = isDarkModeEnabled ? '#333333' : '#F1F5F9';

  // --- LOAD USER PROFILE ---
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) {
        logout(); 
        return;
      }
      setUserEmail(email);

      const response = await fetch(`${BACKEND_BASE_URL}/user/${email}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserName(data.name || 'User');
        setEditNameInput(data.name || 'User');
        setEditAgeInput(data.age || '');
        setEditGenderInput(data.gender || '');
        setEditdistrictInput(data.district || '');

        if (data.profile_pic) {
          setProfilePic(data.profile_pic);
        }
      }
    } catch (error) {
      console.error("Profile Load Error", error);
    } finally {
      setLoading(false);
    }
  };

  //  UPDATE PROFILE (PIC & NAME) 
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfilePic(base64Image);
      saveProfileChanges(userName, base64Image);
    }
  };

  const saveProfileChanges = async (newName: string, newPic: string | null) => {
    try {
      setSaving(true);
      
      
      const updateData = { 
        name: newName || "", 
        profile_pic: newPic || "", 
        age: editAgeInput ? editAgeInput.toString() : "", 
        gender: editGenderInput || "", 
        district: editdistrictInput || "" 
      };

      const response = await fetch(`${BACKEND_BASE_URL}/user/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      setUserName(newName);
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE ACCOUNT
  const handleDeleteAccount = () => {
    Alert.alert("WARNING!", "This will permanently delete your account and all history. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await fetch(`${BACKEND_BASE_URL}/user/${userEmail}`, { method: 'DELETE' });
          await AsyncStorage.removeItem('userEmail');
          logout();
      }}
    ]);
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

  if (loading) {
    return <View style={[styles.container, {justifyContent: 'center', alignItems: 'center', backgroundColor: themeContainer}]}><ActivityIndicator size="large" color="#1976D2" /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: themeContainer }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* 1. Profile Header with Blue Background */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={{width: 90, height: 90, borderRadius: 45}} />
            ) : (
              <MaterialCommunityIcons name="account" size={50} color="#1976D2" />
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 2. Account Settings Group */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={[styles.menuGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          <MenuItem 
            icon="account-edit-outline" 
            title="Edit Profile" 
            subtitle="Change name and photo"
            color="#1976D2"
            onPress={() => setEditModalVisible(true)}
          />
          <MenuItem 
          icon="shield-check-outline" 
          title="Privacy & Security" 
          subtitle="Password and account controls"
          color="#2E7D32"
          onPress={() => setSecurityModalVisible(true)} 
        />
        </View>

        {/* 3. Preferences Group (Notifications & Dark Mode) */}
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

          {/* Dark Mode Toggle */}
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

        {/* 4. Support & More Group */}
        <Text style={styles.sectionLabel}>Support & Legal</Text>
        <View style={[styles.menuGroup, { backgroundColor: themeCard, borderColor: themeBorder }]}>
          <MenuItem 
          icon="help-circle-outline" 
          title="Help Center" 
          subtitle="FAQs and contact support" 
          color="#64748B"
          onPress={() => setHelpModalVisible(true)} 
        />
        <MenuItem 
          icon="file-document-outline" 
          title="Terms & Privacy" 
          subtitle="Medical disclaimers and policies"
          color="#64748B"
          onPress={() => setTermsModalVisible(true)} 
        />
          <MenuItem 
            icon="information-outline" 
            title="About MySkinApp" 
            subtitle="Version 1.0"
            color="#64748B"
          />
        </View>

        {/* 5. Logout Button*/}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={22} color="#D32F2F" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeCard }]}>
            <Text style={[styles.modalTitle, { color: themeText }]}>Edit Profile</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
             <Text style={[styles.inputLabel, { color: themeSubText }]}>Name</Text>
            <TextInput 
              style={[styles.textInput, { backgroundColor: themeContainer, color: themeText, borderColor: themeBorder }]}
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="Enter your name"
              placeholderTextColor={themeSubText}
            />
            <Text style={[styles.inputLabel, { color: themeSubText }]}>Age</Text>
              <TextInput 
                style={[styles.textInput, { backgroundColor: themeContainer, color: themeText, borderColor: themeBorder }]}
                value={editAgeInput}
                onChangeText={setEditAgeInput}
                keyboardType="numeric"
                placeholder="e.g. 25"
                placeholderTextColor={themeSubText}
              />

              <Text style={[styles.inputLabel, { color: themeSubText }]}>Gender</Text>
              <TextInput 
                style={[styles.textInput, { backgroundColor: themeContainer, color: themeText, borderColor: themeBorder }]}
                value={editGenderInput}
                onChangeText={setEditGenderInput}
                placeholder="Male / Female / Other"
                placeholderTextColor={themeSubText}
              />

              <Text style={[styles.inputLabel, { color: themeSubText }]}>District</Text>
               <TouchableOpacity 
                style={[styles.textInput, { backgroundColor: themeContainer, borderColor: themeBorder, justifyContent: 'center', marginBottom: 25 }]}
                  onPress={() => setDistrictModalVisible(true)}
>
              <Text style={{ color: editdistrictInput ? themeText : themeSubText, fontSize: 16 }}>
               {editdistrictInput || "Select your district"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={themeSubText} style={{ position: 'absolute', right: 15 }} />
               </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => saveProfileChanges(editNameInput, profilePic)}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>

            

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: themeSubText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
{/* PRIVACY & SECURITY MODAL*/}
      <Modal visible={isSecurityModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeCard }]}>
            <Text style={[styles.modalTitle, { color: themeText, marginBottom: 10 }]}>Privacy & Security</Text>
            
            <Text style={[styles.sectionLabel, { marginBottom: 15, marginTop: 10 }]}>Security Settings</Text>

            {/* Change Password Button */}
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0, paddingHorizontal: 0 }]} 
              onPress={() => Alert.alert("Change Password", "A password reset instruction will be sent to your registered email.")}
            >
              <View style={[styles.iconBg, { backgroundColor: '#1976D215' }]}>
                <MaterialCommunityIcons name="lock-reset" size={22} color="#1976D2" />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: themeText }]}>Change Password</Text>
                <Text style={[styles.menuSubtitle, { color: themeSubText }]}>Update your account password</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={themeSubText} />
            </TouchableOpacity>

            {/* Data Management Button */}
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0, paddingHorizontal: 0 }]} 
              onPress={() => Alert.alert("Data Privacy", "Your scan records are encrypted and stored securely in compliance with privacy guidelines.")}
            >
              <View style={[styles.iconBg, { backgroundColor: '#2E7D3215' }]}>
                <MaterialCommunityIcons name="database-lock-outline" size={22} color="#2E7D32" />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: themeText }]}>Data Management</Text>
                <Text style={[styles.menuSubtitle, { color: themeSubText }]}>Learn how we protect your data</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={themeSubText} />
            </TouchableOpacity>

            <View style={{height: 1, backgroundColor: themeBorder, marginVertical: 20}} />

            {/* Delete Account */}
            <TouchableOpacity style={styles.deleteAccBtn} onPress={handleDeleteAccount}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" style={{marginRight: 8}} />
              <Text style={styles.deleteAccText}>Delete Account Permanently</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn, {marginTop: 10}]} onPress={() => setSecurityModalVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: themeSubText }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

{/* HELP CENTER MODAL */}
      <Modal visible={isHelpModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeCard, height: '70%' }]}>
            <Text style={[styles.modalTitle, { color: themeText }]}>Help Center & FAQs</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{fontWeight: 'bold', fontSize: 16, color: themeText, marginTop: 10}}>Q: How do I get the most accurate result?</Text>
              <Text style={{fontSize: 14, color: themeSubText, marginTop: 5, marginBottom: 15, lineHeight: 20}}>A: For best results, take the photo in natural daylight. Keep the camera 10-15 cm away, make sure it is in focus, and center the lesion.</Text>

              <Text style={{fontWeight: 'bold', fontSize: 16, color: themeText}}>Q: Is this a final medical diagnosis?</Text>
              <Text style={{fontSize: 14, color: themeSubText, marginTop: 5, marginBottom: 15, lineHeight: 20}}>A: No. MySkinApp is a screening tool designed to give you an early assessment. Always consult a dermatologist for proper treatment.</Text>

              <Text style={{fontWeight: 'bold', fontSize: 16, color: themeText}}>Q: Is my data safe?</Text>
              <Text style={{fontSize: 14, color: themeSubText, marginTop: 5, marginBottom: 15, lineHeight: 20}}>A: Yes. Your scan history is securely saved to your account. We do not share your personal medical data.</Text>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setHelpModalVisible(false)}>
              <Text style={styles.saveBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TERMS & CONDITIONS MODAL */}
      <Modal visible={isTermsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeCard, height: '70%' }]}>
            <Text style={[styles.modalTitle, { color: themeText }]}>Terms & Conditions</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{fontWeight: 'bold', fontSize: 16, color: '#D32F2F', marginTop: 10}}>1. Important Medical Disclaimer</Text>
              <Text style={{fontSize: 14, color: themeSubText, marginTop: 5, marginBottom: 15, lineHeight: 20}}>This application provides AI-based skin condition screening. It is strictly NOT a substitute for professional medical advice, diagnosis, or treatment.</Text>

              <Text style={{fontWeight: 'bold', fontSize: 16, color: themeText}}>2. Accuracy Limitation</Text>
              <Text style={{fontSize: 14, color: themeSubText, marginTop: 5, marginBottom: 15, lineHeight: 20}}>While our model is trained on vast datasets, AI predictions are not 100% accurate. Do not ignore professional advice based on a result from this app.</Text>

              <Text style={{fontWeight: 'bold', fontSize: 16, color: themeText}}>3. Data Privacy</Text>
              <Text style={{fontSize: 14, color: themeSubText, marginTop: 5, marginBottom: 15, lineHeight: 20}}>By using this app, you agree to securely store your screening history on our cloud database so you can access your past records at any time.</Text>
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setTermsModalVisible(false)}>
              <Text style={styles.saveBtnText}>I Agree & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DISTRICT SELECTOR MODAL*/}
      <Modal visible={isDistrictModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeCard, height: '70%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.modalTitle, { color: themeText, marginBottom: 0 }]}>Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color={themeSubText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {districtsList.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: themeBorder }}
                  onPress={() => {
                    setEditdistrictInput(district);
                    setDistrictModalVisible(false); 
                  }}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: editdistrictInput === district ? '#1976D2' : themeText,
                    fontWeight: editdistrictInput === district ? 'bold' : 'normal'
                  }}>
                    {district}
                  </Text>
                  {editdistrictInput === district && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#1976D2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { backgroundColor: themeCard, borderTopColor: themeBorder }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)')}>
          <MaterialCommunityIcons name="home-outline" size={28} color={themeSubText} />
          <Text style={[styles.tabLabel, { color: themeSubText }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/history')}>
          <MaterialCommunityIcons name="history" size={28} color={themeSubText} />
          <Text style={[styles.tabLabel, { color: themeSubText }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(user)/(tabs)/profile')}>
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
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  inputLabel: { fontSize: 14, marginBottom: 8, fontWeight: 'bold' },
  textInput: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 25 },
  saveBtn: { backgroundColor: '#1976D2', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  deleteAccBtn: { padding: 15, alignItems: 'center', marginBottom: 10 },
  deleteAccText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
  cancelBtn: { padding: 15, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: 'bold' },
  
  bottomTabBar: {
    position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', height: 80,
    borderTopWidth: 1, justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, elevation: 20
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 }
});

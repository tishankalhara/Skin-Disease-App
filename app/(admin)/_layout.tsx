import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={26} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="users" 
        options={{ 
          title: 'Users',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={26} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="records" 
        options={{ 
          title: 'Records',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-document-outline" size={26} color={color} />
        }} 
      />
    </Tabs>
  );
}
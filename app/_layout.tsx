import { Stack, useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

// --- AUTH CONTEXT ---
const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

// --- NEW: THEME CONTEXT FOR DARK MODE ---
const ThemeContext = createContext<any>(null);
export const useTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const [role, setRole] = useState<'guest' | 'user' | 'admin'>('guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // New state for Dark Mode
  const [isDark, setIsDark] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return; 

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/onboarding' as any);
    } else if (isLoggedIn && inAuthGroup) {
      const path = role === 'admin' ? '/(admin)/dashboard' : '/(user)/(tabs)';
      router.replace(path as any);
    }
  }, [isLoggedIn, role, segments, isReady]);

  // Function to switch themes
  const toggleTheme = () => setIsDark(!isDark);

  return (
    // 1. Wrapping with ThemeContext first
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* 2. Keeping your AuthContext exactly as it was */}
      <AuthContext.Provider value={{ 
          role, 
          isLoggedIn, 
          login: (r: any) => { setRole(r); setIsLoggedIn(true); },
          logout: () => { setRole('guest'); setIsLoggedIn(false); } 
      }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(user)/(tabs)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
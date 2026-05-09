import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { BASE_URL } from '../config';

export default function UploadPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (params.imageUri) {
      setImage(params.imageUri as string);
    }
  }, [params.imageUri]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  
  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);

    try {
      // 1. Prepare the image data for upload using FormData
      const formData = new FormData();
      
      const filename = image.split('/').pop() || 'photo.jpg';
      
      
      const match = /\.(\w+)$/.exec(filename);
      let fileType = match ? `image/${match[1].toLowerCase()}` : `image/jpeg`;
      if (fileType === 'image/jpg') fileType = 'image/jpeg';

      formData.append('file', {
        uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
        name: filename,
        type: fileType,
      } as any);

      // 2. Call Python Backend 
      const BACKEND_URL = `${BASE_URL}/predict`; 

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      setIsAnalyzing(false);

      // 3. Results goes to result sheet
      if (data.success) {
        router.push({
          pathname: '/(user)/result',
          params: { 
            imageUri: image,
            prediction: data.prediction, 
            confidence: data.confidence   
          }
        });
      } else {
        Alert.alert("Analysis Failed", data.error || "Could not analyze the image.");
      }

    } catch (error) {
      setIsAnalyzing(false);
      Alert.alert(
        "Network Error", 
        "Could not connect to the server. Please check your IP address and ensure the backend is running."
      );
      console.log("Error analyzing image:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload & Preview</Text>
        <View style={{ width: 26 }} /> 
      </View>

      <View style={styles.content}>
        <View style={styles.previewBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          ) : (
            <View style={styles.noImageContent}>
              <MaterialCommunityIcons name="image-outline" size={80} color="#CBD5E1" />
              <Text style={styles.noImageTitle}>No image selected</Text>
              <Text style={styles.noImageSub}>Tap below to capture or upload</Text>
            </View>
          )}
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="information-outline" size={22} color="#1976D2" />
            <Text style={styles.tipsTitle}>For best results:</Text>
          </View>
          <Text style={styles.tipText}>• Use clear lighting, focus on lesion area</Text>
          <Text style={styles.tipText}>• Keep camera steady and close enough</Text>
          <Text style={styles.tipText}>• Ensure affected area is centered</Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.outlineBtn} onPress={takePhoto}>
            <MaterialCommunityIcons name="camera-outline" size={22} color="#1976D2" />
            <Text style={styles.outlineBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={chooseImage}>
            <MaterialCommunityIcons name="image-multiple-outline" size={22} color="#1976D2" />
            <Text style={styles.outlineBtnText}>Choose Image</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.analyzeBtn, !image && styles.disabledBtn]} 
            onPress={startAnalysis}
            disabled={!image || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.analyzeBtnText}>Analyze Image</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    backgroundColor: '#1976D2', 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 25 },
  previewBox: { 
    height: 280, width: '100%', borderRadius: 15, borderWidth: 2, 
    borderColor: '#E2E8F0', borderStyle: 'dashed', overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC',
    marginBottom: 25
  },
  selectedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  noImageContent: { alignItems: 'center' },
  noImageTitle: { fontSize: 18, fontWeight: 'bold', color: '#475569', marginTop: 10 },
  noImageSub: { fontSize: 14, color: '#94A3B8', marginTop: 5 },
  tipsCard: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 12, marginBottom: 30 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  tipText: { fontSize: 14, color: '#475569', marginLeft: 5, marginBottom: 4 },
  actionGroup: { gap: 12 },
  outlineBtn: { 
    flexDirection: 'row', height: 55, borderWidth: 1.5, borderColor: '#1976D2', 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  outlineBtnText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
  analyzeBtn: { 
    height: 55, backgroundColor: '#1976D2', borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginTop: 10 
  },
  analyzeBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#CBD5E1' }
});
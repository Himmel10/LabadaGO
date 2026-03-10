import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface ImageUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
  isLoading?: boolean;
  title?: string;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  isLoading = false,
  title = 'Change Photo',
}) => {
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const pickImageFromGallery = async () => {
    try {
      setIsPickerLoading(true);
      
      // Request library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library');
        setIsPickerLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.log('Gallery error:', error);
      Alert.alert('Error', 'Failed to select image from gallery');
    } finally {
      setIsPickerLoading(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      setIsPickerLoading(true);
      
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your camera');
        setIsPickerLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo from camera');
    } finally {
      setIsPickerLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay} edges={['bottom']}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading || isPickerLoading}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {isLoading || isPickerLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                {isLoading ? 'Uploading image...' : 'Loading...'}
              </Text>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.option}
                onPress={takePhotoWithCamera}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: Colors.primaryFaded }]}>
                  <Camera size={32} color={Colors.primary} />
                </View>
                <Text style={styles.optionText}>Take Photo</Text>
                <Text style={styles.optionSubtext}>Use your camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.option}
                onPress={pickImageFromGallery}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: Colors.accentLight }]}>
                  <ImageIcon size={32} color={Colors.accent} />
                </View>
                <Text style={styles.optionText}>Choose from Gallery</Text>
                <Text style={styles.optionSubtext}>Select existing photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Allowed formats: JPG, JPEG, PNG{'\n'}
              Maximum size: 5MB
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  option: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  optionSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
});

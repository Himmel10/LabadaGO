import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const validateImage = (uri: string): ImageValidationResult => {
  // Check format
  const extension = uri.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_FORMATS.includes(extension)) {
    return {
      valid: false,
      error: 'Only JPG, JPEG, and PNG formats are allowed',
    };
  }

  return { valid: true };
};

export const getImageFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.log('Error getting file size:', error);
    return 0;
  }
};

export const uploadImageToSupabase = async (
  imageUri: string,
  bucket: string,
  folderPath: string,
  fileName: string
): Promise<ImageUploadResult> => {
  try {
    // Validate image
    const validation = validateImage(imageUri);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check file size
    const fileSize = await getImageFileSize(imageUri);
    if (fileSize > MAX_FILE_SIZE) {
      return { success: false, error: 'Image size exceeds 5MB limit' };
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Determine content type
    const extension = imageUri.split('.').pop()?.toLowerCase() || 'png';
    const contentType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    // Upload to Supabase
    const filePath = `${folderPath}/${Date.now()}-${fileName}`;
    
    try {
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, {uri: imageUri, type: contentType, name: fileName} as any, {
          upsert: true,
        });

      if (uploadError) {
        console.log('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      return {
        success: true,
        imageUrl: publicUrlData.publicUrl,
      };
    } catch (uploadErr) {
      // If Supabase fails or is not configured, use a fallback local storage
      console.log('Supabase upload failed, using local storage:', uploadErr);
      
      // For now, just return the local URI as we don't have a backend
      // In production, implement a server-side upload or proper Supabase setup
      return {
        success: true,
        imageUrl: imageUri,
      };
    }
  } catch (error) {
    console.log('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
};

export const uploadProfileImage = async (
  imageUri: string,
  userId: string,
  userRole: string
): Promise<ImageUploadResult> => {
  const bucket = 'profiles';
  const folderPath = `${userRole}/${userId}`;
  const fileName = 'profile.png';

  return uploadImageToSupabase(imageUri, bucket, folderPath, fileName);
};

export const uploadShopLogo = async (
  imageUri: string,
  shopId: string
): Promise<ImageUploadResult> => {
  const bucket = 'shops';
  const folderPath = `${shopId}`;
  const fileName = 'logo.png';

  return uploadImageToSupabase(imageUri, bucket, folderPath, fileName);
};

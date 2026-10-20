import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Uploads a generated image buffer to the private 'generated-images' Supabase Storage bucket.
 * Returns the storage path and a signed access URL.
 */
export async function uploadGeneratedImage({ userId, imageBuffer, contentType = 'image/png' }) {
  if (!userId) {
    throw new Error('User ID is required to store private images.');
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filePath = `${userId}/${timestamp}-${randomSuffix}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('generated-images')
    .upload(filePath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Failed to store generated image: ${uploadError.message}`);
  }

  // Create a 24-hour signed URL for the user
  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from('generated-images')
    .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

  if (signError || !signedData?.signedUrl) {
    console.error('Signed URL generation error:', signError);
    throw new Error('Failed to create signed access URL for stored image.');
  }

  return {
    storagePath: filePath,
    signedUrl: signedData.signedUrl,
  };
}

/**
 * Creates a fresh signed URL for an existing stored image.
 */
export async function getSignedImageUrl(storagePath, expiresInSeconds = 60 * 60 * 2) {
  const { data, error } = await supabaseAdmin.storage
    .from('generated-images')
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

import multer from 'multer';
import sharp from 'sharp';
import { supabase } from '../lib/supabase';
import crypto from 'crypto';

// Multer config for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  },
});

export const processAndUploadImage = async (file: Express.Multer.File) => {
  // Generate a deterministic filename using SHA-256 hash of the original image buffer
  const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const fileName = `${hash}.webp`;

  // 1. Check if the image already exists in storage to avoid duplicates
  const { data: existingFiles } = await supabase.storage
    .from('products')
    .list('800x800', { search: fileName });

  const exists = existingFiles && existingFiles.some(f => f.name === fileName);

  if (exists) {
    console.log(`Image already exists in storage, skipping upload: ${fileName}`);
    // Get public URLs directly
    const { data: { publicUrl: url800 } } = supabase.storage
      .from('products')
      .getPublicUrl(`800x800/${fileName}`);

    const { data: { publicUrl: url200 } } = supabase.storage
      .from('products')
      .getPublicUrl(`200x200/${fileName}`);

    return { url800, url200 };
  }

  console.log(`Image not found in storage, processing and uploading: ${fileName}`);

  // 2. Resize to 800x800 for main image with optimized WebP settings
  const buffer800 = await sharp(file.buffer)
    .resize(800, 800, { fit: 'cover' })
    .webp({ quality: 75, effort: 6 })
    .toBuffer();

  // 3. Resize to 200x200 for thumbnail with optimized WebP settings
  const buffer200 = await sharp(file.buffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 65, effort: 6 })
    .toBuffer();

  // Upload main image
  const { error: error800 } = await supabase.storage
    .from('products')
    .upload(`800x800/${fileName}`, buffer800, {
      contentType: 'image/webp',
      cacheControl: '31536000', // Long cache life
    });

  if (error800) throw error800;

  // Upload thumbnail
  const { error: error200 } = await supabase.storage
    .from('products')
    .upload(`200x200/${fileName}`, buffer200, {
      contentType: 'image/webp',
      cacheControl: '31536000',
    });

  if (error200) throw error200;

  // Get public URLs
  const { data: { publicUrl: url800 } } = supabase.storage
    .from('products')
    .getPublicUrl(`800x800/${fileName}`);

  const { data: { publicUrl: url200 } } = supabase.storage
    .from('products')
    .getPublicUrl(`200x200/${fileName}`);

  return { url800, url200 };
};

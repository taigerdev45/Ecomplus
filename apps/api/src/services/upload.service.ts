import multer from 'multer';
import sharp from 'sharp';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  const fileName = `${uuidv4()}.webp`;
  
  // Resize to 800x800 for main image
  const buffer800 = await sharp(file.buffer)
    .resize(800, 800, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  // Resize to 200x200 for thumbnail
  const buffer200 = await sharp(file.buffer)
    .resize(200, 200, { fit: 'cover' })
    .webp({ quality: 70 })
    .toBuffer();

  // Upload main image
  const { data: data800, error: error800 } = await supabase.storage
    .from('products')
    .upload(`800x800/${fileName}`, buffer800, {
      contentType: 'image/webp',
      cacheControl: '3600',
    });

  if (error800) throw error800;

  // Upload thumbnail
  const { data: data200, error: error200 } = await supabase.storage
    .from('products')
    .upload(`200x200/${fileName}`, buffer200, {
      contentType: 'image/webp',
      cacheControl: '3600',
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

import { supabase } from '../lib/supabase';

/**
 * Cleanup documents older than 7 days from Supabase storage buckets.
 * This is safe because clients and admins can always regenerate them on-the-fly.
 */
export const cleanupOldDocuments = async () => {
  console.log('[Cleanup Service] Starting daily document cleanup...');
  const buckets = ['quotes', 'receipts'];
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();

  for (const bucket of buckets) {
    try {
      console.log(`[Cleanup Service] Scanning bucket: ${bucket}...`);
      
      // List up to 1000 files in the bucket
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (error) {
        console.error(`[Cleanup Service] Error listing bucket ${bucket}:`, error.message);
        continue;
      }

      if (!files || files.length === 0) {
        console.log(`[Cleanup Service] No files found in bucket: ${bucket}`);
        continue;
      }

      const filesToDelete: string[] = [];

      for (const file of files) {
        // Skip default/placeholder files if any (usually .emptyFolderPlaceholder or similar)
        if (file.name.startsWith('.')) continue;

        // Skip files that have no created_at date
        if (!file.created_at) continue;

        const createdAt = new Date(file.created_at);
        const ageMs = now.getTime() - createdAt.getTime();

        if (ageMs > SEVEN_DAYS_MS) {
          filesToDelete.push(file.name);
        }
      }

      if (filesToDelete.length > 0) {
        console.log(`[Cleanup Service] Deleting ${filesToDelete.length} expired PDF(s) from bucket: ${bucket}...`);
        
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove(filesToDelete);

        if (deleteError) {
          console.error(`[Cleanup Service] Error deleting files from bucket ${bucket}:`, deleteError.message);
        } else {
          console.log(`[Cleanup Service] Successfully deleted: ${filesToDelete.join(', ')}`);
        }
      } else {
        console.log(`[Cleanup Service] No expired files in bucket: ${bucket}`);
      }
    } catch (err) {
      console.error(`[Cleanup Service] Unexpected error in bucket ${bucket} cleanup:`, err);
    }
  }
  console.log('[Cleanup Service] Document cleanup process finished.');
};

/**
 * Starts the automatic scheduler for daily cleanup.
 */
export const startCleanupScheduler = () => {
  // Run immediately on startup (after 5 seconds to let the server initialize completely)
  setTimeout(() => {
    cleanupOldDocuments().catch(err => {
      console.error('[Cleanup Service] Error during startup cleanup:', err);
    });
  }, 5000);

  // Then run every 24 hours
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    cleanupOldDocuments().catch(err => {
      console.error('[Cleanup Service] Error during scheduled cleanup:', err);
    });
  }, TWENTY_FOUR_HOURS_MS);

  console.log('[Cleanup Service] Scheduler initialized to run daily.');
};

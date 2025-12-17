/**
 * Cron tasks configuration for Strapi v5
 *
 * This file exports cron job definitions that run on a schedule.
 * The server config must have cron.enabled: true for these to work.
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Clean orphaned images - both from DB and from filesystem
 * 1. Removes DB records of images not linked to any product
 * 2. Removes physical files in uploads/ that are not registered in the DB
 */
async function cleanOrphanedImages(strapi) {
  try {
    strapi.log.info("🔍 Starting orphaned images cleanup...");

    // ============================================
    // PART 1: Clean orphaned DB records (images not linked to products)
    // ============================================
    const allDbFiles = await strapi.db.query("plugin::upload.file").findMany({
      where: {
        mime: { $startsWith: "image/" },
      },
    });

    strapi.log.info(`📁 Found ${allDbFiles.length} images in database`);

    // Get all products with their images
    const products = await strapi.documents("api::product.product").findMany({
      populate: ["images"],
    });

    // Collect all image IDs that are linked to products
    const linkedImageIds = new Set<number>();
    for (const product of products) {
      if (product.images && Array.isArray(product.images)) {
        for (const image of product.images) {
          linkedImageIds.add(image.id);
        }
      }
    }

    strapi.log.info(
      `🔗 Found ${linkedImageIds.size} images linked to products`,
    );

    // Find orphaned images in DB (not linked to any product)
    const orphanedDbFiles = allDbFiles.filter(
      (file) => !linkedImageIds.has(file.id),
    );

    let dbDeletedCount = 0;
    if (orphanedDbFiles.length > 0) {
      strapi.log.info(
        `🗑️ Found ${orphanedDbFiles.length} orphaned DB records. Deleting...`,
      );

      for (const file of orphanedDbFiles) {
        try {
          await strapi.plugins.upload.services.upload.remove(file);
          dbDeletedCount++;
        } catch (err) {
          strapi.log.warn(
            `Failed to delete DB file ${file.name}: ${err.message}`,
          );
        }
      }
    }

    // ============================================
    // PART 2: Clean physical files not in DB
    // ============================================
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (fs.existsSync(uploadsDir)) {
      // Get all file URLs registered in DB (extract just the filename)
      const dbFileUrls = new Set<string>();
      for (const file of allDbFiles) {
        if (file.url) {
          // URLs are like /uploads/image_abc123.jpg - extract filename
          const fileName = path.basename(file.url);
          dbFileUrls.add(fileName);
        }
        // Also check formats (thumbnail, small, medium, large)
        if (file.formats) {
          for (const format of Object.values(file.formats) as any[]) {
            if (format?.url) {
              const formatFileName = path.basename(format.url);
              dbFileUrls.add(formatFileName);
            }
          }
        }
      }

      strapi.log.info(`📋 ${dbFileUrls.size} file references in database`);

      // Read physical files (exclude hidden files like .gitkeep)
      const physicalFiles = fs.readdirSync(uploadsDir).filter((f) => {
        // Skip hidden files (starting with .)
        if (f.startsWith(".")) return false;
        const filePath = path.join(uploadsDir, f);
        return fs.statSync(filePath).isFile();
      });

      strapi.log.info(
        `📂 Found ${physicalFiles.length} physical files in uploads/`,
      );

      // Find orphaned physical files (not in DB)
      const orphanedPhysicalFiles = physicalFiles.filter(
        (fileName) => !dbFileUrls.has(fileName),
      );

      let physicalDeletedCount = 0;
      if (orphanedPhysicalFiles.length > 0) {
        strapi.log.info(
          `🗑️ Found ${orphanedPhysicalFiles.length} orphaned physical files. Deleting...`,
        );

        for (const fileName of orphanedPhysicalFiles) {
          try {
            const filePath = path.join(uploadsDir, fileName);
            fs.unlinkSync(filePath);
            physicalDeletedCount++;
            strapi.log.info(`🆑 Deleted: ${fileName}`);
          } catch (err) {
            strapi.log.warn(
              `Failed to delete physical file ${fileName}: ${err.message}`,
            );
          }
        }
      }

      strapi.log.info(
        `✅ Cleanup complete. DB records deleted: ${dbDeletedCount}, Physical files deleted: ${physicalDeletedCount}`,
      );
    } else {
      strapi.log.info(
        `📂 Uploads directory not found, skipping physical cleanup`,
      );
      strapi.log.info(
        `✅ DB cleanup complete. Deleted ${dbDeletedCount} orphaned records`,
      );
    }
  } catch (error) {
    strapi.log.error("Error cleaning orphaned images:", error);
  }
}

// Export the cleanup function so it can be used from bootstrap
export { cleanOrphanedImages };

export default {
  /**
   * Clean orphaned images every Sunday at 3:00 AM
   */
  cleanOrphanedImages: {
    task: async ({ strapi }) => {
      strapi.log.info("🧹 Running weekly orphaned images cleanup cron...");
      await cleanOrphanedImages(strapi);
    },
    options: {
      rule: "0 3 * * 0", // Every Sunday at 3:00 AM
    },
  },
};

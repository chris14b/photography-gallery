#!/usr/bin/env node

/**
 * Metadata Generator Script
 * 
 * This script generates metadata JSON files for photos in the gallery.
 * It scans the src/assets/images directory to find all albums and photos,
 * then creates or updates corresponding metadata files in src/data/metadata.
 * 
 * Features:
 * - Generates metadata files for each album
 * - Creates placeholder metadata for each photo
 * - Preserves existing metadata when run again
 * - Adds new photos to existing metadata files
 * 
 * Usage:
 * npm run generate-metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import {promisify} from 'util';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const IMAGES_DIR = path.join(__dirname, '..', 'src', 'assets', 'images');
const METADATA_DIR = path.join(__dirname, '..', 'src', 'data', 'metadata');

// Promisify fs.readFile for async/await usage
const readFile = promisify(fs.readFile);

/**
 * Get image dimensions from a file
 * @param {string} filePath - Path to the image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 * @throws {Error} If dimensions cannot be extracted
 */
async function getImageDimensions(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    // Read the first few bytes of the file to determine dimensions
    // Different image formats store dimensions in different ways
    const buffer = await readFile(filePath, { flag: 'r' });
    
    let dimensions;
    
    // JPEG format
    if (ext === '.jpg' || ext === '.jpeg') {
      dimensions = getJpegDimensions(buffer);
    }
    // PNG format
    else if (ext === '.png') {
      dimensions = getPngDimensions(buffer);
    }
    // GIF format
    else if (ext === '.gif') {
      dimensions = getGifDimensions(buffer);
    }
    // WebP format
    else if (ext === '.webp') {
      dimensions = getWebpDimensions(buffer);
    }
    else {
      throw new Error(`Unsupported image format: ${ext}`);
    }
    
    // Validate dimensions
    if (!dimensions || !dimensions.width || !dimensions.height || 
        dimensions.width <= 0 || dimensions.height <= 0) {
      throw new Error(`Invalid dimensions extracted: ${JSON.stringify(dimensions)}`);
    }
    
    return dimensions;
  } catch (error) {
    console.error(`Error getting dimensions for ${filePath}:`, error);
    throw new Error(`Failed to extract dimensions from ${filePath}: ${error.message}`);
  }
}

/**
 * Get dimensions from a JPEG image buffer
 * @param {Buffer} buffer - Image data buffer
 * @returns {{width: number, height: number}} - Image dimensions
 * @throws {Error} If dimensions cannot be extracted
 */
function getJpegDimensions(buffer) {
  try {
    let offset = 2; // Skip the first two bytes (JPEG marker)
    
    while (offset < buffer.length) {
      // Check if we've reached a SOFn marker (Start Of Frame)
      // SOF markers are: 0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF
      if (buffer[offset] === 0xFF && (buffer[offset + 1] >= 0xC0 && buffer[offset + 1] <= 0xCF) && 
          buffer[offset + 1] !== 0xC4 && buffer[offset + 1] !== 0xC8) {
        // SOFn marker found, height is at offset+5 (2 bytes), width is at offset+7 (2 bytes)
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        
        if (width <= 0 || height <= 0) {
          throw new Error(`Invalid JPEG dimensions: ${width}x${height}`);
        }
        
        return { width, height };
      }
      
      // Move to the next marker
      offset += 2; // Skip marker
      offset += buffer.readUInt16BE(offset); // Skip segment based on length
    }
    
    // If we couldn't find dimensions, throw an error
    throw new Error('Could not find SOF marker in JPEG file');
  } catch (error) {
    console.error('Error parsing JPEG dimensions:', error);
    throw new Error(`Failed to extract JPEG dimensions: ${error.message}`);
  }
}

/**
 * Get dimensions from a PNG image buffer
 * @param {Buffer} buffer - Image data buffer
 * @returns {{width: number, height: number}} - Image dimensions
 * @throws {Error} If dimensions cannot be extracted
 */
function getPngDimensions(buffer) {
  try {
    // PNG width is at bytes 16-19, height at bytes 20-23
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    
    if (width <= 0 || height <= 0) {
      throw new Error(`Invalid PNG dimensions: ${width}x${height}`);
    }
    
    return { width, height };
  } catch (error) {
    console.error('Error parsing PNG dimensions:', error);
    throw new Error(`Failed to extract PNG dimensions: ${error.message}`);
  }
}

/**
 * Get dimensions from a GIF image buffer
 * @param {Buffer} buffer - Image data buffer
 * @returns {{width: number, height: number}} - Image dimensions
 * @throws {Error} If dimensions cannot be extracted
 */
function getGifDimensions(buffer) {
  try {
    // GIF width is at bytes 6-7, height at bytes 8-9
    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);
    
    if (width <= 0 || height <= 0) {
      throw new Error(`Invalid GIF dimensions: ${width}x${height}`);
    }
    
    return { width, height };
  } catch (error) {
    console.error('Error parsing GIF dimensions:', error);
    throw new Error(`Failed to extract GIF dimensions: ${error.message}`);
  }
}

/**
 * Get dimensions from a WebP image buffer
 * @param {Buffer} buffer - Image data buffer
 * @returns {{width: number, height: number}} - Image dimensions
 * @throws {Error} If dimensions cannot be extracted
 */
function getWebpDimensions(buffer) {
  try {
    let width, height;
    
    // WebP is more complex, this is a simplified approach
    // For VP8 format (lossy WebP)
    if (buffer.slice(12, 16).toString() === 'VP8 ') {
      width = buffer.readUInt16LE(26) & 0x3FFF;
      height = buffer.readUInt16LE(28) & 0x3FFF;
    }
    // For VP8L format (lossless WebP)
    else if (buffer.slice(12, 16).toString() === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      width = (bits & 0x3FFF) + 1;
      height = ((bits >> 14) & 0x3FFF) + 1;
    }
    // For VP8X format (extended WebP)
    else if (buffer.slice(12, 16).toString() === 'VP8X') {
      width = 1 + buffer.readUIntLE(24, 3);
      height = 1 + buffer.readUIntLE(27, 3);
    }
    else {
      throw new Error('Unknown WebP format');
    }
    
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error(`Invalid WebP dimensions: ${width}x${height}`);
    }
    
    return { width, height };
  } catch (error) {
    console.error('Error parsing WebP dimensions:', error);
    throw new Error(`Failed to extract WebP dimensions: ${error.message}`);
  }
}

/**
 * Generate a slug from a string (for use as ID)
 * This function is copied from src/utils/imageLoader.ts to ensure consistency
 */
function generateSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

/**
 * Extract filename without extension
 * This function is copied from src/utils/imageLoader.ts to ensure consistency
 */
function extractFileName(filePath) {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  // Split by dot and take everything before the last dot (to handle filenames with multiple dots)
  const nameParts = fileName.split('.');
  return nameParts.slice(0, -1).join('.') || nameParts[0]; // Handle case with no extension
}

/**
 * Check if a directory exists, create it if it doesn't
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get all image files in a directory and its subdirectories
 */
function getImageFiles(dir) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const files = [];

  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  scanDirectory(dir);
  return files;
}

/**
 * Group image files by album (folder)
 */
function groupImagesByAlbum(imageFiles) {
  const albums = new Map();
  
  for (const filePath of imageFiles) {
    // Get relative path from IMAGES_DIR
    const relativePath = path.relative(IMAGES_DIR, filePath);
    
    // Extract album name (first directory in the relative path)
    const albumName = relativePath.split(path.sep)[0];
    const albumId = generateSlug(albumName);
    
    // Extract filename without extension
    const fileName = extractFileName(filePath);
    
    // Add to albums map
    if (!albums.has(albumId)) {
      albums.set(albumId, new Map());
    }
    
    albums.get(albumId).set(fileName, filePath);
  }
  
  return albums;
}

/**
 * Read existing metadata file if it exists
 */
function readExistingMetadata(albumId) {
  const metadataFilePath = path.join(METADATA_DIR, `${albumId}.json`);
  
  if (fs.existsSync(metadataFilePath)) {
    try {
      const fileContent = fs.readFileSync(metadataFilePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading metadata file for album ${albumId}:`, error);
      return {};
    }
  }
  
  return {};
}

/**
 * Generate or update metadata for an album
 * @param {string} albumId - The album ID
 * @param {Map<string, string>} photos - Map of photo filenames to file paths
 * @param {Object} options - Options for metadata generation
 * @param {boolean} options.forceRegenerateDimensions - Whether to force regeneration of dimensions
 * @returns {Promise<void>}
 */
async function generateAlbumMetadata(albumId, photos, options = {}) {
  // Read existing metadata
  const existingMetadata = readExistingMetadata(albumId) || {};
  const errors = [];

  // Extract album-level info
  let name = 'Add name';
  let country = '';
  let startDate = 'YYYY-MM-DD';
  let endDate = 'YYYY-MM-DD';
  let dateDescription = '';

  if (existingMetadata && typeof existingMetadata === 'object') {
    name = (typeof existingMetadata.name === 'string' && existingMetadata.name) ? existingMetadata.name : name;
    country = (typeof existingMetadata.country === 'string' && existingMetadata.country) ? existingMetadata.country : country;
    startDate = (typeof existingMetadata.startDate === 'string' && existingMetadata.startDate) ? existingMetadata.startDate : startDate;
    endDate = (typeof existingMetadata.endDate === 'string' && existingMetadata.endDate) ? existingMetadata.endDate : endDate;
    if (typeof existingMetadata.dateDescription === 'string' && existingMetadata.dateDescription.trim() !== '') {
      dateDescription = existingMetadata.dateDescription.trim();
    }
  }

  // Ensure mandatory dateDescription; do not auto-calculate from dates
  if (!dateDescription || dateDescription.trim() === '') {
    dateDescription = 'Add date description';
  }

  // Build a map of existing photo metadata by fileName
  const existingPhotoMap = new Map();
  if (Array.isArray(existingMetadata.photos)) {
    for (const p of existingMetadata.photos) {
      if (p && typeof p.fileName === 'string') {
        existingPhotoMap.set(p.fileName, p);
      }
    }
  }

  // Assemble updated photos array
  const updatedPhotos = [];

  for (const [fileName, filePath] of photos.entries()) {
    try {
      const existing = existingPhotoMap.get(fileName) || {};
      // Preserve existing caption (allow blank)
      const caption = (typeof existing.caption === 'string') ? existing.caption : '';

      // Use existing location as string when present; otherwise default
      const location = (typeof existing.location === 'string' && existing.location.trim() !== '')
        ? existing.location.trim()
        : 'Add location';

      const photoEntry = {
        fileName,
        caption,
        location,
        dimensions: existing.dimensions
      };

      // If dimensions missing or forced, compute them
      if (!photoEntry.dimensions || options.forceRegenerateDimensions) {
        const dimensions = await getImageDimensions(filePath);
        photoEntry.dimensions = dimensions;
        console.log(`${options.forceRegenerateDimensions ? 'Updated' : (existing.dimensions ? 'Repaired' : 'Added')} dimensions for ${fileName} in album ${albumId}: ${dimensions.width}x${dimensions.height}`);
      }

      // Validate dimensions
      const dimensions = photoEntry.dimensions;
      if (!dimensions || !dimensions.width || !dimensions.height || dimensions.width <= 0 || dimensions.height <= 0) {
        throw new Error(`Invalid dimensions in metadata: ${JSON.stringify(dimensions)}`);
      }

      updatedPhotos.push(photoEntry);
    } catch (error) {
      const errorMessage = `Error processing photo ${fileName} in album ${albumId}: ${error.message}`;
      console.error(errorMessage);
      errors.push(errorMessage);
      // Skip this photo and continue with others
      continue;
    }
  }

  // If there were any errors, report them
  if (errors.length > 0) {
    console.error(`Encountered ${errors.length} errors while processing album ${albumId}:`);
    errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error}`);
    });
    console.error('Please fix these issues and run the script again.');
    // Exit with error if any photo failed
    process.exit(1);
  }

  // Preserve existing photo order if present in existing metadata
  if (Array.isArray(existingMetadata.photos)) {
    const orderMap = new Map(existingMetadata.photos.map((p, i) => [p.fileName, i]));
    updatedPhotos.sort((a, b) => {
      const ai = orderMap.has(a.fileName) ? orderMap.get(a.fileName) : Number.POSITIVE_INFINITY;
      const bi = orderMap.has(b.fileName) ? orderMap.get(b.fileName) : Number.POSITIVE_INFINITY;
      if (ai !== bi) return (ai) - (bi);
      // Fallback to filename lexicographic order for items not present in metadata
      return a.fileName.localeCompare(b.fileName);
    });
  }

  // Determine slug based on folder name (albumId), preserving existing if present
  const slug = (typeof existingMetadata.slug === 'string' && existingMetadata.slug.trim() !== '')
    ? existingMetadata.slug.trim()
    : albumId;

  // Create final metadata object in the new schema
  const finalMetadata = {
    slug,
    name,
    country,
    dateDescription,
    startDate,
    endDate,
    photos: updatedPhotos
  };

  // Write updated metadata to file
  const metadataFilePath = path.join(METADATA_DIR, `${albumId}.json`);
  fs.writeFileSync(
    metadataFilePath,
    JSON.stringify(finalMetadata, null, 2),
    'utf-8'
  );

  console.log(`Generated metadata file: ${metadataFilePath}`);
}

/**
 * Parse command-line arguments
 * @returns {Object} - Parsed options
 */
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {
    forceRegenerateDimensions: false,
    help: false
  };
  
  for (const arg of args) {
    if (arg === '--force-dimensions' || arg === '-f') {
      options.forceRegenerateDimensions = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }
  
  return options;
}

/**
 * Display help message
 */
function displayHelp() {
  console.log(`
Metadata Generator Script

This script generates metadata JSON files for photos in the gallery.
It scans the src/assets/images directory to find all albums and photos,
then creates or updates corresponding metadata files in src/data/metadata.

Usage:
  node scripts/generateMetadata.mjs [options]

Options:
  -f, --force-dimensions    Force regeneration of dimensions for all photos
  -h, --help                Display this help message

Examples:
  node scripts/generateMetadata.mjs
  node scripts/generateMetadata.mjs --force-dimensions
  `);
}

/**
 * Main function to generate metadata for all albums
 */
async function generateMetadata() {
  // Parse command-line arguments
  const options = parseCommandLineArgs();
  
  // Display help if requested
  if (options.help) {
    displayHelp();
    return;
  }
  
  // Log options
  if (options.forceRegenerateDimensions) {
    console.log('Force regeneration of dimensions enabled');
  }
  
  try {
    // Ensure metadata directory exists
    ensureDirectoryExists(METADATA_DIR);
    
    // Get all image files
    console.log(`Scanning directory: ${IMAGES_DIR}`);
    const imageFiles = getImageFiles(IMAGES_DIR);
    console.log(`Found ${imageFiles.length} image files`);
    
    // Group images by album
    const albums = groupImagesByAlbum(imageFiles);
    console.log(`Found ${albums.size} albums`);
    
    // Generate metadata for each album
    // Process albums sequentially to avoid overwhelming the system
    for (const [albumId, photos] of albums.entries()) {
      console.log(`Processing album: ${albumId} (${photos.size} photos)`);
      await generateAlbumMetadata(albumId, photos, options);
    }
    
    console.log('Metadata generation completed successfully!');
  } catch (error) {
    console.error('Error generating metadata:', error);
    process.exit(1);
  }
}

// Run the script
generateMetadata();
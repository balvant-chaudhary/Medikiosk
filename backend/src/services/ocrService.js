import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image document.
 * @param {string} filePath - Absolute path to the file.
 * @param {string} mimeType - The mime type of the file.
 * @returns {Promise<string|null>} The extracted text or null if unsupported/failed.
 */
export async function extractText(filePath, mimeType) {
  try {
    // Tesseract.js only supports image formats natively
    if (!mimeType.startsWith('image/')) {
      console.warn(`[OCR] Skipping OCR for non-image format: ${mimeType}`);
      return "OCR extraction is currently only supported for image formats (JPG/PNG). This is a PDF or unsupported file.";
    }

    console.log(`[OCR] Starting extraction for ${filePath}`);
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng',
      { logger: m => {} } // silences progress logs
    );

    console.log(`[OCR] Extraction successful, length: ${text.length}`);
    return text;
  } catch (err) {
    console.error('[OCR] Extraction error:', err.message);
    throw new Error('Failed to extract text from document.');
  }
}

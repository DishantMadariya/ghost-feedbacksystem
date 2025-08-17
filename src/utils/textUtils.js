// Utility functions for text handling

/**
 * Decode HTML entities back to their original characters
 * @param {string} text - Text that may contain HTML entities
 * @returns {string} - Decoded text
 */
export const decodeHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

/**
 * Safely display text that may contain HTML entities
 * @param {string} text - Text to display
 * @returns {string} - Safe text for display
 */
export const safeDisplayText = (text) => {
  if (typeof text !== 'string') return text;
  
  // First decode HTML entities
  const decoded = decodeHtmlEntities(text);
  
  // Then escape any remaining HTML to prevent XSS
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Clean text for storage (remove HTML tags but preserve content)
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
export const cleanTextForStorage = (text) => {
  if (typeof text !== 'string') return text;
  
  // Remove HTML tags but preserve their content
  return text.replace(/<[^>]*>/g, '');
};

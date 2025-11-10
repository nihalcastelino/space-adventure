// Sanitize player names for Firebase keys
export function sanitizePlayerName(name) {
  if (!name || typeof name !== 'string') return 'Player';
  
  // Remove special characters, keep only alphanumeric and spaces
  let sanitized = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  
  // Limit length
  if (sanitized.length > 20) {
    sanitized = sanitized.substring(0, 20);
  }
  
  // Ensure it's not empty
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'Player';
  }
  
  return sanitized;
}

// Validate player name
export function isValidPlayerName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 20) return false;
  // Allow alphanumeric and spaces
  return /^[a-zA-Z0-9\s]+$/.test(trimmed);
}

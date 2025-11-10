/**
 * Sanitize player name for Firebase keys
 * Firebase keys cannot contain: . # $ [ ] /
 */
export function sanitizePlayerName(name) {
  if (!name || typeof name !== 'string') return 'player';

  return name
    .trim()
    .replace(/[.#$[\]/]/g, '_')
    .substring(0, 50) || 'player';
}

/**
 * Validate player name
 */
export function isValidPlayerName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

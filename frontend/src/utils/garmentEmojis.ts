// Emoji mapping for garment types
export const garmentEmojis: Record<string, string> = {
  'Jacket': '🧥',
  'Trousers': '👖',
  'Waistcoat': '🦺',
  'Shirt': '👔',
  'Dress': '👗',
  'Skirt': '👗',
  'Coat': '🧥',
  'High-vis coat': '🦺',
  'Tie': '👔',
  'Top': '👕',
  'MISC': '📦',
  'High-vis vest': '🦺',
  'Raincoat': '🧥',
  'Rain jacket': '🧥',
  'Jumpers': '🧶',
  'Aprons': '👔',
  'Table covers': '🛏️',
};

export const getGarmentEmoji = (name: string): string => {
  return garmentEmojis[name] || '👕';
};

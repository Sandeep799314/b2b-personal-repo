export const DEFAULT_DESTINATION_IMAGES = [
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", // Bali
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", // Paris
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", // Tokyo
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80", // New York
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", // Switzerland
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", // Dubai
];

export const getRandomDefaultImage = () => {
  const index = Math.floor(Math.random() * DEFAULT_DESTINATION_IMAGES.length);
  return DEFAULT_DESTINATION_IMAGES[index];
};

export const getDefaultImageByIndex = (index: number) => {
  return DEFAULT_DESTINATION_IMAGES[index % DEFAULT_DESTINATION_IMAGES.length];
};

export const getDefaultImageByString = (str: string) => {
  if (!str) return DEFAULT_DESTINATION_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_DESTINATION_IMAGES.length;
  return DEFAULT_DESTINATION_IMAGES[index];
};

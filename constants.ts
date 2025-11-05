import type { Product } from './types.ts';

export const MOCK_PRODUCT: Product = {
  id: 'prod_001',
  name: 'AuraLens Pro Smart Glasses',
  description: 'Experience the future of augmented reality with the AuraLens Pro. Sleek, lightweight, and powerful, these smart glasses overlay digital information onto your real-world view, keeping you connected without distraction. Perfect for navigation, notifications, and hands-free communication.',
  specs: {
    'Display': 'Dual Micro-OLED 1080p',
    'Battery': 'Up to 6 hours continuous use',
    'Connectivity': 'Bluetooth 5.2, Wi-Fi 6',
    'Weight': '75 grams',
    'Compatibility': 'iOS & Android'
  },
  price: 10,
  images: [
    'https://picsum.photos/id/1025/800/600',
    'https://picsum.photos/id/10/800/600',
    'https://picsum.photos/id/20/800/600',
  ],
};

export const TAX_RATE = 0.05; // 5% sales tax
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MoneyFlow — Personal Money Tracker',
    short_name: 'MoneyFlow',
    description: 'Track your personal money easily and accurately',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

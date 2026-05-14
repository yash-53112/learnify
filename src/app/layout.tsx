import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LearnFlow — Turn Playlists into Courses',
  description: 'Transform any YouTube playlist into a structured, distraction-free learning experience. Track your progress, learn at your pace.',
  keywords: ['youtube', 'learning', 'courses', 'playlist', 'education', 'progress tracking'],
  openGraph: {
    title: 'LearnFlow',
    description: 'Turn YouTube playlists into structured courses',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

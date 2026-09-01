import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://eltype.app'),
  title: { default: 'ElType — Free Typing Speed Test', template: '%s | ElType' },
  description: 'Test your typing speed in English or Amharic. Get accurate WPM, accuracy, consistency, error analysis, and personal-best tracking.',
  keywords: ['typing test', 'WPM test', 'typing speed', 'Amharic typing', 'typing practice'],
  alternates: { canonical: '/' },
  openGraph: { title: 'ElType — Type faster. Know your progress.', description: 'A fast, focused typing test with professional performance analysis.', url: '/', siteName: 'ElType', type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image', title: 'ElType Typing Test', description: 'Measure WPM, accuracy, consistency, and more.' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  const schema = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'ElType', applicationCategory: 'EducationalApplication', operatingSystem: 'Any', description: 'Free multilingual typing speed test with detailed performance analytics', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
  const themeScript = `(function(){try{var saved=localStorage.getItem('eltype-theme');var theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){}})()`;
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></body></html>;
}

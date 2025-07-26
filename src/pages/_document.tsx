import { Html, Head, Main, NextScript } from 'next/document';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function Document() {
  // Read the critical CSS file at build time
  const criticalCss = readFileSync(
    join(process.cwd(), 'public/css/hero-critical.css'),
    'utf8'
  );

  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

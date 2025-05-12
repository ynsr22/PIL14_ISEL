import React, { Suspense } from 'react';

const QRCodeSVG = React.lazy(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })));


interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = React.memo(({ url, size = 128 }) => {
  if (!isValidUrl(url)) {
    return <div className="text-red-500">Invalid URL</div>;
  }
  return (
    <div className="p-2 bg-white rounded-lg shadow-md inline-block">
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open QR code link in new tab">
        <Suspense fallback={<div>Loading QR...</div>}>
          <QRCodeSVG value={url} size={size} />
        </Suspense>
      </a>
    </div>
  );
});

QRCodeGenerator.displayName = 'QRCodeGenerator';

export default QRCodeGenerator;

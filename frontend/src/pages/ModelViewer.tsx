import React from 'react';
import '@google/model-viewer';

interface ModelViewerProps extends React.HTMLAttributes<HTMLElement> {
  src: string;
  ar?: boolean;
  arModes?: string;
  arScale?: 'auto' | 'fixed';
  cameraControls?: boolean;
  style?: React.CSSProperties;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  src,
  ar = false,
  arModes = 'webxr scene-viewer quick-look',
  arScale = 'fixed',
  cameraControls = false,
  style,
  ...props
}) => {
  return (
    <model-viewer
      src={src}
      {...(ar ? { ar: true } : {})}
      {...(arModes ? { 'ar-modes': arModes } : {})}
      {...(arScale ? { 'ar-scale': arScale } : {})}
      {...(cameraControls ? { 'camera-controls': true } : {})}
      style={{ width: '100%', height: '500px', ...style }}
      {...props}
    />
  );
};

export default ModelViewer;

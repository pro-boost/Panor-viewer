import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export default function Portal({ children, containerId = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Create portal container if it doesn't exist
    let portalContainer = document.getElementById(containerId);
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      portalContainer.style.position = 'relative';
      portalContainer.style.zIndex = '999999';
      document.body.appendChild(portalContainer);
    }

    return () => setMounted(false);
  }, [containerId]);

  if (!mounted) return null;

  const portalContainer = document.getElementById(containerId);
  if (!portalContainer) return null;

  return createPortal(children, portalContainer);
}
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DevEnvironmentBadge: React.FC = () => {
  const [apiInfo, setApiInfo] = useState<{ version: string; environment: string } | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (isDev) {
      axios.get('/api')
        .then(response => {
          setApiInfo(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch API info:', error);
          setApiInfo({ version: 'unknown', environment: 'Offline/Error' });
        });
    }
  }, [isDev]);

  if (!isDev) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-indigo-600 text-white text-[10px] font-bold py-1 px-4 flex justify-between items-center shadow-md opacity-90 hover:opacity-100 transition-opacity cursor-default pointer-events-none">
      <div className="flex items-center gap-2">
        <span className="bg-indigo-800 px-1.5 py-0.5 rounded text-indigo-100">DEV MODE</span>
        <span>Frontend: {import.meta.env.VITE_APP_VERSION || 'dev'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span>API: {apiInfo ? `${apiInfo.environment} (v${apiInfo.version})` : 'Connecting...'}</span>
      </div>
    </div>
  );
};

export default DevEnvironmentBadge;

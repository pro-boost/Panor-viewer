import React, { useState } from 'react';
// Removed direct import of exportProject to avoid Node.js modules in client

const TestExportPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const handleTestExport = async () => {
    setIsExporting(true);
    setExportStatus('Starting export test...');
    
    try {
      console.log('Starting test export...');
      setExportStatus('Testing image accessibility...');
      
      const response = await fetch('/api/export-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-sample'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Test export failed');
      }

      const result = await response.json();
      setExportStatus('Export completed successfully! Check your downloads folder.');
      console.log('Test export completed!', result);
    } catch (error) {
      console.error('Test export failed:', error);
      setExportStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRealProjectExport = async () => {
    setIsExporting(true);
    setExportStatus('Starting real project export...');
    
    try {
      console.log('Starting real project test export...');
      setExportStatus('Testing real project export...');
      
      const response = await fetch('/api/export-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-real',
          projectName: 'test'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Real project test failed');
      }

      const result = await response.json();
      setExportStatus('Real project export completed successfully! Check your downloads folder.');
      console.log('Real project test export completed!', result);
    } catch (error) {
      console.error('Real project export failed:', error);
      setExportStatus(`Real project export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Export Functionality Test</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Test Details</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Tests export of sample project with 2 panorama scenes</li>
          <li>Uses existing images from /assets/images/</li>
          <li>Includes sample POI data</li>
          <li>Generates a complete standalone ZIP file</li>
        </ul>
      </div>

      <div className="text-center mb-6">
        <div className="flex gap-4">
          <button 
            onClick={handleTestExport}
            disabled={isExporting}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isExporting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isExporting ? 'Exporting...' : 'Test Export (Sample Data)'}
          </button>
          
          <button 
            onClick={handleRealProjectExport}
            disabled={isExporting}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isExporting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isExporting ? 'Exporting...' : 'Test Export (Real Project)'}
          </button>
        </div>
      </div>

      {exportStatus && (
        <div className={`p-4 rounded-lg text-center ${
          exportStatus.includes('failed') || exportStatus.includes('Error')
            ? 'bg-red-100 text-red-700 border border-red-300'
            : exportStatus.includes('completed successfully')
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {exportStatus}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-700">
          <li>Click "Run Export Test" to start the export process</li>
          <li>Open browser console (F12) to see detailed logs</li>
          <li>If successful, a ZIP file will be downloaded</li>
          <li>Extract and open index.html to test the exported viewer</li>
        </ol>
      </div>
    </div>
  );
};

export default TestExportPage;
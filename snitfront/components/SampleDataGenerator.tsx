'use client';

import { useState } from 'react';
import { Database, Trash2, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client-new';

export default function SampleDataGenerator() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generateSampleData = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await apiClient.post('/api/generate-sample-data', {
        count: 20,
      });
      
      setMessage(`✅ Generated ${response.data.sessions.length} sample sessions!`);
      
      // Reload page after 2 seconds to show new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error generating sample data:', error);
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSampleData = async () => {
    if (!confirm('Are you sure you want to delete all sample sessions?')) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const response = await apiClient.delete('/api/generate-sample-data');
      
      setMessage(`✅ Deleted ${response.data.deletedCount} sample sessions!`);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting sample data:', error);
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Sample Data Generator</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Generate sample session data to test analytics features. This will create 20 sample sessions (10 code + 10 whiteboard) with realistic metrics.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={generateSampleData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Generate Sample Data
            </>
          )}
        </button>
        
        <button
          onClick={deleteSampleData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete Sample Data
            </>
          )}
        </button>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.startsWith('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

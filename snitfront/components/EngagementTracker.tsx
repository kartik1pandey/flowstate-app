'use client';

import { useState, useRef, useEffect } from 'react';
import { engagementAPI } from '../lib/api-client-new';

interface EngagementResult {
  predicted_class: string;
  confidence: number;
  engagement_score: number;
  class_probabilities: {
    [key: string]: number;
  };
}

export default function EngagementTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEngagement, setCurrentEngagement] = useState<EngagementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mlApiStatus, setMlApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check ML API status on mount
  useEffect(() => {
    checkMLApiStatus();
  }, []);

  const checkMLApiStatus = async () => {
    try {
      await engagementAPI.healthCheck();
      setMlApiStatus('online');
      setError(null);
    } catch (err) {
      setMlApiStatus('offline');
      setError('ML API is offline. Please start the engagement classification service.');
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      return true;
    } catch (err) {
      setError('Failed to access webcam. Please grant camera permissions.');
      return false;
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const analyzeEngagement = async () => {
    if (!videoRef.current) return;

    try {
      // Capture frame from video
      const imageBase64 = engagementAPI.captureFromVideo(videoRef.current);
      
      // Send to ML API for classification
      const result = await engagementAPI.predictEngagement(imageBase64);
      
      setCurrentEngagement(result);
      setError(null);
      
      // Log engagement data (you can save this to backend)
      console.log('Engagement Analysis:', result);
      
    } catch (err: any) {
      console.error('Engagement analysis failed:', err);
      setError(err.message || 'Failed to analyze engagement');
    }
  };

  const startTracking = async () => {
    // Check ML API first
    if (mlApiStatus === 'offline') {
      await checkMLApiStatus();
      if (mlApiStatus === 'offline') {
        return;
      }
    }

    const webcamStarted = await startWebcam();
    if (!webcamStarted) return;

    setIsTracking(true);
    
    // Analyze engagement every 30 seconds
    intervalRef.current = setInterval(analyzeEngagement, 30000);
    
    // Do first analysis after 3 seconds
    setTimeout(analyzeEngagement, 3000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    stopWebcam();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 0.7) return 'text-green-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 0.7) return 'High Engagement';
    if (score >= 0.4) return 'Medium Engagement';
    return 'Low Engagement';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Engagement Tracker</h2>
      
      {/* ML API Status */}
      <div className="mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          mlApiStatus === 'online' ? 'bg-green-500' :
          mlApiStatus === 'offline' ? 'bg-red-500' :
          'bg-yellow-500 animate-pulse'
        }`} />
        <span className="text-sm text-gray-600">
          ML API: {mlApiStatus === 'online' ? 'Online' : mlApiStatus === 'offline' ? 'Offline' : 'Checking...'}
        </span>
        {mlApiStatus === 'offline' && (
          <button
            onClick={checkMLApiStatus}
            className="text-sm text-blue-500 hover:underline ml-2"
          >
            Retry
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Video Feed */}
      <div className="mb-4 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg bg-gray-900"
          style={{ maxHeight: '400px' }}
        />
        {!isTracking && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
            <p className="text-white text-lg">Camera Off</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-4">
        {!isTracking ? (
          <button
            onClick={startTracking}
            disabled={mlApiStatus === 'offline'}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Start Tracking
          </button>
        ) : (
          <>
            <button
              onClick={stopTracking}
              className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
            >
              Stop Tracking
            </button>
            <button
              onClick={analyzeEngagement}
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              Analyze Now
            </button>
          </>
        )}
      </div>

      {/* Current Engagement Display */}
      {currentEngagement && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Current Engagement</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-xl font-bold">{currentEngagement.predicted_class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-xl font-bold">{(currentEngagement.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Engagement Score</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    currentEngagement.engagement_score >= 0.7 ? 'bg-green-500' :
                    currentEngagement.engagement_score >= 0.4 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${currentEngagement.engagement_score * 100}%` }}
                />
              </div>
              <span className={`text-lg font-bold ${getEngagementColor(currentEngagement.engagement_score)}`}>
                {(currentEngagement.engagement_score * 100).toFixed(0)}%
              </span>
            </div>
            <p className={`text-sm mt-1 ${getEngagementColor(currentEngagement.engagement_score)}`}>
              {getEngagementLabel(currentEngagement.engagement_score)}
            </p>
          </div>

          {/* Class Probabilities */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Detailed Analysis</p>
            <div className="space-y-2">
              {Object.entries(currentEngagement.class_probabilities)
                .sort(([, a], [, b]) => b - a)
                .map(([className, probability]) => (
                  <div key={className} className="flex items-center gap-2">
                    <span className="text-sm w-32">{className}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${probability * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isTracking && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-semibold mb-2">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Start Tracking" to begin monitoring your engagement</li>
            <li>The system will analyze your facial expression every 30 seconds</li>
            <li>6 categories: Actively Looking, Confused, Talking to Peers, Distracted, Bored, Drowsy</li>
            <li>Engagement score helps you stay focused and productive</li>
          </ul>
        </div>
      )}
    </div>
  );
}

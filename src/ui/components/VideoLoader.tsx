
import React from 'react';
import { FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RecordingData } from '../types/recording';

const VideoLoader = () => {
  const navigate = useNavigate();

  const handleLoadRecording = async () => {
    try {
      // First, get the video file
      const videoFile = await (window as any).electron.openFile({
        title: 'Select Video Recording',
        filters: [{ name: 'Videos', extensions: ['webm'] }]
      });

      if (!videoFile) return;

      // Then, get the JSON file
      const jsonFile = await (window as any).electron.openFile({
        title: 'Select Recording Data',
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (!jsonFile) {
        alert('Please select both video and JSON files');
        return;
      }

      // Read and parse the JSON file
      const recordingData: RecordingData = await (window as any).electron.readJsonFile(jsonFile);
      console.log('Recording duration from JSON:', recordingData.recording_info.duration);

      // Navigate to player with both files
      navigate('/player', { 
        state: { 
          videoUrl: videoFile,
          recordingData
        }
      });
    } catch (error) {
      console.error('Failed to load files:', error);
      alert('Please select both video and JSON files to continue');
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <button
        onClick={handleLoadRecording}
        className="w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
      >
        <FolderOpen className="w-5 h-5" />
        Load Existing Recording
      </button>
    </div>
  );
};

export default VideoLoader;

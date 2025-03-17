import React, { useState, useRef, useEffect } from 'react';
import { Video, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { analyzeRecording } from '../services/aiService';

interface VideoRecorderProps {
  onRecordingComplete: (skipAnalysis?: boolean) => void;
  questionId: string;
  duration?: number;
  isActive?: boolean;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ 
  onRecordingComplete, 
  questionId,
  duration = 60,
  isActive = false
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { addQuestionData } = useAppContext();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            sampleRate: 16000 , // ✅ High-quality 48kHz
            channelCount: 1, // ✅ Force Mono Audio (Fix Google Speech API error)
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const destination = audioContext.createMediaStreamDestination();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 2.0; // ✅ Boost audio volume for better clarity

        source.connect(gainNode);
        gainNode.connect(destination);

        const enhancedStream = new MediaStream([
          ...stream.getVideoTracks(),
          ...destination.stream.getAudioTracks(),
        ]);

        if (videoRef.current) {
          videoRef.current.srcObject = enhancedStream;
          streamRef.current = enhancedStream;
        }

        setHasPermission(true);
        setShowPreview(true);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasPermission(false);
        alert('Could not access camera or microphone. Please check permissions.');
      }
    };

    checkPermissions();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && hasPermission) {
      startRecording();
    }
  }, [isActive, hasPermission]);

  const sendAudioToServer = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Server response:', data);
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;

    audioChunksRef.current = [];
    videoChunksRef.current = [];

    try {
      // Start Video Recorder
      const videoRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      mediaRecorderRef.current = videoRecorder;

      videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      // Start High-Quality Audio Recorder (Mono, 48kHz, 320kbps)
      const audioStream = new MediaStream(streamRef.current.getAudioTracks());
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 320000, // ✅ Set High Bitrate (320kbps)
      });

      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      videoRecorder.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        await sendAudioToServer(audioBlob);

        const analysisResult = await analyzeRecording(audioBlob);

        addQuestionData(questionId, {
          transcript: analysisResult.transcript,
          correctedText: analysisResult.correctedText,
          audioUrl,
          videoUrl,
          audioBlob,
          analysis: {
            disfluencyAnalysis: analysisResult.disfluencyAnalysis,
            repeatedWords: analysisResult.repeatedWords,
            aiRecommendations: analysisResult.aiRecommendations
          }
        });

        onRecordingComplete();
      };

      videoRecorder.start();
      audioRecorder.start();

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          audioRecorder.stop();
        }
      }, duration * 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        {showPreview && (
          <video 
            ref={videoRef} 
            autoPlay 
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}

        {!showPreview && (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Video size={48} className="text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;

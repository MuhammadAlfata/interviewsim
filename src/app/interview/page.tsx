'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewStore } from '@/store/useInterviewStore';
import { 
  Mic, MicOff, Video, VideoOff, 
  PhoneOff, Maximize, Minimize, 
  ChevronRight, RefreshCcw,
  Bot
} from 'lucide-react';

export default function InterviewRoom() {
  const router = useRouter();
  
  // Store state
  const { 
    companyName, roleName, questions, 
    currentQuestionIndex, timeRemainingSeconds, status,
    nextQuestion, endInterview, setTimeRemaining, setRecordingUrl 
  } = useInterviewStore();

  // Local state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true); // AI speaking simulation
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redirect if visiting directly without setup
  useEffect(() => {
    if (status === 'setup') {
      router.push('/');
    }
  }, [status, router]);

  // MediaRecorder state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Request media devices
  useEffect(() => {
    async function setupMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Start recording
        const mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'video/mp4' });
            const url = URL.createObjectURL(blob);
            setRecordingUrl(url); // Save recording asynchronously
          }
        };

        mediaRecorder.start(1000); // Flush chunks every 1 second to prevent memory issues and frozen frames on iOS

      } catch (err) {
        console.error("Failed to get media devices:", err);
        let errorMessage = "Unable to access camera or microphone. Please check your permissions.";
        if (err instanceof Error) {
          if (err.name === 'NotFoundError') {
            errorMessage = "No camera or microphone found. Please connect a device.";
          } else if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            errorMessage = "Camera or microphone access was denied. Note: If accessing from another device, secure context (HTTPS) is required.";
          }
        }
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
           errorMessage += " Accessing from another device via HTTP blocks camera access by default.";
        }
        setMediaError(errorMessage);
      }
    }
    
    if (status === 'active') {
      setupMedia();
    }

    return () => {
      // Cleanup stream on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // Run once when active

  const handleEndInterview = useCallback(() => {
    // Always update status to finished
    endInterview();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Stopping the recorder will trigger onstop, which will asynchronously save the URL
      mediaRecorderRef.current.stop();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.push('/summary');
  }, [endInterview, stream, router]);

  // Timer
  useEffect(() => {
    if (status !== 'active' || timeRemainingSeconds === null) return;
    
    const interval = setInterval(() => {
      if (timeRemainingSeconds > 0) {
        setTimeRemaining(timeRemainingSeconds - 1);
      } else {
        clearInterval(interval);
        handleEndInterview();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status, timeRemainingSeconds, setTimeRemaining, handleEndInterview]);

  // Toggle Mute
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen to fullscreen changes to update state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);



  const handleNextQuestion = () => {
    // Simulate AI asking question
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 3000);
    nextQuestion();
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (status !== 'active') return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div ref={containerRef} className="h-screen w-full bg-neutral-950 flex flex-col overflow-hidden text-neutral-100 font-sans">
      
      {/* Top Bar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-sm tracking-wide">REC</span>
          </div>
          <div className="h-4 w-[1px] bg-neutral-700" />
          <h2 className="text-sm font-medium text-neutral-300">
            {companyName} <span className="opacity-50 mx-2">•</span> {roleName}
          </h2>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-mono bg-neutral-800/80 px-3 py-1 rounded-md">
          {formatTime(timeRemainingSeconds)}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 relative">
        
        {/* Left: AI Interviewer */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          {/* Subtle background glow when speaking */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                className="absolute inset-0 bg-primary/30 blur-[100px]"
              />
            )}
          </AnimatePresence>
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              animate={{
                scale: isSpeaking ? [1, 1.05, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-32 h-32 md:w-48 md:h-48 bg-neutral-800 rounded-full flex items-center justify-center shadow-2xl border border-neutral-700 mb-6"
            >
              <Bot className="w-16 h-16 md:w-24 md:h-24 text-neutral-400" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">AI Interviewer</h3>
              <div className="flex items-center justify-center gap-1 h-6">
                {isSpeaking ? (
                  <span className="text-sm text-primary flex items-center gap-2">
                    <span className="flex gap-[2px]">
                      {[1,2,3,4,5].map(i => (
                        <motion.span 
                          key={i}
                          animate={{ height: ["4px", "16px", "4px"] }}
                          transition={{ repeat: Infinity, duration: 0.5 + (i * 0.1), delay: i * 0.1 }}
                          className="w-1 bg-primary rounded-full block"
                        />
                      ))}
                    </span>
                    Speaking...
                  </span>
                ) : (
                  <span className="text-sm text-neutral-500">Listening...</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-md text-xs font-medium border border-white/10">
            Interviewer
          </div>
        </div>

        {/* Right: User Webcam */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 max-h-[40vh] md:max-h-none">
          {mediaError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                <VideoOff className="w-8 h-8" />
              </div>
              <p className="text-red-400 text-sm font-medium">{mediaError}</p>
            </div>
          ) : isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center bg-neutral-950">
              <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-neutral-500">You</span>
              </div>
            </div>
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
            />
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-md text-xs font-medium border border-white/10 flex items-center gap-2">
            You
            {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
          </div>
        </div>

        {/* Question Overlay */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 shadow-2xl rounded-2xl p-6 text-center"
            >
              <div className="text-primary text-xs font-bold uppercase tracking-wider mb-2">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <h2 className="text-2xl md:text-3xl font-medium text-white leading-tight">
                {currentQuestion}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Bottom Controls */}
      <div className="h-24 pb-4 px-6 flex items-center justify-center gap-4 z-10">
        
        {/* Left corner tools */}
        <div className="absolute left-6 hidden md:flex items-center gap-2">
           <span className="text-xs text-neutral-500 font-medium">InterviewSim Engine v1.0</span>
        </div>

        {/* Center Main Controls */}
        <div className="flex items-center gap-3 bg-neutral-900/80 p-2 rounded-2xl border border-neutral-800 backdrop-blur-md shadow-xl">
          
          <button 
            onClick={toggleMute}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'}`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <div className="w-[1px] h-8 bg-neutral-700 mx-1" />

          <button 
            onClick={() => setIsSpeaking(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition-all"
            title="Repeat Question"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>

          <button 
            onClick={handleNextQuestion}
            className="px-6 h-12 rounded-xl flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all ml-1 shadow-lg shadow-primary/20"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>Next <ChevronRight className="w-4 h-4" /></>
            ) : (
              "Finish"
            )}
          </button>

          <div className="w-[1px] h-8 bg-neutral-700 mx-1" />

          <button 
            onClick={handleEndInterview}
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            title="End Interview"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

        </div>

        {/* Right corner tools */}
        <div className="absolute right-6 flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
}

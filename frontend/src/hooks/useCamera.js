import { useState, useRef, useEffect, useCallback } from 'react';

export function useCamera() {
  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  const demoCanvasRef = useRef(null);
  const demoAnimRef = useRef(null);

  const startDemoPreview = useCallback(() => {
    setIsDemoMode(true);
    setIsActive(true);
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    demoCanvasRef.current = canvas;

    let frame = 0;
    const drawDemoFrame = () => {
      frame++;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw synthetic patient silhouette
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(320, 160, 50, 0, Math.PI * 2); // Head
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(320, 320, 90, 110, 0, 0, Math.PI * 2); // Chest/Torso
      ctx.fill();

      // Simulated breathing animation
      const breathingPulse = Math.sin(frame * 0.05) * 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(320, 310, 70 + breathingPulse, 80 + breathingPulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Text label
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('DEMO CAMERA PREVIEW (Local Development)', 20, 30);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Frame: ${frame} | Simulated Patient Chest Expansion`, 20, 50);

      demoAnimRef.current = requestAnimationFrame(drawDemoFrame);
    };

    drawDemoFrame();
    const canvasStream = canvas.captureStream(30);
    setStream(canvasStream);
  }, []);

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API unavailable in this browser.');
      startDemoPreview();
      return;
    }

    // Try primary media stream constraints (facingMode environment / user)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      setStream(mediaStream);
      setIsActive(true);
      setIsDemoMode(false);
      return;
    } catch (err1) {
      console.warn('Primary getUserMedia constraint failed, trying basic video constraint:', err1);
    }

    // Try fallback simple video constraint
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      setIsActive(true);
      setIsDemoMode(false);
      return;
    } catch (err2) {
      console.warn('Basic video+audio getUserMedia failed, trying video only:', err2);
    }

    // Try video-only constraint if mic is blocked
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      setStream(mediaStream);
      setIsActive(true);
      setIsDemoMode(false);
      return;
    } catch (err3) {
      console.warn('Real camera stream error. Falling back to DEMO PREVIEW mode:', err3);
      setError('Camera unavailable or permission denied. Starting DEMO PREVIEW mode.');
      startDemoPreview();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (demoAnimRef.current) {
      cancelAnimationFrame(demoAnimRef.current);
    }
    setIsActive(false);
    setIsDemoMode(false);
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    stream,
    isActive,
    isDemoMode,
    error,
    micEnabled,
    videoEnabled,
    startCamera,
    stopCamera,
    startDemoPreview,
    toggleMic,
    toggleVideo
  };
}

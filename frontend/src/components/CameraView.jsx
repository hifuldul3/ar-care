import React, { useRef } from 'react';
import { ARMarker } from './ARMarker';
import { ARManager } from '../ar/ARManager';
import { VoiceInput } from './VoiceInput';

export function CameraView({
  stream,
  isDemoMode,
  role,
  annotations = [],
  onCameraClick,
  onAcknowledge,
  onComplete,
  onVoiceARCommand
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleContainerClick = (e) => {
    // Only specialist clicking on camera triggers AR position picker
    if (role === 'specialist' && onCameraClick && containerRef.current) {
      const coords = ARManager.calculateRelativeCoordinates(e, containerRef.current);
      onCameraClick(coords);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl select-none ${role === 'specialist' ? 'cursor-crosshair' : 'cursor-default'}`}
    >
      {/* Live Video Feed */}
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={role === 'worker'}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
          <span className="text-4xl">📷</span>
          <p className="text-sm font-semibold">Camera Stream Offline</p>
          <span className="text-xs text-slate-600">Click "START CAMERA" to initiate live feed.</span>
        </div>
      )}

      {/* Demo Mode Badge */}
      {isDemoMode && (
        <div className="absolute top-3 left-3 z-20 bg-amber-500/90 text-slate-950 px-2.5 py-1 rounded text-xs font-black shadow-md">
          DEMO PREVIEW
        </div>
      )}

      {/* Specialist Canvas Click & Voice AR Guidance Bar */}
      {role === 'specialist' && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-900/90 border border-sky-500/40 p-1.5 rounded-lg backdrop-blur-md shadow-lg pointer-events-auto">
          <span className="text-xs font-semibold text-sky-400 pl-1.5 hidden sm:inline">
            🎯 Click video or speak:
          </span>
          <VoiceInput
            defaultLang="en-US"
            onTranscript={(spokenText) => {
              if (onVoiceARCommand) onVoiceARCommand(spokenText);
            }}
          />
        </div>
      )}

      {/* Worker Live Voice Control Overlay */}
      {role === 'worker' && stream && (
        <div className="absolute top-3 right-3 z-20 bg-slate-900/90 border border-emerald-500/40 p-1.5 rounded-lg backdrop-blur-md shadow-lg pointer-events-auto">
          <VoiceInput
            defaultLang="en-US"
            onTranscript={(spokenText) => {
              console.log('Worker spoken audio on AR video:', spokenText);
            }}
          />
        </div>
      )}

      {/* Shared AR Markers Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {annotations.map((ann) => (
          <ARMarker
            key={ann.annotationId}
            annotation={ann}
            role={role}
            onAcknowledge={onAcknowledge}
            onComplete={onComplete}
          />
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, ImageIcon, RefreshCw, SwitchCamera, X } from 'lucide-react';
import logger from '../utils/logger';

interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      logger.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Vui lòng cho phép truy cập camera để sử dụng tính năng này.');
      } else if (err.name === 'NotFoundError') {
        setError('Không tìm thấy camera trên thiết bị này.');
      } else {
        setError('Không thể khởi động camera. Hãy thử tải ảnh từ thư viện.');
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
      if (file.size > MAX_FILE_SIZE) {
        alert('Ảnh quá lớn (tối đa 10MB). Vui lòng chọn ảnh khác.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = capturedImage.split(',')[1];
      const mimeType = capturedImage.split(';')[0].split(':')[1] || 'image/jpeg';
      onCapture(base64Data, mimeType);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors font-medium"
        >
          <X className="w-5 h-5" />
          <span>Đóng</span>
        </button>
        <h3 className="text-white font-bold">Chụp ảnh bài viết</h3>
        <button
          onClick={switchCamera}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          disabled={!!capturedImage}
        >
          <SwitchCamera className="w-6 h-6" />
        </button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-white mb-6">{error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-colors flex items-center gap-2 mx-auto"
            >
              <ImageIcon className="w-5 h-5" />
              Chọn ảnh từ thư viện
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Instructions */}
      <div className="bg-black/50 px-4 py-2 text-center">
        <p className="text-white/70 text-sm">
          {capturedImage
            ? 'Xem lại ảnh và xác nhận để AI đọc nội dung'
            : 'Hãy chụp rõ ràng bài viết tay của em'}
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/50 flex items-center justify-center gap-6">
        {capturedImage ? (
          <>
            <button
              onClick={retake}
              disabled={isProcessing}
              className="px-6 py-3 bg-stone-700 text-white rounded-xl font-bold hover:bg-stone-600 transition-colors disabled:opacity-50"
            >
              Chụp lại
            </button>
            <button
              onClick={confirmCapture}
              disabled={isProcessing}
              className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang đọc...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Xác nhận
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-stone-700 text-white rounded-full hover:bg-stone-600 transition-colors"
              title="Chọn ảnh từ thư viện"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <button
              onClick={capturePhoto}
              disabled={!!error}
              className="p-6 bg-white rounded-full hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Chụp ảnh"
            >
              <Camera className="w-8 h-8 text-stone-800" />
            </button>
            <button
              onClick={handleClose}
              className="p-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
              title="Hủy"
            >
              <X className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default CameraCapture;

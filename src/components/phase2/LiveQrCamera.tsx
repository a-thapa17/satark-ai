"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface LiveQrCameraProps {
  onScanSuccess: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
  onClose?: () => void;
}

export default function LiveQrCamera({
  onScanSuccess,
  onError,
  onClose,
}: LiveQrCameraProps) {
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "scanning" | "permission_denied" | "no_camera" | "error"
  >("requesting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const scannerRef = useRef<any>(null);
  const containerId = "html5qr-camera-stream";

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        setCameraState("requesting");
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!isMounted) return;

        // Check for available cameras
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          if (isMounted) {
            setCameraState("no_camera");
            setErrorMessage("No video cameras found on your device.");
          }
          return;
        }

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            if (isMounted) {
              // Sound/feedback can be added here
              scanner.stop().catch(() => {});
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Frame scan failure (no QR in frame yet) - silent
          }
        );

        if (isMounted) {
          setCameraState("scanning");
        }
      } catch (err: any) {
        if (!isMounted) return;
        const msg = String(err?.message || err).toLowerCase();
        if (
          msg.includes("permission") ||
          msg.includes("denied") ||
          msg.includes("notallowederror")
        ) {
          setCameraState("permission_denied");
          setErrorMessage(
            "Camera access was denied. Please allow camera permissions in your browser address bar and try again."
          );
        } else if (msg.includes("notfounderror") || msg.includes("no camera")) {
          setCameraState("no_camera");
          setErrorMessage("No camera detected on this system.");
        } else {
          setCameraState("error");
          setErrorMessage(
            err?.message || "An unexpected camera error occurred. You can drag and drop a QR image instead."
          );
        }
        if (onError) onError(msg);
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, [onScanSuccess, onError]);

  const handleRetry = () => {
    setCameraState("requesting");
    setErrorMessage("");
    window.location.reload();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#DFD4C0] bg-[#1C1917] p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#D97706]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">
            Live Camera Scanner
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg bg-[#292524] px-2.5 py-1 text-xs font-semibold text-[#A8A29E] hover:text-white"
          >
            Close Camera
          </button>
        )}
      </div>

      {/* Target div for html5-qrcode video */}
      <div className="relative mx-auto flex min-h-[280px] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-xl bg-black">
        <div id={containerId} className="w-full h-full overflow-hidden" />

        {cameraState === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C1917]/90 p-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#D97706]" />
            <p className="text-xs font-medium text-[#FAF7F2]">
              Requesting camera permission & initializing feed…
            </p>
          </div>
        )}

        {cameraState === "permission_denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C1917] p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/40 text-red-400">
              <CameraOff className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-red-200">Camera Permission Blocked</h4>
            <p className="text-xs leading-relaxed text-[#D6D3D1] max-w-xs">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#D97706] px-4 py-2 text-xs font-bold text-white hover:bg-[#B45309]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {cameraState === "no_camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C1917] p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-900/40 text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-amber-200">No Camera Found</h4>
            <p className="text-xs leading-relaxed text-[#D6D3D1] max-w-xs">
              {errorMessage} You can still upload or drag & drop QR image files directly!
            </p>
          </div>
        )}

        {cameraState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C1917] p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <h4 className="text-sm font-bold text-red-200">Camera Feed Error</h4>
            <p className="text-xs leading-relaxed text-[#D6D3D1] max-w-xs">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#1C1917] hover:bg-[#FAF7F2]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-[#A8A29E]">
        Point your camera steadily at any QR code. Detection happens in real-time.
      </p>
    </div>
  );
}

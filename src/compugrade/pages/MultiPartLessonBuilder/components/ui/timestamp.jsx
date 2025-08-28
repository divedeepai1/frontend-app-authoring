import { X } from "lucide-react";
import { useRef, useEffect } from "react";

function TimestampModal({ open, timestamp, onClose, videoUrl }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!open || !timestamp) return;

    let [start, end] = timestamp.split("-");
    start = parseFloat(start);
    end = end === "None" ? null : parseFloat(end);

    const video = videoRef.current;
    if (!video) return;

    // Ensure start time is set after metadata loads
    const handleLoadedMetadata = () => {
      video.currentTime = start || 0;
      video.play();
    };

    // Stop playback only if end exists
    const handleTimeUpdate = () => {
      if (end !== null && video.currentTime >= end) {
        video.pause();
        video.currentTime = start || 0; // optional reset
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [open, timestamp]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[600px] rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            Video Segment ({timestamp})
          </h2>
          <div onClick={onClose} className="text-gray-600 hover:text-black">
            <X size={20} />
          </div>
        </div>

        {/* Video */}
        <div className="p-4">
          <video ref={videoRef} controls className="w-full rounded">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default TimestampModal;

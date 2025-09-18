import React, { useEffect, useState, useRef } from "react";
import { X, Play, Repeat } from "lucide-react";
import { base_url } from "../../../../../compugrade-constants";

const LessonVideoPopup = ({
  videoPreviewOpen,
  rubric_id,
  setVideoPreviewOpen,
  videoPreviewUrl,
  onVideoUrlUpdate,
}) => {
  const videoObjectUrlRef = useRef(null);

  const [voiceOvers, setVoiceOvers] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [videoUrlState, setVideoUrlState] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleClosePopup = () => {
    setVideoPreviewOpen(false);
    if (videoObjectUrlRef.current) {
      URL.revokeObjectURL(videoObjectUrlRef.current);
      videoObjectUrlRef.current = "";
    }
    setSelectedVoice("");
    setVideoUrlState(null);
    setAudioPlayer(null);
    setConvertLoading(false);
    setTestLoading(false);
  };

  useEffect(() => {
    if (!videoPreviewOpen) return;

    fetch(`${base_url}/api/openedx/get_elevenlabs_voices_with_sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "hello" }),
    })
      .then((res) => res.json())
      .then((data) => setVoiceOvers(data))
      .catch((err) => console.error("Error fetching voices:", err));
  }, [videoPreviewOpen]);

  const handleTestSample = async () => {
    if (!selectedVoice) return;
    setTestLoading(true);
    const selectedAudio = voiceOvers.find((v) => v.name === selectedVoice)?.sample_url;
    if (selectedAudio) {
      if (audioPlayer) audioPlayer.pause();
      const newAudio = new Audio(selectedAudio);
      setAudioPlayer(newAudio);
      newAudio.onended = () => setTestLoading(false);
      await newAudio.play().catch(() => setTestLoading(false));
    } else {
      setTestLoading(false);
    }
  };

  const handleConvert = () => {
    if (!selectedVoice) return;
    setConvertLoading(true);
    const selectedId = voiceOvers.find((v) => v.name === selectedVoice)?.voice_id;

    fetch(`${base_url}/api/openedx/replace_rubric_video_voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voice_id: selectedId, rubric_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        const refreshedUrl = `${data.video_presigned_url}`;
        setVideoUrlState(refreshedUrl);
        try {
          if (typeof onVideoUrlUpdate === "function") {
            onVideoUrlUpdate(refreshedUrl);
          }
        } catch (_) {}
        setConvertLoading(false);
      })
      .catch(() => setConvertLoading(false));
  };

  return (
    <>
      {videoPreviewOpen && (
        <div className="fixed inset-0 z-50 pt-[5%] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 border-none" onClick={handleClosePopup} />

          <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-4xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="text-base font-semibold">Preview Video</div>
              <div
                className="p-1 rounded hover:bg-gray-100 border-none cursor-pointer"
                onClick={handleClosePopup}
              >
                <X className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4">
              <video
                key={videoUrlState ?? videoPreviewUrl}
                className="w-full"
                style={{ height: "500px" }}
                controls
              >
                <source src={videoUrlState ?? videoPreviewUrl ?? ""} />
              </video>
            </div>

            <div className="p-4 border-t">
              <div className="relative">
                <select
                  className="w-full p-2 border-blue-600 border-2 rounded-md appearance-none bg-white relative z-10"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  <option value="">Select Voice Over</option>
                  {voiceOvers?.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedVoice && (
                <div className="mt-3 flex justify-end gap-2">
                  <div
                    onClick={!testLoading ? handleTestSample : undefined}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
                      border border-transparent rounded-md transition-colors
                      ${
                        testLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      }`}
                  >
                    {testLoading ? (
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        ></path>
                      </svg>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {testLoading ? "Testing..." : "Test Sample"}
                  </div>

                  <div
                    onClick={!convertLoading ? handleConvert : undefined}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
                      border border-transparent rounded-md transition-colors
                      ${
                        convertLoading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      }`}
                  >
                    {convertLoading ? (
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        ></path>
                      </svg>
                    ) : (
                      <Repeat className="w-4 h-4" />
                    )}
                    {convertLoading ? "Converting..." : "Convert"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonVideoPopup;

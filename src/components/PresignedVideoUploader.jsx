import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import { getVideoPresignedUrl } from "@/services/Posts";

const PresignedVideoUploader = ({ videoUrl, onUploadComplete, onUploadStart, onUploadError }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(videoUrl || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUploadedUrl(videoUrl || "");
  }, [videoUrl]);

  const handlePresignedUpload = async () => {
    if (!videoFile) return showErrorToast("Please select a video first!");

    try {
      setLoading(true);
      onUploadStart && onUploadStart(); // Notify parent upload started

      // 🔹 Sanitize filename before upload
      const sanitizedFileName = videoFile.name
        .replace(/\s+/g, "_")        // Replace spaces with underscores
        .replace(/[^\w.-]/g, "");    // Remove any unsafe characters

      // 🔹 Create a new File object with cleaned name
      const cleanedFile = new File([videoFile], sanitizedFileName, { type: videoFile.type });

      // 🔹 Request a pre-signed URL using the cleaned file
      const presignedUrl = await getVideoPresignedUrl(cleanedFile);
      if (!presignedUrl) throw new Error("Failed to get pre-signed URL");

      // 🔹 Upload to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: cleanedFile,
        headers: {
          "Content-Type": cleanedFile.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // 🔹 Extract final URL (without query params)
      const finalUrl = presignedUrl.split("?")[0];
      setUploadedUrl(finalUrl);
      onUploadComplete && onUploadComplete(finalUrl);

      showSuccessToast("Video uploaded successfully!");
    } catch (error) {
      console.error("Video upload error:", error);
      onUploadError && onUploadError();
      showErrorToast(error.message || "Something went wrong during upload");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative border border-gray-200 rounded-xl shadow-md bg-gradient-to-b from-white to-gray-50 p-6 mt-8 transition-all hover:shadow-xl">
      {loading && (
        <div className="absolute inset-0 bg-[#1A2C40] bg-opacity-50 z-50 flex flex-col items-center justify-center rounded-xl">
          <Spinner size={12} />
          <p className="text-white text-lg mt-2 font-medium">Video is uploading...</p>
        </div>
      )}

      <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
        🎥 Upload Video
      </h4>

      {(!videoFile && !uploadedUrl) || uploadedUrl ? (
        <div className="flex items-center gap-4">
          <label className="cursor-pointer flex items-center justify-center px-6 py-3 rounded-lg border border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium text-sm transition-all shadow-sm">
            Choose Video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={loading}
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </label>

          {uploadedUrl && (
            <button
              className="px-4 py-2 bg-[#ff6f3c] hover:bg-[#ff6f4c] text-white rounded-lg font-medium"
              onClick={() => {
                onUploadComplete(null);
                setVideoFile(null);
                setUploadedUrl("");
              }}
              disabled={loading}
            >
              Remove Video
            </button>
          )}
        </div>
      ) : null}

      {videoFile && !uploadedUrl && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">Selected: {videoFile.name}</p>
            <Button
              className="bg-[#1A2C40] hover:bg-[#1A2C48] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={handlePresignedUpload}
              disabled={loading}
            >
              {loading ? <Spinner size={6} /> : "Upload"}
            </Button>
          </div>
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md">
          <video
            src={
              uploadedUrl.includes("http")
                ? encodeURI(uploadedUrl)
                : `https://trade-pilot-bucket.s3.eu-north-1.amazonaws.com/${encodeURI(uploadedUrl)}`
            }
            controls
            className="w-full rounded-lg shadow-lg"
          />

          <p className="text-xs text-gray-500 break-all mt-2">
            <strong>URL:</strong> {uploadedUrl}
          </p>
        </div>
      )}
    </div>
  );
};

export default PresignedVideoUploader;

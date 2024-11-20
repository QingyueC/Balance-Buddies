'use client'
import { useState } from "react";

export default function Video() {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = "KKar0Y47q_s"; // 替换为你的 YouTube 视频 ID
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div style={{ position: "relative", width: "560px", height: "315px" }}>
      {isPlaying ? (
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-2xl"
        ></iframe>
      ) : (
        <>
          <img
            src={thumbnailUrl}
            alt="YouTube Thumbnail"
            style={{ width: "100%", height: "100%", cursor: "pointer" }}
            onClick={() => setIsPlaying(true)}
            className="rounded-2xl"
          />
          <button
            onClick={() => setIsPlaying(true)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#ff0000",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              fontSize: "24px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
}


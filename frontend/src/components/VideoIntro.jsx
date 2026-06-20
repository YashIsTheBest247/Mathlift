import { useEffect, useRef, useState } from "react";

export default function VideoIntro({ src = "/intro.mp4", speed = 2, onComplete }) {
  const videoRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    setLeaving(true);
    window.setTimeout(onComplete, 600);
  }

  function applySpeed() {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }

  useEffect(() => {
    applySpeed();
    const video = videoRef.current;
    if (video) {
      const attempt = video.play?.();
      if (attempt && attempt.catch) {
        attempt.catch(() => {});
      }
    }
    const safety = window.setTimeout(finish, 9000);
    return () => window.clearTimeout(safety);
  }, []);

  return (
    <div className={leaving ? "video-intro is-leaving" : "video-intro"}>
      <video
        ref={videoRef}
        className="video-intro-media"
        src={src}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={applySpeed}
        onPlay={applySpeed}
        onEnded={finish}
        onError={finish}
      />
      <div className="video-intro-veil" />
      <button className="video-skip" onClick={finish}>
        skip intro <span className="arrow">→</span>
      </button>
    </div>
  );
}

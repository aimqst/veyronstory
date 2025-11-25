import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // المتصفح يمنع التشغيل التلقائي، سيتم التشغيل عند أول تفاعل
      });
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/background-music.mp4" type="audio/mp4" />
      </audio>
      
      <Button
        onClick={toggleMute}
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-luxury hover-scale bg-background/80 backdrop-blur-sm border-2 border-accent/30"
        aria-label={isMuted ? "تشغيل الموسيقى" : "كتم الموسيقى"}
      >
        {isMuted ? (
          <VolumeX className="h-6 w-6" />
        ) : (
          <Volume2 className="h-6 w-6 animate-pulse" />
        )}
      </Button>
    </>
  );
};

export default BackgroundMusic;

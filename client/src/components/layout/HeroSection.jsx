// src/components/layout/HeroSection.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiPause } from "react-icons/fi";  // Fixed: removed space
import Typewriter from 'typewriter-effect';
import Button from "../ui/Button";
import { typingPhrases } from "../../utils/constants";

const HeroSection = ({ sectionGradients }) => {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    
    const playVideo = async () => {
      try {
        await video.play();
        setVideoPlaying(true);
        setVideoError(false);
      } catch (err) {
        console.log("❌ Video autoplay failed:", err);
        setVideoPlaying(false);
        setVideoError(true);
      }
    };

    playVideo();

    const handleError = () => {
      setVideoError(true);
      setVideoPlaying(false);
    };

    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('error', handleError);
      video.pause();
    };
  }, []);

  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    if (videoPlaying) {
      video.pause();
      setVideoPlaying(false);
    } else {
      video.play()
        .then(() => setVideoPlaying(true))
        .catch(err => console.log("Video play failed:", err));
    }
  };

  return (
    <div 
      className="relative h-screen min-h-[800px] overflow-hidden"
      data-aos="fade-in"
      data-aos-duration="1500"
      data-aos-delay="200"
      data-aos-once="false"
    >
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          className="object-cover w-full h-full opacity-80"
          poster="https://images.pexels.com/photos/5447382/pexels-photo-5447382.jpeg"
        >
          <source src="https://www.pexels.com/download/video/5083290/" type="video/mp4" />
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4" />
        </video>
        
        <div className={`absolute inset-0 bg-gradient-to-r ${sectionGradients.hero} mix-blend-overlay`}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

      {!videoError && (
        <button
          onClick={toggleVideoPlay}
          className="absolute z-20 p-4 text-white transition-all border rounded-full top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20 hover:border-white/40"
        >
          {videoPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
        </button>
      )}

      <div className="relative z-10 flex items-center h-full">
        <div className="w-full px-6 mx-auto max-w-7xl">
          <div 
            className="max-w-2xl"
            data-aos="fade-right"
            data-aos-duration="1200"
            data-aos-delay="400"
            data-aos-once="false"
          >
            <h1 className="text-6xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
              SpaceBuds
              <span className="block text-5xl text-gray-300 md:text-6xl lg:text-7xl">Pro</span>
            </h1>
            
            <div className="h-20 mt-4 text-2xl font-bold md:text-3xl lg:text-4xl typewriter-bold">
              <Typewriter
                options={{
                  strings: typingPhrases,
                  autoStart: true,
                  loop: true,
                  delay: 120,
                  deleteSpeed: 70,
                  pauseFor: 2000,
                  cursor: '|',
                  wrapperClassName: 'font-extrabold',
                  cursorClassName: 'text-yellow-500 text-4xl'
                }}
              />
            </div>
            
            <p className="mt-4 text-lg text-gray-400 md:text-xl">
              TWS Earphones with Immersive Sound
            </p>
            
            <div 
              className="flex flex-wrap gap-6 mt-8"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="600"
              data-aos-once="false"
            >
              <Button 
                onClick={() => navigate('/product/spacebuds-pro')}
                variant="secondary"
                size="lg"
              >
                EXPLORE NOW
              </Button>
              <Button 
                onClick={() => navigate('/shop')}
                variant="secondary"
                size="lg"
              >
                SHOP ALL
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -translate-x-1/2 left-1/2 bottom-8 animate-bounce">
        <div className="flex justify-center w-10 h-16 border-2 rounded-full border-white/20">
          <div className="w-1 h-3 mt-2 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
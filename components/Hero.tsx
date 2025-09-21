import React, { useState, useEffect, useRef } from 'react';

const FADE_DURATION_MS = 500;

const Hero: React.FC = () => {
    const [videos, setVideos] = useState<string[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // Fetch video list from the server
    useEffect(() => {
        fetch('/api/videos')
            .then(res => res.json())
            .then(videoPaths => {
                if (Array.isArray(videoPaths) && videoPaths.length > 0) {
                    setVideos(videoPaths);
                    videoRefs.current = Array(videoPaths.length).fill(null);
                }
            })
            .catch(console.error);
    }, []);

    // Effect to play the very first video on load
    useEffect(() => {
        if (videos.length > 0 && videoRefs.current[0]) {
            videoRefs.current[0].play().catch(e => {});
        }
    }, [videos]);

    // Effect to listen for time updates on the active video to trigger the fade
    useEffect(() => {
        if (videos.length < 2 || isFading) return;

        const video = videoRefs.current[currentVideoIndex];
        if (!video) return;

        const handleTimeUpdate = () => {
            if (!video.duration) return;
            const timeUntilEnd = video.duration - video.currentTime;
            if (timeUntilEnd <= FADE_DURATION_MS / 1000) {
                setIsFading(true);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [currentVideoIndex, videos, isFading]);

    // Effect to handle the actual transition logic
    useEffect(() => {
        if (!isFading || videos.length < 2) return;

        const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
        const nextVideo = videoRefs.current[nextVideoIndex];
        
        // Immediately play the next video so it's running when it fades in
        if (nextVideo) {
            nextVideo.play().catch(e => {});
        }

        // Set a timer to commit the state change after the fade
        const timer = setTimeout(() => {
            const oldVideo = videoRefs.current[currentVideoIndex];
            if (oldVideo) {
                oldVideo.pause();
                oldVideo.currentTime = 0;
            }
            
            setCurrentVideoIndex(nextVideoIndex);
            setIsFading(false);
        }, FADE_DURATION_MS);

        return () => clearTimeout(timer);
    }, [isFading, videos, currentVideoIndex]);

    // Fallback content if videos are not loaded yet
    if (videos.length === 0) {
        return (
            <div className="hero-container">
                <div className="hero-dark-overlay" />
                <div className="hero-dotted-overlay" />
                <div className="hero-gradient-overlay" />
                <div className="hero-content">
                    <h1 className="hero-title">Inovação e Excelência Jurídica na Era Digital</h1>
                    <p className="hero-subtitle">
                        Combinamos tradição e tecnologia para oferecer soluções legais sem precedentes.
                    </p>
                    <a href="#contact" className="hero-cta-button">Agende uma Consulta</a>
                </div>
            </div>
        );
    }

    const nextVideoIndex = (currentVideoIndex + 1) % videos.length;

    return (
        <div className="hero-container">
            {videos.map((videoSrc, index) => {
                let opacity = 0;
                if (!isFading && index === currentVideoIndex) {
                    opacity = 1;
                } else if (isFading) {
                    if (index === currentVideoIndex) opacity = 0;
                    if (index === nextVideoIndex) opacity = 1;
                }
                
                return (
                    <video
                        key={index}
                        ref={el => videoRefs.current[index] = el}
                        className="hero-video"
                        style={{ opacity, transition: `opacity ${FADE_DURATION_MS}ms ease-in-out` }}
                        src={videoSrc}
                        muted
                        playsInline
                    />
                );
            })}
            <div className="hero-dark-overlay" />
            <div className="hero-dotted-overlay" />
            <div className="hero-gradient-overlay" />
            <div className="hero-content">
                 <h1 className="hero-title">Inovação e Excelência Jurídica na Era Digital</h1>
                 <p className="hero-subtitle">
                     Combinamos tradição e tecnologia para oferecer soluções legais sem precedentes.
                 </p>
                 <a href="#contact" className="hero-cta-button">Agende uma Consulta</a>
            </div>
        </div>
    );
};

export default Hero;

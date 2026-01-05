import React from 'react';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { ImageGrid } from '../components/landing/ImageGrid';
import { Marquee } from '../components/landing/Marquee';
import { Footer } from '../components/landing/Footer';

const LandingPage: React.FC = () => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    return (
        <div className="min-h-screen bg-session-dark text-white font-sans selection:bg-neon-pulse selection:text-black overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.1]"></div>
                
                <div 
                    className="absolute inset-0 bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px] opacity-60 transition-opacity duration-300"
                    style={{
                        maskImage: `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
                        WebkitMaskImage: `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
                    }}
                ></div>
            </div>

            <Header />

            <main className="flex flex-col items-center w-full relative z-10">
                <Hero />
                <Marquee />
                <ImageGrid />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;

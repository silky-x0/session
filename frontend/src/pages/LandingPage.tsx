import React from 'react';
import { useMotionValue, useSpring, motion } from "framer-motion";
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { Marquee } from '../components/landing/Marquee';
import { EditorShowcase } from '../components/landing/EditorShowcase';
import { GeneratorSection } from '../components/landing/GeneratorSection';
import { TypographyBreak } from '../components/landing/TypographyBreak';
import { FeatureGallery } from '../components/landing/FeatureGallery';
import { CinematicFooter } from '../components/ui/motion-footer';

const LandingPage: React.FC = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

    React.useEffect(() => {
        const updateMousePosition = (ev: MouseEvent) => {
            mouseX.set(ev.clientX);
            mouseY.set(ev.clientY);
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="min-h-screen bg-session-dark text-white font-sans selection:bg-neon-pulse selection:text-black overflow-x-hidden">
            <motion.div 
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    "--mouse-x": smoothX,
                    "--mouse-y": smoothY,
                } as any}
            >
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.1]"></div>
                
                <div 
                    className="absolute inset-0 bg-[radial-gradient(#00FF41_1px,transparent_1px)] [background-size:24px_24px] opacity-60 transition-opacity duration-300"
                    style={{
                        maskImage: `radial-gradient(250px circle at calc(var(--mouse-x) * 1px) calc(var(--mouse-y) * 1px), black, transparent)`,
                        WebkitMaskImage: `radial-gradient(250px circle at calc(var(--mouse-x) * 1px) calc(var(--mouse-y) * 1px), black, transparent)`,
                    }}
                ></div>
            </motion.div>

            <Header />

            <main className="flex flex-col items-center w-full relative z-10">
                <Hero />
                <Marquee />
                <EditorShowcase />
                <GeneratorSection />
                <TypographyBreak />
                <FeatureGallery />
            </main>

            <CinematicFooter />
        </div>
    );
};

export default LandingPage;

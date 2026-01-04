import React from 'react';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { ImageGrid } from '../components/landing/ImageGrid';
import { Marquee } from '../components/landing/Marquee';
import { Footer } from '../components/landing/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#1c1c1c] text-white font-sans selection:bg-loki-green selection:text-black overflow-x-hidden">
            {/* Dot Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]"></div>
            </div>

            <Header />

            <main className="flex flex-col items-center w-full relative z-10">
                <Hero />
                <ImageGrid />
                <Marquee />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;

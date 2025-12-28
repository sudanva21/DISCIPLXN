import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

export function Hero() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="hero">
            {/* Background layers */}
            <motion.div className="hero__bg-layer hero__bg-layer--1" style={{ y: backgroundY }} />
            <motion.div className="hero__bg-layer hero__bg-layer--2" style={{ y: backgroundY }} />
            <div className="hero__overlay" />
            <div className="hero__smoke" />

            {/* Light streaks */}
            <div className="hero__streaks">
                <div className="hero__streak hero__streak--1" />
                <div className="hero__streak hero__streak--2" />
                <div className="hero__streak hero__streak--3" />
            </div>

            {/* Content */}
            <motion.div className="hero__content" style={{ y: textY, opacity }}>
                <motion.div
                    className="hero__badge"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="hero__badge-dot" />
                    Elite Fitness Management
                </motion.div>

                <motion.h1
                    className="hero__title"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                >
                    Not for Everyone.
                </motion.h1>

                <motion.p
                    className="hero__subtitle"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    Built for Discipline.
                </motion.p>

                <motion.div
                    className="hero__cta-wrapper"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <Link to="/register" className="hero__cta">
                        <span>Enter the System</span>
                        <span className="hero__cta-glow" />
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="hero__scroll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{ opacity }}
            >
                <span>Scroll</span>
                <ChevronDown className="hero__scroll-icon" />
            </motion.div>
        </section>
    );
}

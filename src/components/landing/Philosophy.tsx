import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import './Philosophy.css';

export function Philosophy() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const imageScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

    const textLines = [
        'No paper.',
        'No confusion.',
        'No compromise.',
        'Built for precision.',
    ];

    return (
        <section ref={sectionRef} className="philosophy">
            <div className="philosophy__container">
                {/* Image side */}
                <motion.div
                    className="philosophy__image-wrapper"
                    style={{ y: imageY, scale: imageScale }}
                >
                    <div className="philosophy__image">
                        <div className="philosophy__image-overlay" />
                        <div className="philosophy__image-texture" />
                    </div>
                    <div className="philosophy__image-shadow" />
                </motion.div>

                {/* Text side */}
                <div className="philosophy__content">
                    <motion.span
                        className="philosophy__label"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        Our Philosophy
                    </motion.span>

                    <div className="philosophy__text">
                        {textLines.map((line, index) => (
                            <motion.p
                                key={index}
                                className="philosophy__line"
                                initial={{ opacity: 0, x: -40 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.2 + index * 0.15 }}
                            >
                                {line}
                            </motion.p>
                        ))}
                    </div>

                    <motion.div
                        className="philosophy__accent"
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : {}}
                        transition={{ duration: 1, delay: 0.8 }}
                    />
                </div>
            </div>

            {/* Background elements */}
            <div className="philosophy__bg-line philosophy__bg-line--1" />
            <div className="philosophy__bg-line philosophy__bg-line--2" />
        </section>
    );
}

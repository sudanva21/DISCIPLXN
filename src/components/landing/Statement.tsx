import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import './Statement.css';

export function Statement() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    return (
        <section ref={sectionRef} className="statement">
            {/* Animated background */}
            <motion.div className="statement__bg" style={{ y: bgY }}>
                <div className="statement__bg-glow statement__bg-glow--1" />
                <div className="statement__bg-glow statement__bg-glow--2" />
                <div className="statement__bg-lines" />
            </motion.div>

            {/* Content */}
            <motion.div className="statement__content" style={{ opacity }}>
                <motion.p
                    className="statement__text statement__text--primary"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1 }}
                >
                    This is not just a system.
                </motion.p>

                <motion.p
                    className="statement__text statement__text--accent"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    This is discipline.
                </motion.p>

                <motion.div
                    className="statement__line"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 1.2, delay: 0.6 }}
                />
            </motion.div>
        </section>
    );
}

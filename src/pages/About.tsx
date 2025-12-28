import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import './About.css';

const storyLines = [
    { text: 'We believe in precision.', delay: 0 },
    { text: 'In systems that never fail.', delay: 0.15 },
    { text: 'In discipline that builds empires.', delay: 0.3 },
    { text: 'In control that creates freedom.', delay: 0.45 },
];

const values = [
    {
        title: 'Consistency',
        description: 'Every day. Every rep. Every record. Tracked with unwavering precision.',
    },
    {
        title: 'Control',
        description: 'Complete oversight of your fitness empire. Nothing escapes the system.',
    },
    {
        title: 'Performance',
        description: 'Designed for those who demand more. Built for champions.',
    },
    {
        title: 'Commitment',
        description: 'We don\'t build for casual users. We build for the devoted.',
    },
];

export function About() {
    const heroRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef<HTMLDivElement>(null);

    const heroInView = useInView(heroRef, { once: true });
    const storyInView = useInView(storyRef, { once: true, margin: '-100px' });
    const valuesInView = useInView(valuesRef, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], ['0%', '30%']);

    return (
        <div className="about">
            {/* Hero Section */}
            <section ref={heroRef} className="about-hero">
                <motion.div className="about-hero__bg" style={{ y: heroY }} />
                <motion.div className="about-hero__content" style={{ opacity: heroOpacity }}>
                    <motion.span
                        className="about-hero__label"
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        The Origin
                    </motion.span>
                    <motion.h1
                        className="about-hero__title"
                        initial={{ opacity: 0, y: 40 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        Born from<br />
                        <span className="text-accent">Discipline</span>
                    </motion.h1>
                </motion.div>
                <div className="about-hero__overlay" />
            </section>

            {/* Story Section */}
            <section ref={storyRef} className="about-story">
                <div className="about-story__container">
                    <div className="about-story__lines">
                        {storyLines.map((line, index) => (
                            <motion.p
                                key={index}
                                className="about-story__line"
                                initial={{ opacity: 0, x: -60 }}
                                animate={storyInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.8, delay: line.delay }}
                            >
                                {line.text}
                            </motion.p>
                        ))}
                    </div>

                    <motion.div
                        className="about-story__description"
                        initial={{ opacity: 0, y: 40 }}
                        animate={storyInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <p>
                            DISCIPLXN was forged in the crucible of elite fitness management.
                            We saw gyms drowning in paper, members lost in confusion,
                            and administrators overwhelmed by chaos.
                        </p>
                        <p>
                            We built the antidote. A system so precise, so controlled,
                            that every fee is tracked, every member is managed,
                            and every gym operates like a well-oiled machine.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section ref={valuesRef} className="about-values">
                <div className="about-values__container">
                    <motion.h2
                        className="about-values__title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        Our Core Principles
                    </motion.h2>

                    <div className="about-values__grid">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                className="about-value-card"
                                initial={{ opacity: 0, y: 40 }}
                                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
                            >
                                <span className="about-value-card__number">0{index + 1}</span>
                                <h3 className="about-value-card__title">{value.title}</h3>
                                <p className="about-value-card__description">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="about-cta__container">
                    <motion.h2
                        className="about-cta__title"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        Ready for Discipline?
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Link to="/register" className="btn btn-primary about-cta__button">
                            Enter the System
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

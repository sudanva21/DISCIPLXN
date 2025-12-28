import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { UserPlus, Dumbbell, LineChart, TrendingUp, Trophy } from 'lucide-react';
import './Process.css';

const steps = [
    { icon: UserPlus, label: 'Register', description: 'Join the vault' },
    { icon: Dumbbell, label: 'Train', description: 'Push limits' },
    { icon: LineChart, label: 'Track', description: 'Monitor progress' },
    { icon: TrendingUp, label: 'Progress', description: 'See results' },
    { icon: Trophy, label: 'Perform', description: 'Achieve greatness' },
];

export function Process() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const lineHeight = useTransform(scrollYProgress, [0.1, 0.6], ['0%', '100%']);

    return (
        <section ref={sectionRef} className="process">
            <div className="process__container">
                <motion.div
                    className="process__header"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="process__label">The Journey</span>
                    <h2 className="process__title">Your Path to Performance</h2>
                </motion.div>

                <div className="process__timeline">
                    {/* Animated line */}
                    <div className="process__line-track">
                        <motion.div
                            className="process__line-fill"
                            style={{ height: lineHeight }}
                        />
                    </div>

                    {/* Steps */}
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.label}
                            className="process__step"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 + index * 0.15 }}
                        >
                            <div className="process__step-content">
                                <div className="process__step-icon">
                                    <step.icon />
                                </div>
                                <div className="process__step-text">
                                    <h3 className="process__step-label">{step.label}</h3>
                                    <p className="process__step-description">{step.description}</p>
                                </div>
                            </div>
                            <div className="process__step-dot" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background */}
            <div className="process__bg-gradient" />
        </section>
    );
}

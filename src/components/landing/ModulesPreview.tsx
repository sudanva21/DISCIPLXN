import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Shield, Users, Zap, Receipt, Bell, BarChart3, Dumbbell, Pill, UserCheck } from 'lucide-react';
import './ModulesPreview.css';

const modules = [
    {
        id: 'member-vault',
        title: 'Member Vault',
        description: 'Your secure fitness command center.',
        features: [
            { icon: Receipt, text: 'Digital Receipts' },
            { icon: Shield, text: 'Fee Status' },
            { icon: Bell, text: 'Notifications' },
        ],
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    },
    {
        id: 'admin-command',
        title: 'Admin Command',
        description: 'Complete control. Total oversight.',
        features: [
            { icon: Users, text: 'Member Management' },
            { icon: BarChart3, text: 'Billing & Reports' },
            { icon: Bell, text: 'Gym Announcements' },
        ],
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    },
    {
        id: 'performance-hub',
        title: 'Performance Hub',
        description: 'Optimize. Evolve. Dominate.',
        features: [
            { icon: Dumbbell, text: 'Diet Plans' },
            { icon: Pill, text: 'Supplement Store' },
            { icon: UserCheck, text: 'Personal Training' },
        ],
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        badge: 'Coming Soon',
    },
];

export function ModulesPreview() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section ref={sectionRef} className="modules">
            <div className="modules__container">
                <motion.div
                    className="modules__header"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="modules__title">Core Systems</h2>
                    <p className="modules__subtitle">
                        Three pillars of discipline. One unified platform.
                    </p>
                </motion.div>

                <div className="modules__grid">
                    {modules.map((module, index) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            index={index}
                            isInView={isInView}
                        />
                    ))}
                </div>
            </div>

            {/* Background effects */}
            <div className="modules__bg-glow modules__bg-glow--1" />
            <div className="modules__bg-glow modules__bg-glow--2" />
        </section>
    );
}

interface ModuleCardProps {
    module: typeof modules[0];
    index: number;
    isInView: boolean;
}

function ModuleCard({ module, index, isInView }: ModuleCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

    return (
        <motion.div
            ref={cardRef}
            className="module-card"
            style={{ y }}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.15 }}
        >
            <div className="module-card__inner">
                {module.badge && (
                    <span className="module-card__badge">{module.badge}</span>
                )}

                <div className="module-card__icon-wrapper">
                    <Zap className="module-card__icon" />
                </div>

                <h3 className="module-card__title">{module.title}</h3>
                <p className="module-card__description">{module.description}</p>

                <ul className="module-card__features">
                    {module.features.map((feature, i) => (
                        <li key={i} className="module-card__feature">
                            <feature.icon className="module-card__feature-icon" />
                            <span>{feature.text}</span>
                        </li>
                    ))}
                </ul>

                <div className="module-card__glow" />
            </div>
        </motion.div>
    );
}

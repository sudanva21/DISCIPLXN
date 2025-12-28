import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import './Contact.css';

export function Contact() {
    const formRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(formRef, { once: true, margin: '-100px' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gymName: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <div className="contact">
            {/* Hero */}
            <section className="contact-hero">
                <div className="contact-hero__bg" />
                <div className="contact-hero__content">
                    <motion.span
                        className="contact-hero__label"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Get Access
                    </motion.span>
                    <motion.h1
                        className="contact-hero__title"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        Serious Fitness Requires<br />
                        <span className="text-accent">Serious Systems</span>
                    </motion.h1>
                </div>
            </section>

            {/* Form Section */}
            <section ref={formRef} className="contact-form-section">
                <div className="contact-form-section__container">
                    {/* Info Column */}
                    <motion.div
                        className="contact-info"
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="contact-info__title">Request Access</h2>
                        <p className="contact-info__description">
                            DISCIPLXN is built for elite gyms and premium fitness studios.
                            Tell us about your facility and we'll determine if you're a fit.
                        </p>

                        <div className="contact-info__items">
                            <div className="contact-info__item">
                                <div className="contact-info__icon">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <span className="contact-info__label">Email</span>
                                    <p className="contact-info__value">access@disciplxn.com</p>
                                </div>
                            </div>
                            <div className="contact-info__item">
                                <div className="contact-info__icon">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <span className="contact-info__label">Phone</span>
                                    <p className="contact-info__value">+1 (555) 000-0000</p>
                                </div>
                            </div>
                            <div className="contact-info__item">
                                <div className="contact-info__icon">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <span className="contact-info__label">Location</span>
                                    <p className="contact-info__value">Worldwide</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Column */}
                    <motion.div
                        className="contact-form-wrapper"
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {isSubmitted ? (
                            <div className="contact-form-success">
                                <div className="contact-form-success__icon">✓</div>
                                <h3 className="contact-form-success__title">Request Received</h3>
                                <p className="contact-form-success__message">
                                    We'll review your application and reach out within 48 hours.
                                </p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="contact-form__group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Smith"
                                        required
                                    />
                                </div>

                                <div className="contact-form__group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@elitegym.com"
                                        required
                                    />
                                </div>

                                <div className="contact-form__group">
                                    <label htmlFor="gymName">Gym / Studio Name</label>
                                    <input
                                        type="text"
                                        id="gymName"
                                        name="gymName"
                                        value={formData.gymName}
                                        onChange={handleChange}
                                        placeholder="Elite Fitness Club"
                                        required
                                    />
                                </div>

                                <div className="contact-form__group">
                                    <label htmlFor="message">Tell Us About Your Facility</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Number of members, current systems, what you're looking for..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary contact-form__submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="contact-form__spinner" />
                                    ) : (
                                        <>
                                            <span>Request Access</span>
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

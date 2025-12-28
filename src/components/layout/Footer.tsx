import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import './Footer.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <Link to="/" className="footer__logo">
                            <span className="footer__logo-text">DISCIP</span>
                            <span className="footer__logo-accent">LXN</span>
                        </Link>
                        <p className="footer__tagline">
                            Not for everyone.<br />
                            Built for discipline.
                        </p>
                    </div>

                    <div className="footer__links">
                        <div className="footer__column">
                            <h4 className="footer__heading">Platform</h4>
                            <Link to="/" className="footer__link">Home</Link>
                            <Link to="/about" className="footer__link">About</Link>
                            <Link to="/contact" className="footer__link">Contact</Link>
                        </div>
                        <div className="footer__column">
                            <h4 className="footer__heading">Access</h4>
                            <Link to="/login" className="footer__link">Member Login</Link>
                            <Link to="/login" className="footer__link">Admin Access</Link>
                            <Link to="/register" className="footer__link">Request Access</Link>
                        </div>
                        <div className="footer__column">
                            <h4 className="footer__heading">Legal</h4>
                            <Link to="/" className="footer__link">Privacy Policy</Link>
                            <Link to="/" className="footer__link">Terms of Service</Link>
                            <Link to="/" className="footer__link">Cookie Policy</Link>
                        </div>
                    </div>
                </div>

                <div className="footer__divider"></div>

                <div className="footer__bottom">
                    <p className="footer__copyright">
                        &copy; {currentYear} DISCIPLXN. All rights reserved.
                    </p>
                    <div className="footer__social">
                        <a href="#" className="footer__social-link" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="footer__social-link" aria-label="Twitter">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="footer__social-link" aria-label="YouTube">
                            <Youtube size={20} />
                        </a>
                        <a href="#" className="footer__social-link" aria-label="Email">
                            <Mail size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

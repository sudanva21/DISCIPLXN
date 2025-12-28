import { Hero } from '../components/landing/Hero';
import { ModulesPreview } from '../components/landing/ModulesPreview';
import { Philosophy } from '../components/landing/Philosophy';
import { Process } from '../components/landing/Process';
import { Statement } from '../components/landing/Statement';
import './Home.css';

export function Home() {
    return (
        <div className="home">
            <Hero />
            <ModulesPreview />
            <Philosophy />
            <Process />
            <Statement />
        </div>
    );
}

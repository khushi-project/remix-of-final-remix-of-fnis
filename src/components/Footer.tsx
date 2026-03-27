import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-card/50 py-12">
    <div className="container mx-auto px-4">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">FNIS</span>
          </Link>
          <p className="text-sm text-muted-foreground">Fitness Nutrition Intelligence System — your smart companion for health and performance.</p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {['Dashboard', 'Meal Planner', 'Workouts', 'About'].map(l => (
              <Link key={l} to={`/${l === 'Meal Planner' ? 'meals' : l.toLowerCase()}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Contact</h4>
          <p className="text-sm text-muted-foreground">support@fnis.app</p>
          <p className="text-sm text-muted-foreground mt-1">Built with ❤️ for fitness enthusiasts</p>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FNIS. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

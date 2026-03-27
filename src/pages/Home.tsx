import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Utensils, BarChart3, Brain, Zap, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  { icon: Activity, title: 'Workout Tracking', desc: 'Log exercises and monitor your progress with detailed analytics.' },
  { icon: Utensils, title: 'Meal Planning', desc: 'Plan your daily meals with precise macro and calorie tracking.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visualize your nutrition data with interactive charts and insights.' },
  { icon: Brain, title: 'AI Suggestions', desc: 'Get intelligent meal and workout recommendations tailored to your goals.' },
  { icon: Zap, title: 'Real-time Sync', desc: 'Your data syncs instantly across all your devices.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your health data is encrypted and never shared with third parties.' },
];

const Home = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="gradient-hero relative flex min-h-screen items-center pt-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
              🚀 Your Fitness Journey Starts Here
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Fuel Your Body.<br />
              <span className="text-gradient">Train Smarter.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              FNIS combines intelligent nutrition tracking with workout planning to help you achieve your fitness goals faster.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/register" className="gradient-primary glow-primary inline-flex items-center gap-2 rounded-lg px-8 py-3 font-display font-bold text-primary-foreground transition-transform hover:scale-105">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 font-medium text-foreground transition-colors hover:bg-secondary">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient orb decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>
    </section>

    {/* Features */}
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Everything You Need</h2>
          <p className="mt-3 text-muted-foreground">Powerful tools designed for serious fitness enthusiasts.</p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:glow-primary-sm"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to Transform?</h2>
        <p className="mt-3 text-muted-foreground">Join thousands already crushing their fitness goals with FNIS.</p>
        <Link to="/register" className="gradient-primary glow-primary mt-8 inline-flex items-center gap-2 rounded-lg px-8 py-3 font-display font-bold text-primary-foreground transition-transform hover:scale-105">
          Start Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;

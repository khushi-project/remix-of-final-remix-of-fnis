import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Target, Users, Lightbulb, Heart } from 'lucide-react';

const values = [
  { icon: Target, title: 'Precision', desc: 'Accurate macro and calorie tracking powered by comprehensive food databases.' },
  { icon: Users, title: 'Community', desc: 'Connect with like-minded fitness enthusiasts and share your journey.' },
  { icon: Lightbulb, title: 'Intelligence', desc: 'Smart recommendations that adapt to your goals and preferences.' },
  { icon: Heart, title: 'Wellness', desc: 'A holistic approach that balances nutrition, exercise, and recovery.' },
];

const About = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="container mx-auto px-4 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center mb-16">
        <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">About FNIS</span>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Built for Those Who <span className="text-gradient">Push Limits</span></h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The Fitness Nutrition Intelligence System (FNIS) is a comprehensive platform designed to help athletes and fitness enthusiasts optimize their nutrition and training. We combine smart tracking with actionable insights to fuel your performance.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 mb-16">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-3">
              <v.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
        <h2 className="font-display text-2xl font-bold">Our Mission</h2>
        <p className="mt-3 text-muted-foreground">
          To make intelligent nutrition and fitness tracking accessible to everyone — from beginners to elite athletes. We believe that understanding what you eat and how you train is the foundation of a healthier, stronger life.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;


"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { appConfig } from "@/config/app";

const AboutPage = () => {
  const [countVisible, setCountVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCountVisible(true);
        }
      });
    }, { threshold: 0.5 });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  const CountUp = ({ end, duration = 2, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!countVisible) return;

      let startTime: number;
      let animationFrame: number;

      const updateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(updateCount);
        }
      };

      animationFrame = requestAnimationFrame(updateCount);

      return () => cancelAnimationFrame(animationFrame);
    }, [countVisible, end, duration]);

    return <span>{count}{suffix}</span>;
  };

  return (
    <div className="container py-12 md:py-24 space-y-16">
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About {appConfig.name}</h1>
        <p className="text-lg text-muted-foreground">
          We're on a mission to help designers create pixel-perfect designs that match brand guidelines every time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            {appConfig.name} was founded in 2022 by a team of designers and developers who were frustrated with the inconsistency in brand implementation across design teams.
          </p>
          <p className="text-muted-foreground">
            We saw that even with detailed brand guidelines, designs often strayed from the established standards. This created confusion, delays, and extra work for everyone involved.
          </p>
          <p className="text-muted-foreground">
            That's why we built {appConfig.name} — to provide an automated way to ensure design consistency and save everyone time and frustration.
          </p>
        </div>
        <div className="bg-muted aspect-square rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div
        ref={statsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-primary/5 p-8 rounded-xl"
      >
        <div className="text-center space-y-3">
          <motion.h3
            className="text-5xl font-bold text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={countVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <CountUp end={10000} suffix="+" />
          </motion.h3>
          <p className="text-xl">Designs checked monthly</p>
        </div>
        <div className="text-center space-y-3">
          <motion.h3
            className="text-5xl font-bold text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={countVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CountUp end={500} suffix="+" />
          </motion.h3>
          <p className="text-xl">Design teams served</p>
        </div>
        <div className="text-center space-y-3">
          <motion.h3
            className="text-5xl font-bold text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={countVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CountUp end={99} suffix="%" />
          </motion.h3>
          <p className="text-xl">Detection accuracy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 bg-muted aspect-square rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80"
            alt="Our mission"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="order-1 md:order-2 space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            We believe that great design requires consistency, and consistency shouldn't be a manual process.
          </p>
          <p className="text-muted-foreground">
            Our mission is to empower design teams with tools that make brand consistency automatic, allowing designers to focus on what they do best — creating beautiful, functional designs.
          </p>
          <p className="text-muted-foreground">
            By combining AI technology with design expertise, we're creating a future where brand inconsistencies are caught before they ever make it to production.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Alex Morgan", role: "CEO & Co-founder", image: "https://randomuser.me/api/portraits/women/62.jpg" },
            { name: "Jamie Chen", role: "CTO & Co-founder", image: "https://randomuser.me/api/portraits/men/32.jpg" },
            { name: "Sam Taylor", role: "Lead Designer", image: "https://randomuser.me/api/portraits/women/44.jpg" },
            { name: "Raj Patel", role: "AI Engineer", image: "https://randomuser.me/api/portraits/men/68.jpg" }
          ].map((person, index) => (
            <motion.div
              key={index}
              className="text-center space-y-3 hover-scale"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square w-full max-w-[250px] mx-auto overflow-hidden rounded-full">
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-xl">{person.name}</h3>
              <p className="text-muted-foreground">{person.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

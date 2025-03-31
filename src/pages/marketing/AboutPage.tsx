
import { Users, Award, AlignCenter, Workflow } from "lucide-react";

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    bio: "Former Design Director with 15 years of experience working with global brands. Founded TailorChecker to solve the brand consistency challenges she experienced firsthand.",
    image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=8344ff&color=fff",
  },
  {
    name: "David Chen",
    role: "CTO",
    bio: "AI and machine learning expert with a background in computer vision. Leads the technology team building our design analysis engine.",
    image: "https://ui-avatars.com/api/?name=David+Chen&background=8344ff&color=fff",
  },
  {
    name: "Miguel Sanchez",
    role: "Head of Design",
    bio: "Award-winning designer who ensures TailorChecker's user experience is as thoughtful as the problems it solves.",
    image: "https://ui-avatars.com/api/?name=Miguel+Sanchez&background=8344ff&color=fff",
  },
  {
    name: "Emily Parker",
    role: "Customer Success",
    bio: "Dedicated to ensuring every client gets the most value from TailorChecker. Former brand manager who understands client needs.",
    image: "https://ui-avatars.com/api/?name=Emily+Parker&background=8344ff&color=fff",
  },
];

const values = [
  {
    icon: AlignCenter,
    title: "Precision",
    description: "We believe that details matter. Our platform is built to catch even the smallest inconsistencies to ensure perfect brand alignment.",
  },
  {
    icon: Users,
    title: "Empowerment",
    description: "We empower designers to deliver their best work with confidence, knowing it meets brand standards.",
  },
  {
    icon: Workflow,
    title: "Efficiency",
    description: "We're committed to saving you time by automating tedious compliance checking so you can focus on creative work.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from our platform's accuracy to our customer support.",
  },
];

const AboutPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container px-4 mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              At TailorChecker, we're on a mission to eliminate brand inconsistency 
              from the design process. We believe that when designers have the right 
              tools to ensure brand compliance, they can focus more on creativity 
              and less on tedious checking.
            </p>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  TailorChecker was born from a frustration familiar to every design team: the 
                  time-consuming process of manually checking designs against brand guidelines, 
                  and the embarrassment of discovering inconsistencies after delivery to clients.
                </p>
                <p>
                  Founded in 2023 by Sarah Johnson, a design director with 15 years of experience 
                  at leading agencies, TailorChecker leverages the latest in AI and machine learning 
                  to automate brand compliance checking.
                </p>
                <p>
                  What started as an internal tool for Sarah's design team quickly grew as other 
                  designers saw its potential. Today, TailorChecker helps design teams around the 
                  world deliver perfectly brand-aligned designs with confidence.
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-card rounded-2xl overflow-hidden shadow-sm border">
                <div className="aspect-[4/5] bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <p className="font-medium">Company Photo</p>
                    <p className="text-sm opacity-70">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div key={i} className="brand-card">
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-32 h-32 overflow-hidden rounded-full mb-4 border-4 border-brand-100 dark:border-brand-900/30">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-brand-600 dark:text-brand-400 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="brand-card text-center">
              <h3 className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">10,000+</h3>
              <p className="text-muted-foreground">Designs checked monthly</p>
            </div>
            <div className="brand-card text-center">
              <h3 className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">500+</h3>
              <p className="text-muted-foreground">Design teams served</p>
            </div>
            <div className="brand-card text-center">
              <h3 className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">99%</h3>
              <p className="text-muted-foreground">Detection accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Section */}
      <section className="py-16 bg-brand-gradient text-white">
        <div className="container px-4 mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about design, 
            technology, and helping creative teams do their best work.
          </p>
          <button className="bg-white text-brand-600 px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
            View Open Positions
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

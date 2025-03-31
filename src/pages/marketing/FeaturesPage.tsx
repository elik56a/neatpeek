
import { CheckIcon, LucideIcon, RefreshCcw, Shield, Zap, Palette, Figma, BarChart, Database, Clock, FileCheck, Lock, Users, Bot, Settings, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => (
  <div className="brand-card">
    <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const features = [
  {
    title: "Automated Guidelines Extraction",
    description: "Upload your brand guidelines document and our AI will automatically extract key rules and standards.",
    icon: Bot,
  },
  {
    title: "Multi-format Brand Setup",
    description: "Configure your brand through documents, example designs, or manual input - whichever works best for you.",
    icon: Settings,
  },
  {
    title: "Real-time Design Analysis",
    description: "Get instant feedback on your designs with specific suggestions for improvements.",
    icon: Zap,
  },
  {
    title: "Direct Figma Integration",
    description: "Connect to Figma for seamless design checking without leaving your workflow.",
    icon: Figma,
  },
  {
    title: "Comprehensive Color Checking",
    description: "Ensure all colors in your designs match your brand's official palette.",
    icon: Palette,
  },
  {
    title: "Typography Verification",
    description: "Confirm that all text uses the correct fonts, sizes, weights, and spacing.",
    icon: FileCheck,
  },
  {
    title: "Logo Usage Compliance",
    description: "Verify that logos are used correctly with proper spacing, sizing, and placement.",
    icon: Shield,
  },
  {
    title: "Detailed Analytics",
    description: "Track improvement over time with comprehensive reports on compliance rates.",
    icon: BarChart,
  },
  {
    title: "Multiple Brand Profiles",
    description: "Manage multiple brands or sub-brands from a single dashboard.",
    icon: Database,
  },
  {
    title: "Team Collaboration",
    description: "Share insights and feedback with your entire design team.",
    icon: Users,
  },
  {
    title: "Design History",
    description: "Keep a record of all checked designs and their compliance status.",
    icon: Clock,
  },
  {
    title: "API Access",
    description: "Integrate with your existing tools via our comprehensive API (Enterprise plan).",
    icon: Code,
  },
];

const advancedFeatures = [
  "Interactive feedback with clickable suggestions",
  "Automatic generation of correction recommendations",
  "Customizable compliance thresholds",
  "Bulk design upload and batch processing",
  "Design version comparison",
  "Guidelines documentation generation",
  "White-labeled design reports",
  "Integration with Adobe Creative Cloud",
  "Export compliance reports as PDF",
  "Automated design correction suggestions",
  "Brand asset management library",
  "Custom rule creation and enforcement",
];

const FeaturesPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container px-4 mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              All the tools you need for perfect <span className="hero-text-gradient">design compliance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover how TailorChecker transforms your design process with powerful brand compliance features
            </p>
            <Button size="lg" asChild>
              <Link to="/register">Try For Free</Link>
            </Button>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-1/3 -left-64 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-64 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </section>

      {/* Main Features */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Figma Integration */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Seamless Figma Integration</h2>
              <p className="text-muted-foreground mb-6">
                Connect TailorChecker directly to your Figma workspace for the most efficient design compliance workflow.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span>Check designs without leaving Figma</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span>Receive comments directly on your design frames</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span>Track compliance through version history</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span>Share compliance reports with your team</span>
                </li>
              </ul>
            </div>
            <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
              <div className="aspect-video bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <p className="font-medium">Figma Integration Demo</p>
                  <p className="text-sm opacity-70">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Advanced Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
            {advancedFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckIcon className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left">Feature</th>
                  <th className="py-3 px-4 text-center">Starter</th>
                  <th className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">Professional</th>
                  <th className="py-3 px-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-background">
                  <td className="py-3 px-4 font-medium">Brand Profile Creation</td>
                  <td className="py-3 px-4 text-center">Basic</td>
                  <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">Advanced</td>
                  <td className="py-3 px-4 text-center">Custom</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Figma Integration</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr className="bg-background">
                  <td className="py-3 px-4 font-medium">Design Analysis Depth</td>
                  <td className="py-3 px-4 text-center">Basic</td>
                  <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">Detailed</td>
                  <td className="py-3 px-4 text-center">Expert</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Analytics Dashboard</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">Basic</td>
                  <td className="py-3 px-4 text-center">Advanced</td>
                </tr>
                <tr className="bg-background">
                  <td className="py-3 px-4 font-medium">Team Collaboration</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">Limited</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">API Access</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center bg-brand-50 dark:bg-brand-950/40">—</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Workflow Explanation */}
      <section className="py-16">
        <div className="container px-4 mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="brand-card text-center">
              <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Set Up Your Brand</h3>
              <p className="text-muted-foreground">
                Upload brand guidelines, design examples, or input brand rules manually to create your brand profile.
              </p>
            </div>
            <div className="brand-card text-center">
              <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Upload Designs</h3>
              <p className="text-muted-foreground">
                Submit your designs via file upload or through our Figma integration for analysis.
              </p>
            </div>
            <div className="brand-card text-center">
              <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Review Feedback</h3>
              <p className="text-muted-foreground">
                Get detailed feedback on brand compliance issues with specific recommendations for fixes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-gradient text-white">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start perfecting your designs today</h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of designers who have improved their workflow with TailorChecker.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Try For Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;

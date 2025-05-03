"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { appConfig } from "@/config/app";
import {
  Paintbrush,
  LineChart,
  Users,
  Zap,
  Smartphone,
  Upload,
  History,
  Layout,
  CheckCircle,
  FileText,
  Eye,
  Palette,
} from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-base">{description}</CardDescription>
    </CardContent>
  </Card>
);

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: Paintbrush,
      title: "Brand Guideline Management",
      description:
        "Define and manage your brand guidelines in one central place. Set colors, typography, spacing, and other brand elements.",
    },
    {
      icon: Zap,
      title: "Automated Consistency Checks",
      description:
        "Upload designs and automatically check them against your brand guidelines to identify inconsistencies.",
    },
    {
      icon: LineChart,
      title: "Analytics & Insights",
      description:
        "Get detailed reports and analytics on brand consistency across all your designs over time.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Collaborate with your team members, designers, and stakeholders with role-based permissions.",
    },
  ];

  const additionalFeatures = [
    {
      icon: Upload,
      title: "Multiple Upload Options",
      description:
        "Upload designs directly from your computer or import from Figma, Sketch, and other design tools.",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsiveness Check",
      description:
        "Verify that your designs maintain brand consistency across different screen sizes and devices.",
    },
    {
      icon: History,
      title: "Design History",
      description:
        "Keep track of all your design checks and revisions in one place with a complete history log.",
    },
    {
      icon: Layout,
      title: "Layout Analysis",
      description:
        "Check spacing, alignment, and composition against your brand guidelines for consistent layouts.",
    },
    {
      icon: CheckCircle,
      title: "Accessibility Verification",
      description:
        "Ensure your designs meet accessibility standards with color contrast and text size checks.",
    },
    {
      icon: FileText,
      title: "Export Reports",
      description: "Generate and export detailed reports for client presentations or team reviews.",
    },
    {
      icon: Eye,
      title: "Visual Comparison",
      description:
        "Side-by-side comparison of designs against brand guidelines with visual annotations.",
    },
    {
      icon: Palette,
      title: "Color Extraction",
      description:
        "Automatically extract and analyze all colors used in a design to ensure brand compliance.",
    },
  ];

  return (
    <div className="container py-12 md:py-16 space-y-20">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Powerful Features for Brand Consistency
        </h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to maintain perfect brand consistency across all your designs
        </p>
        <div className="pt-6">
          <Button size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </div>

      {/* Main Features Section */}
      <section>
        <div className="grid gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-center">Core Features</h2>
            <p className="text-muted-foreground text-center">
              The foundation of our brand consistency platform
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mainFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section>
        <div className="grid gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-center">
              Additional Capabilities
            </h2>
            <p className="text-muted-foreground text-center">
              Comprehensive tools to enhance your brand management
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/60 rounded-2xl p-8 md:p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to ensure perfect brand consistency?
          </h2>
          <p className="text-muted-foreground">
            Start your free trial today and see how {appConfig.name} can transform your brand
            management process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;

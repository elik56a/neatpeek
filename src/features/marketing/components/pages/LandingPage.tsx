"use client";

import Link from "next/link";
import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, LineChart, Shield, Zap } from "lucide-react";
import { getRegisterUrl } from "@/utils/getAppUrl";

const LandingPage = () => {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Ensure Your Design Meets Your <span className="text-primary">Brand Guidelines</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {appConfig.name} helps design teams maintain consistent branding by automatically
                checking designs against your brand guidelines.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href={getRegisterUrl()}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">See Features</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                How {appConfig.name} Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Our platform simplifies brand consistency across all your designs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="relative overflow-hidden border-0 bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-50"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">1. Set Up Brand Guidelines</h3>
                  <p className="mt-2 text-muted-foreground">
                    Define your brand's colors, typography, spacing, and more in our intuitive
                    platform.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden border-0 bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-50"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">2. Upload Your Design</h3>
                  <p className="mt-2 text-muted-foreground">
                    Simply upload any design file, and our system will analyze it against your
                    guidelines.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden border-0 bg-card">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-50"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">3. Get Actionable Insights</h3>
                  <p className="mt-2 text-muted-foreground">
                    Receive detailed reports on any inconsistencies with specific recommendations
                    for fixes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Maintain Perfect Brand Consistency
              </h2>
              <p className="text-muted-foreground">
                {appConfig.name} helps design teams create cohesive brand experiences that build
                trust and recognition.
              </p>
              <ul className="grid gap-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Reduce design review time by 60%</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Catch inconsistencies before they go public</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Build stronger brand recognition</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Ensure ADA compliance and accessibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Streamline your design workflow</span>
                </li>
              </ul>
              <div className="pt-4">
                <Button asChild>
                  <Link href={getRegisterUrl()}>Start Your Free Trial</Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                <div className="h-full w-full bg-muted/60 flex items-center justify-center">
                  <p className="text-muted-foreground">Product Demo Video</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5 rounded-3xl mx-4 md:mx-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Perfect Your Brand Consistency?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of design teams already using {appConfig.name}
              </p>
            </div>
            <div className="pt-4">
              <Button size="lg" asChild>
                <Link href={getRegisterUrl()}>Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

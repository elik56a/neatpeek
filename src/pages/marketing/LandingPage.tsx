
import { ArrowRight, CheckCircle, LineChart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Keep your designs <span className="hero-text-gradient">perfectly aligned</span> with brand guidelines
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              TailorChecker ensures every pixel in your designs follows your brand
              guidelines. Save time, maintain consistency, and deliver perfect results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">See Features</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-1/3 -left-64 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-64 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </section>

      {/* Product preview section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="bg-card rounded-2xl overflow-hidden shadow-lg border">
            <div className="aspect-video bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <p className="font-medium">Product Preview</p>
                <p className="text-sm opacity-70">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why choose TailorChecker?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform helps design teams work smarter, maintain brand consistency, and deliver polished designs faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="brand-card">
              <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Get real-time feedback on your designs with precise suggestions for improvements.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="brand-card">
              <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Brand Protection</h3>
              <p className="text-muted-foreground">
                Ensure all your designs adhere to brand guidelines before they reach your clients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="brand-card">
              <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
              <p className="text-muted-foreground">
                Track improvement over time with detailed analytics and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to perfect brand compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="brand-card">
              <div className="h-10 w-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Setup your brand</h3>
              <p className="text-muted-foreground">
                Upload your brand guidelines, design samples, or manually input your brand rules.
              </p>
            </div>

            {/* Step 2 */}
            <div className="brand-card">
              <div className="h-10 w-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Check your designs</h3>
              <p className="text-muted-foreground">
                Upload designs or connect to Figma for automatic compliance checking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="brand-card">
              <div className="h-10 w-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Get detailed feedback</h3>
              <p className="text-muted-foreground">
                Receive precise feedback with suggested corrections for perfect brand alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <svg className="h-8 w-8 text-brand-600 dark:text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
            <blockquote className="text-xl md:text-2xl font-medium mb-8">
              "TailorChecker has transformed how our design team works. No more back-and-forth with clients about brand compliance issues. Now we deliver perfect designs, first time, every time."
            </blockquote>
            <div>
              <p className="font-medium">Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">Design Director, Acme Studios</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-brand-gradient text-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to perfect your design workflow?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of designers who've transformed their process with TailorChecker.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features list section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Everything you need for perfect brand compliance</h2>
              <p className="text-muted-foreground mb-8">
                Our comprehensive tools ensure that every design meets your exact brand standards.
              </p>
              <ul className="space-y-4">
                {[
                  "Automatic brand guideline extraction",
                  "Direct Figma integration",
                  "Detailed feedback on design elements",
                  "Color palette compliance checking",
                  "Typography and spacing analysis",
                  "Logo usage verification"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button asChild>
                  <Link to="/features">See all features</Link>
                </Button>
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-6">
              <div className="bg-card rounded-xl border p-4 h-80 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="font-medium">Feature preview image</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

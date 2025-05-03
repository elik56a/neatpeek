"use client";

import { useState } from "react";
import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Info, ArrowRight, CheckCircle2, X, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type BillingInterval = "monthly" | "yearly";

interface Tier {
  name: string;
  id: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
  mostPopular?: boolean;
  buttonText?: string;
}

const tiers: Tier[] = [
  {
    name: "Free",
    id: "free",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "Basic tools for solo designers and small projects.",
    features: [
      "3 design checks per month",
      "Basic brand guidelines",
      "Manual brand settings",
      "1 project",
      "Email support",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    id: "pro",
    priceMonthly: "$29",
    priceYearly: "$249",
    description: "Everything you need for professional design work.",
    features: [
      "Unlimited design checks",
      "Advanced brand guidelines",
      "Figma integration",
      "Up to 5 projects",
      "Priority support",
      "Team collaboration",
    ],
    mostPopular: true,
    stripeMonthlyPriceId: "price_monthly_pro",
    stripeYearlyPriceId: "price_yearly_pro",
    buttonText: "Start Free Trial",
  },
  {
    name: "Business",
    id: "business",
    priceMonthly: "$79",
    priceYearly: "$849",
    description: "Advanced tools for design teams and agencies.",
    features: [
      "Everything in Pro plan",
      "Unlimited projects",
      "Advanced analytics",
      "Custom brand rules",
      "API access",
      "Dedicated support",
      "Team training",
    ],
    stripeMonthlyPriceId: "price_monthly_business",
    stripeYearlyPriceId: "price_yearly_business",
    buttonText: "Contact Sales",
  },
];

const featureComparison = [
  {
    name: "Design Checks",
    free: "3 per month",
    pro: "Unlimited",
    business: "Unlimited",
    icon: "🔍",
  },
  {
    name: "Projects",
    free: "1",
    pro: "Up to 5",
    business: "Unlimited",
    icon: "📁",
  },
  {
    name: "Team Members",
    free: "1",
    pro: "Up to 3",
    business: "Unlimited",
    icon: "👥",
  },
  {
    name: "Figma Integration",
    free: false,
    pro: true,
    business: true,
    icon: "🔌",
  },
  {
    name: "Advanced Brand Guidelines",
    free: false,
    pro: true,
    business: true,
    icon: "📘",
  },
  {
    name: "API Access",
    free: false,
    pro: false,
    business: true,
    icon: "🔑",
  },
  {
    name: "Custom Rules",
    free: false,
    pro: true,
    business: true,
    icon: "⚙️",
  },
  {
    name: "Advanced Analytics",
    free: false,
    pro: false,
    business: true,
    icon: "📊",
  },
  {
    name: "Support",
    free: "Email",
    pro: "Priority",
    business: "Dedicated",
    icon: "🛟",
  },
];

const PricingPage = () => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePriceClick = async (tier: Tier) => {
    if (tier.id === "free") {
      window.location.href = "/register"; // Redirect to register page for free tier
      return;
    }

    const priceId =
      billingInterval === "yearly" ? tier.stripeYearlyPriceId : tier.stripeMonthlyPriceId;

    if (tier.id === "business") {
      toast({
        title: "Contact sales",
        description: "Our sales team will contact you shortly to discuss your needs.",
      });
      return;
    }

    if (!priceId) {
      toast({
        title: "Not available",
        description: "This tier is not available for purchase yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingTier(tier.id);

      toast({
        title: "Processing payment",
        description: "Taking you to our secure checkout page.",
      });

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout error",
        description: "There was a problem creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingTier(null);
    }
  };

  return (
    <div className="container py-12 md:py-24 space-y-16">
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that's right for you and your design workflow
        </p>
      </div>

      <div className="flex justify-center">
        <div className="rounded-full p-1 bg-muted">
          <Tabs
            value={billingInterval}
            onValueChange={v => setBillingInterval(v as BillingInterval)}
            className="relative"
          >
            <TabsList className="rounded-full">
              <TabsTrigger value="monthly" className="rounded-full">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="rounded-full">
                Yearly{" "}
                <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  Save 20%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card
              className={`relative flex h-full flex-col transition-all duration-200 hover:shadow-lg ${tier.mostPopular ? "border-primary shadow-md" : ""}`}
            >
              {tier.mostPopular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <CardHeader className="flex flex-col space-y-1.5">
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      {billingInterval === "monthly" ? tier.priceMonthly : tier.priceYearly}
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      {billingInterval === "monthly" ? "/month" : "/year"}
                    </span>
                  </div>
                  {billingInterval === "yearly" && tier.id !== "free" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {tier.priceMonthly}/mo when billed monthly
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {tier.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePriceClick(tier)}
                  className="w-full group relative overflow-hidden"
                  variant={tier.mostPopular ? "default" : "outline"}
                  disabled={processingTier === tier.id}
                >
                  {processingTier === tier.id ? (
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                        {tier.buttonText || "Get Started"}
                      </span>
                      <span className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:animate-shine" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Compare Plans</h2>

        <div className="overflow-hidden rounded-lg border border-muted shadow-sm">
          <div className="grid grid-cols-4 border-b bg-muted/80">
            <div className="px-6 py-4 text-base font-medium">Features</div>
            <div className="px-6 py-4 text-base font-medium text-center">Free</div>
            <div className="px-6 py-4 text-base font-medium text-center bg-primary/5">Pro</div>
            <div className="px-6 py-4 text-base font-medium text-center">Business</div>
          </div>

          <div className="divide-y">
            {featureComparison.map((feature, i) => (
              <div
                key={i}
                className="grid grid-cols-4 hover:bg-muted/30 transition-colors duration-150"
              >
                <div className="px-6 py-4 text-sm font-medium flex items-center">
                  <span className="mr-2">{feature.icon}</span>
                  {feature.name}
                </div>
                <div className="px-6 py-4 text-sm text-center">
                  {typeof feature.free === "boolean" ? (
                    feature.free ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )
                  ) : (
                    <span className={feature.free === "Email" ? "text-amber-500" : ""}>
                      {feature.free}
                    </span>
                  )}
                </div>
                <div className="px-6 py-4 text-sm text-center bg-primary/5">
                  {typeof feature.pro === "boolean" ? (
                    feature.pro ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )
                  ) : (
                    <span className={feature.pro === "Priority" ? "text-primary font-medium" : ""}>
                      {feature.pro}
                    </span>
                  )}
                </div>
                <div className="px-6 py-4 text-sm text-center">
                  {typeof feature.business === "boolean" ? (
                    feature.business ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    )
                  ) : (
                    <span
                      className={
                        feature.business === "Dedicated" ? "text-indigo-500 font-medium" : ""
                      }
                    >
                      {feature.business}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Need a custom plan?</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          We offer custom plans for larger teams and enterprise organizations. Contact our sales
          team to discuss your specific needs.
        </p>
        <Button className="transition-all duration-300 hover:shadow-lg">
          Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PricingPage;

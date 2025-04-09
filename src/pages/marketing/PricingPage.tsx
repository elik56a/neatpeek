
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link  from "next/link";

const tiers = [
  {
    name: "Starter",
    id: "tier-starter",
    price: { monthly: "$29", annually: "$290" },
    description: "Perfect for freelancers and small design teams.",
    features: [
      "3 brand profiles",
      "100 design checks per month",
      "Basic feedback",
      "Image uploads only",
      "Email support",
    ],
    cta: "Start with Starter",
    mostPopular: false,
  },
  {
    name: "Professional",
    id: "tier-professional",
    price: { monthly: "$79", annually: "$790" },
    description: "Ideal for growing design studios and agencies.",
    features: [
      "10 brand profiles",
      "500 design checks per month",
      "Advanced feedback with coordinates",
      "Figma integration",
      "Priority support",
      "Custom brand rules",
      "Analytics dashboard",
    ],
    cta: "Start with Pro",
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    price: { monthly: "$199", annually: "$1,990" },
    description: "For large design teams with complex requirements.",
    features: [
      "Unlimited brand profiles",
      "Unlimited design checks",
      "Expert feedback with solutions",
      "Full Figma integration with comments",
      "Dedicated support",
      "Custom API access",
      "Advanced analytics and reporting",
      "Team collaboration tools",
      "White labeling",
    ],
    cta: "Contact Sales",
    mostPopular: false,
  },
];

const features = [
  {
    name: "Brand Profiles",
    tiers: {
      Starter: "3",
      Professional: "10",
      Enterprise: "Unlimited",
    },
  },
  {
    name: "Design Checks / Month",
    tiers: {
      Starter: "100",
      Professional: "500",
      Enterprise: "Unlimited",
    },
  },
  {
    name: "Feedback Detail Level",
    tiers: {
      Starter: "Basic",
      Professional: "Advanced",
      Enterprise: "Expert",
    },
  },
  {
    name: "Figma Integration",
    tiers: {
      Starter: "—",
      Professional: "Basic",
      Enterprise: "Advanced",
    },
  },
  {
    name: "Custom Brand Rules",
    tiers: {
      Starter: "—",
      Professional: "✓",
      Enterprise: "✓",
    },
  },
  {
    name: "Analytics Dashboard",
    tiers: {
      Starter: "—",
      Professional: "Basic",
      Enterprise: "Advanced",
    },
  },
  {
    name: "Team Members",
    tiers: {
      Starter: "1",
      Professional: "5",
      Enterprise: "Unlimited",
    },
  },
  {
    name: "Support Level",
    tiers: {
      Starter: "Email",
      Professional: "Priority",
      Enterprise: "Dedicated",
    },
  },
  {
    name: "API Access",
    tiers: {
      Starter: "—",
      Professional: "—",
      Enterprise: "✓",
    },
  },
  {
    name: "White Labeling",
    tiers: {
      Starter: "—",
      Professional: "—",
      Enterprise: "✓",
    },
  },
];

const PricingPage = () => {
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for your design workflow
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "rounded-2xl border shadow-sm p-6",
                tier.mostPopular
                  ? "border-brand-500 dark:border-brand-500"
                  : "border-border"
              )}
            >
              <div className="flex flex-col h-full">
                <div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  {tier.mostPopular && (
                    <div className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-300 mt-2">
                      Most popular
                    </div>
                  )}
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price.monthly}</span>
                    <span className="text-sm text-muted-foreground ml-2">per month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon className="h-4 w-4 text-brand-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    className={cn(
                      "w-full",
                      tier.mostPopular
                        ? "bg-brand-gradient hover:opacity-90"
                        : ""
                    )}
                    variant={tier.mostPopular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/register">{tier.cta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-8 text-center">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-left">Feature</th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      className={cn(
                        "py-4 px-6 text-center",
                        tier.mostPopular
                          ? "bg-brand-50 dark:bg-brand-950/40"
                          : "bg-transparent"
                      )}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={feature.name} className={i % 2 === 0 ? "bg-muted/50" : ""}>
                    <td className="py-4 px-6 text-sm font-medium">{feature.name}</td>
                    <td className={cn("py-4 px-6 text-center text-sm", tiers[0].mostPopular ? "bg-brand-50 dark:bg-brand-950/40" : "")}>
                      {feature.tiers.Starter}
                    </td>
                    <td className={cn("py-4 px-6 text-center text-sm", tiers[1].mostPopular ? "bg-brand-50 dark:bg-brand-950/40" : "")}>
                      {feature.tiers.Professional}
                    </td>
                    <td className={cn("py-4 px-6 text-center text-sm", tiers[2].mostPopular ? "bg-brand-50 dark:bg-brand-950/40" : "")}>
                      {feature.tiers.Enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Have more questions? <a href="#" className="text-brand-600 dark:text-brand-400 underline">Contact us</a>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="brand-card">
              <h3 className="text-lg font-medium mb-2">Can I switch plans later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected on your next billing cycle.
              </p>
            </div>
            
            <div className="brand-card">
              <h3 className="text-lg font-medium mb-2">Do you offer annual discounts?</h3>
              <p className="text-muted-foreground">
                Yes, you save 15% when paying annually for any of our plans.
              </p>
            </div>
            
            <div className="brand-card">
              <h3 className="text-lg font-medium mb-2">What happens if I exceed my design checks limit?</h3>
              <p className="text-muted-foreground">
                You can purchase additional design checks or upgrade to a higher tier plan with more included checks.
              </p>
            </div>
            
            <div className="brand-card">
              <h3 className="text-lg font-medium mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day free trial on all plans with no credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

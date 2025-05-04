"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, Mail } from "lucide-react";
import { appConfig } from "@/config/app";

const FaqPage = () => {
  const faqs = [
    {
      question: `What file formats does ${appConfig.name} support?`,
      answer: `${appConfig.name} supports all major design file formats including PNG, JPG, SVG, PSD, AI, and Figma designs. For Figma designs, you can either import them directly through our Figma plugin or export them and upload to our platform.`,
    },
    {
      question: `How accurate is ${appConfig.name} at detecting brand inconsistencies?`,
      answer: `Our system has a 99% accuracy rate for detecting color, typography, and spacing inconsistencies based on your defined brand guidelines. For more complex elements like logo usage or layout, we provide both automated checks and tools to make manual verification simpler.`,
    },
    {
      question: `Can I customize what brand elements are checked?`,
      answer: `Absolutely. ${appConfig.name} allows you to define which brand elements are critical for your organization. You can set different severity levels for different checks, allowing you to focus on what matters most for your brand consistency.`,
    },
    {
      question: `How does the team collaboration feature work?`,
      answer: `Our Professional and Enterprise plans include team collaboration features that allow multiple team members to access the same brand guidelines and design checks. You can assign different roles and permissions to team members, add comments to specific checks, and track changes over time.`,
    },
    {
      question: `Is there an API available for integration with our existing tools?`,
      answer: `Yes, our Enterprise plan includes API access that allows you to integrate ${appConfig.name} with your existing design and development workflows. This enables automated checks as part of your CI/CD pipeline or integration with your DAM system.`,
    },
    {
      question: `Can ${appConfig.name} check designs against accessibility guidelines?`,
      answer: `Yes, ${appConfig.name} can verify that your designs meet accessibility guidelines including WCAG 2.1 criteria for color contrast, text size, and other important accessibility factors. This helps ensure your designs are not only brand consistent but also accessible to all users.`,
    },
    {
      question: `How long does the free trial last?`,
      answer: `Our free trial lasts for 14 days and includes access to all features in the Professional plan. No credit card is required to start your trial, and you can upgrade to a paid plan at any time.`,
    },
    {
      question: `Can I export reports of brand consistency checks?`,
      answer: `Yes, ${appConfig.name} allows you to export detailed reports in PDF or CSV format. These reports can be shared with stakeholders or clients to demonstrate brand compliance or highlight areas that need improvement.`,
    },
  ];

  return (
    <div className="container py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about {appConfig.name}
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Still have questions?
            </CardTitle>
            <CardDescription>
              Check out our detailed documentation for more information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Visit Knowledge Base</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>Our support team is here to help with any questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Send a Message</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaqPage;

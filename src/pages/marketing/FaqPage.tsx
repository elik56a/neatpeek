
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is TailorChecker?",
    answer:
      "TailorChecker is a design compliance platform that helps teams ensure their designs adhere to brand guidelines. It analyzes designs, provides feedback on inconsistencies, and helps maintain brand integrity across all design assets.",
  },
  {
    question: "How does TailorChecker work?",
    answer:
      "TailorChecker works in three simple steps: 1) You set up your brand by uploading brand guidelines, example designs, or manually entering brand rules. 2) Upload your designs or connect to Figma for analysis. 3) Receive detailed feedback on what elements need adjustment to match your brand guidelines.",
  },
  {
    question: "Do I need to be a designer to use TailorChecker?",
    answer:
      "No, TailorChecker is designed to be user-friendly for both designers and non-designers. Design managers, brand managers, and marketing teams can all benefit from using our platform to ensure brand consistency.",
  },
  {
    question: "What file formats can I upload for checking?",
    answer:
      "TailorChecker supports common design formats including PNG, JPG, PDF, and AI files. You can also connect directly to Figma to check designs without exporting them.",
  },
  {
    question: "How accurate is the design analysis?",
    answer:
      "Our AI-powered analysis achieves high accuracy in detecting brand inconsistencies. The system continuously improves with use as it learns more about your specific brand guidelines and preferences.",
  },
  {
    question: "Can I check multiple designs at once?",
    answer:
      "Yes, you can batch upload multiple designs for checking. This is especially useful for reviewing entire campaigns or projects at once.",
  },
  {
    question: "How does the Figma integration work?",
    answer:
      "Our Figma integration allows you to select frames or artboards directly in Figma. TailorChecker then analyzes these designs and can place comments directly on the Figma file pointing out areas that need adjustment.",
  },
  {
    question: "Can I have multiple brand profiles?",
    answer:
      "Yes, depending on your plan, you can set up multiple brand profiles. This is perfect for agencies working with multiple clients or companies with sub-brands.",
  },
  {
    question: "How long does it take to check a design?",
    answer:
      "Most designs are analyzed within seconds. Complex designs or large batches may take a minute or two. You'll receive immediate notifications when your analysis is complete.",
  },
  {
    question: "Can I customize the rules for my brand?",
    answer:
      "Absolutely! In addition to automatically extracting rules from your brand guidelines, you can add custom rules and preferences to fine-tune the analysis to your specific needs.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security seriously. All uploads are encrypted, and we never share your designs or brand guidelines with third parties. You can delete your data at any time.",
  },
  {
    question: "Do you offer enterprise solutions?",
    answer:
      "Yes, our Enterprise plan includes advanced features like API access, white labeling, unlimited users, and dedicated support. Contact our sales team for custom enterprise solutions.",
  },
];

const FaqPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about TailorChecker
        </p>
      </div>

      <Accordion type="single" collapsible className="mb-12">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-8">
          Our team is here to help with any additional questions you might have.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild>
            <a href="mailto:support@tailorchecker.com">Contact Support</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/register">Try It Free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;


"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Check, ArrowRight, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  brandName?: string;
  primaryColor?: string;
  primaryFont?: string;
  nextStep?: {
    text: string;
    href: string;
  };
}

const CompletionModal = ({
  isOpen,
  onClose,
  title,
  description,
  brandName,
  primaryColor,
  primaryFont,
  nextStep
}: CompletionModalProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const circleVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const checkVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        delay: 0.4,
        duration: 0.5
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-6">
          <motion.div 
            className="relative h-24 w-24"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center"
              variants={circleVariants}
            >
              <svg
                className="h-12 w-12 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  variants={checkVariants}
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {brandName && (
            <motion.div 
              className="flex items-center justify-between border rounded-lg p-3"
              variants={itemVariants}
            >
              <span className="text-sm font-medium">Brand Name</span>
              <span className="text-sm">{brandName}</span>
            </motion.div>
          )}
          
          {primaryColor && (
            <motion.div 
              className="flex items-center justify-between border rounded-lg p-3"
              variants={itemVariants}
            >
              <span className="text-sm font-medium">Primary Color</span>
              <div className="flex items-center gap-2">
                <div 
                  className="h-4 w-4 rounded-full" 
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-sm">{primaryColor}</span>
              </div>
            </motion.div>
          )}
          
          {primaryFont && (
            <motion.div 
              className="flex items-center justify-between border rounded-lg p-3"
              variants={itemVariants}
            >
              <span className="text-sm font-medium">Primary Font</span>
              <span className="text-sm">{primaryFont}</span>
            </motion.div>
          )}
        </motion.div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {nextStep && (
            <Button asChild>
              <Link href={nextStep.href}>
                {nextStep.text} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionModal;

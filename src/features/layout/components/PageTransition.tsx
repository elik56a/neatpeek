"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    // Skip animation on first render
    setIsFirstRender(false);
  }, []);

  const variants = {
    hidden: { opacity: 0.8, x: 5 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0.8, x: -5 },
  };

  return (
    <motion.div
      key={pathname}
      initial={isFirstRender ? "enter" : "hidden"}
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ type: "tween", duration: 0.15 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
    hidden: { opacity: 0, x: 10 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  return (
    <motion.div
      key={pathname}
      initial={isFirstRender ? "enter" : "hidden"}
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

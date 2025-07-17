import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is this project about?</AccordionTrigger>
        <AccordionContent>
          This is a full-stack project using npm, pip, Python, and TypeScript.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I get started?</AccordionTrigger>
        <AccordionContent>
          Install the dependencies and follow the setup instructions.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-3">
        <AccordionTrigger>What technologies are used?</AccordionTrigger>
        <AccordionContent>
          We use React, TypeScript, Tailwind CSS, and Radix UI components.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FAQSection;
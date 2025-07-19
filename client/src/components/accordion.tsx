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
        <AccordionTrigger value="item-1">What is this project about?</AccordionTrigger>
        <AccordionContent value="item-1">
          This is a full-stack project using npm, pip, Python, and TypeScript.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-2">
        <AccordionTrigger value="item-2">How do I get started?</AccordionTrigger>
        <AccordionContent value="item-2">
          Install the dependencies and follow the setup instructions.
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="item-3">
        <AccordionTrigger value="item-3">What technologies are used?</AccordionTrigger>
        <AccordionContent value="item-3">
          We use React, TypeScript, Tailwind CSS, and Radix UI components.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FAQSection;
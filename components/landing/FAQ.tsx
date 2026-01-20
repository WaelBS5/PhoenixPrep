"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What does Phoenix Prep actually generate?",
    answer:
      "A pre-call brief: account snapshot, tech stack, sales plays, discovery questions, recommended next steps, etc.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Phoenix Prep uses HG Insights MCP, then turns signals into talk tracks and questions for the call.",
  },
  {
    question: "Can I refine the brief with AI?",
    answer:
      "Yes, you can ask questions you're unsure about and Phoenix Prep updates the brief live.",
  },
  {
    question: "Can I export this and use it right before the meeting?",
    answer:
      "Yes, you can download the brief and skim it before joining the call.",
  },
];


const FAQ = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Phoenix Prep.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="card-teal rounded-2xl px-6 border-none"
              >
                <AccordionTrigger className="text-left font-semibold py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

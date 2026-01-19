"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What data do you use?",
    answer:
      "Phoenix Prep aggregates publicly available data from company websites, job postings, news articles, and other open sources. We don't access any private or proprietary information.",
  },
  {
    question: "How fresh is the data?",
    answer:
      "Our data is continuously refreshed from multiple sources. For most accounts, you'll get information that's been updated within the past 30 days.",
  },
  {
    question: "Can I customize the output?",
    answer:
      "Absolutely. You can ask Phoenix for specific types of intelligence — tech stack deep-dives, competitive angles, discovery questions, or whatever your prep needs. Just ask naturally.",
  },
  {
    question: "Is this a full AI agent?",
    answer:
      "Phoenix Prep is designed specifically for pre-sales prep. It's not a general-purpose AI agent — it's focused on giving you actionable sales intelligence quickly and reliably.",
  },
  {
    question: "Can I share briefs with my team?",
    answer:
      "Yes! Every prep brief can be exported and shared with teammates. Great for coordinating before important calls or handing off accounts.",
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

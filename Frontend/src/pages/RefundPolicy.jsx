import React from "react";
import { motion } from "framer-motion";
import AnimatedBrand from "../../src/components/common/AnimatedBrand";

const refundData = {
  lastUpdated: "November 25, 2024"
};

const sections = [
  {
    title: "Refund Policy",
    content: `
<strong>Last updated: ${refundData.lastUpdated}</strong><br><br>

<strong>No Return & No Exchange Policy (Customized Orders)</strong><br>
We offer no return or exchange on customized or personalized products, as each item is made uniquely for you. Once an order is placed, it cannot be cancelled, returned, or exchanged under any circumstances.<br><br>

However, if your product arrives damaged, defective, or incorrect, please contact us immediately so we can resolve the issue.
    `
  },
  {
    title: "Damages and Issues",
    content: `
Please inspect your order upon delivery. If you receive a damaged, defective, or wrong item, contact us right away at made4uu.store@gmail.com with photos or videos. We will review the issue and provide a suitable resolution.
    `
  },
  {
    title: "Exceptions / Non-Returnable Items",
    content: `
We do not accept returns for the following:<br><br>

• Customized / Personalized products<br>
• Sale items<br>
• Gift cards<br>
• Used or unboxed items<br>
• Damaged items not reported upon delivery
    `
  },
  {
    title: "Support",
    content: `
For any concerns or questions, feel free to reach us at:<br><br>

📧 made4uu.store@gmail.com<br><br>

We're here to help with any order-related queries.
    `
  }
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 py-16 px-4">

      {/* HERO */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto text-center mb-24"
      >
        <motion.div variants={fadeUp}>
          <AnimatedBrand />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-6xl font-bold text-indigo-600 mt-6"
        >
          Refund Policy
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-4 text-sm text-gray-400">
          Last updated: {refundData.lastUpdated}
        </motion.p>
      </motion.section>

      {/* SINGLE COLUMN */}
      <section className="max-w-4xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="font-bold text-xl mb-4 text-gray-900">
                {section.title}
              </h3>

              <div
                className="text-gray-700 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}

export default RefundPolicy;


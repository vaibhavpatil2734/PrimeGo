import React from "react";
import { motion } from "framer-motion";
import AnimatedBrand from "../../src/components/common/AnimatedBrand";

const shippingData = {
  lastUpdated: "December 2024"
};

const sections = [
  {
    title: "Shipping Policy",
    content: `
<strong>Last updated: ${shippingData.lastUpdated}</strong><br><br>

Once your order is placed, you will receive a confirmation email. Your order will be shipped within 3–4 days, and you will get all shipment updates regularly. If you have any questions, feel free to contact us at <strong>+91 85520 62200</strong> via call or WhatsApp.
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

function ShippingPolicy() {
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
          Shipping Policy
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-4 text-sm text-gray-400">
          Last updated: {shippingData.lastUpdated}
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

export default ShippingPolicy;


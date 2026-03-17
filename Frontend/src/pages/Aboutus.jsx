import React from "react";
import { motion } from "framer-motion";
import AnimatedBrand from "../components/common/AnimatedBrand";

const aboutData = {
  description:
    "Modern e-commerce platform for fashion, electronics & home essentials with secure checkout & fast delivery.",
  mission:
    "Our mission is to make online shopping accessible, affordable, tailored just for you because every product is made4UU.",
  founded: "2025",
  tagline: "Shopping made personal, just for U.",
  team: [
    {
      name: "John Doe",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "15+ years in e-commerce innovation",
    },
    {
      name: "Jane Smith",
      role: "CTO & Lead Developer",
      image:
        "https://media.istockphoto.com/id/2165425195/photo/portrait-of-a-man-in-an-office.jpg?s=1024x1024&w=is&k=20&c=tl5FUJDIyFjdvygEKHDPXKhvPq-_PSjfK35SRtdTq7I=",
      bio: "Full-stack expert specializing in MERN",
    },
    {
      name: "Mike Johnson",
      role: "Head of Operations",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Logistics & supply chain specialist",
    },
  ],
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Aboutus() {
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

        <motion.p
          variants={fadeUp}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
        >
          {aboutData.description}
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-3 text-sm text-gray-500 italic"
        >
          {aboutData.tagline}
        </motion.p>
      </motion.section>

      {/* MISSION */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="max-w-4xl mx-auto text-center mb-28"
      >
        <div className="bg-white/80 backdrop-blur-md p-10 md:p-14 rounded-3xl shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            {aboutData.mission}
          </p>

          <p className="text-gray-600">
            Founded in{" "}
            <span className="font-bold text-blue-600">{aboutData.founded}</span>,
            we deliver exceptional shopping experiences built for today's
            customers.
          </p>
        </div>
      </motion.section>

      {/* TEAM */}
      <section className="max-w-6xl mx-auto mb-28">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16"
        >
          Meet Our Team
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-10"
        >
          {aboutData.team.map((member, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              whileHover={{ y: -10, scale: 1.03 }}
              className="text-center bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg mb-6 border-4 border-white"
              />

              <h3 className="text-xl font-bold text-gray-900">
                {member.name}
              </h3>

              <p className="text-blue-600 font-semibold mb-3">
                {member.role}
              </p>

              <p className="text-gray-600 text-sm">{member.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto text-center"
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-12 md:p-16 border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to experience Made4UU?
          </h2>

          <p className="text-lg md:text-xl mb-10 text-gray-600">
            Join thousands of happy customers and discover products made just
            for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="/products"
              className="bg-blue-600 text-white px-10 py-4 font-semibold rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-md"
            >
              Shop Now
            </a>

            <a
              href="/contact"
              className="border border-blue-600 text-blue-600 px-10 py-4 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
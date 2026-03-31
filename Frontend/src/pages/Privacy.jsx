import React from "react";
import { motion } from "framer-motion";
import AnimatedBrand from "../../src/components/common/AnimatedBrand";

const privacyData = {
  lastUpdated: "November 25, 2025"
};

const sections = [
  {
    title: "Privacy Policy",
    content: `
<strong>Last updated: November 25, 2025</strong><br><br>

MADE4UU operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). MADE4UU is powered by Shopify, which enables us to provide the Services to you. This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.<br><br>

Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.
    `
  },
  {
    title: "Personal Information We Collect or Process",
    content: `
When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, including inferences drawn from this personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:<br><br>

• Contact details including your name, address, billing address, shipping address, phone number, and email address.<br>
• Financial information including credit card, debit card, and financial account numbers, payment card information, financial account information, transaction details, form of payment, payment confirmation and other payment details.<br>
• Account information including your username, password, security questions, preferences and settings.<br>
• Transaction information including the items you view, put in your cart, add to your wishlist, or purchase, return, exchange or cancel and your past transactions.<br>
• Communications with us including the information you include in communications with us, for example, when sending a customer support inquiry.<br>
• Device information including information about your device, browser, or network connection, your IP address, and other unique identifiers.<br>
• Usage information including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.
    `
  },
  {
    title: "Personal Information Sources",
    content: `
We may collect personal information from the following sources:<br><br>

• Directly from you including when you create an account, visit or use the Services, communicate with us, or otherwise provide us with your personal information;<br>
• Automatically through the Services including from your device when you use our products or services or visit our websites, and through the use of cookies and similar technologies;<br>
• From our service providers including when we engage them to enable certain technology and when they collect or process your personal information on our behalf;<br>
• From our partners or other third parties.
    `
  },
  {
    title: "How We Use Your Personal Information",
    content: `
Depending on how you interact with us or which of the Services you use, we may use personal information for the following purposes:<br><br>

<strong>Provide, Tailor, and Improve the Services.</strong> We use your personal information to provide you with the Services, including to perform our contract with you, to process your payments, to fulfill your orders, to remember your preferences and items you are interested in, to send notifications to you related to your account, to process purchases, returns, exchanges or other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, to facilitate any returns and exchanges, to enable you to post reviews, and to create a customized shopping experience for you, such as recommending products related to your purchases. This may include using your personal information to better tailor and improve the Services.<br><br>

<strong>Marketing and Advertising.</strong> We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you online advertisements for products or services on the Services or other websites, including based on items you previously have purchased or added to your cart and other activity on the Services.<br><br>

<strong>Security and Fraud Prevention.</strong> We use your personal information to authenticate your account, to provide a secure payment and shopping experience, detect, investigate or take action regarding possible fraudulent, illegal, unsafe, or malicious activity, protect public safety, and to secure our services. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password or other access details with anyone else.<br><br>

<strong>Communicating with You.</strong> We use your personal information to provide you with customer support, to be responsive to you, to provide effective services to you and to maintain our business relationship with you.<br><br>

<strong>Legal Reasons.</strong> We use your personal information to comply with applicable law or respond to valid legal process, including requests from law enforcement or government agencies, to investigate or participate in civil discovery, potential or actual litigation, or other adversarial legal proceedings, and to enforce or investigate potential violations of our terms or policies.
    `
  },
  {
    title: "How We Disclose Personal Information",
    content: `
In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:<br><br>

• With Shopify, vendors and other third parties who perform services on our behalf (e.g. IT management, payment processing, data analytics, customer support, cloud storage, fulfillment and shipping).<br>
• With business and marketing partners to provide marketing services and advertise to you. For example, we use Shopify to support personalized advertising with third-party services based on your online activity with different merchants and websites. Our business and marketing partners will use your information in accordance with their own privacy notices. Depending on where you reside, you may have a right to direct us not to share information about you to show you targeted advertisements and marketing based on your online activity with different merchants and websites.<br>
• When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship you products or through your use of social media widgets or login integrations.<br>
• With our affiliates or otherwise within our corporate group.<br>
• In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service or policies, and to protect or defend the Services, our rights, and the rights of our users or others.
    `
  },
  {
    title: "Relationship with Shopify",
    content: `
The Services are hosted by Shopify, which collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in countries other than where you reside, in order to provide and improve the Services for you. In addition, to help protect, grow, and improve our business, we use certain Shopify enhanced features that incorporate data and information obtained from your interactions with our Store, along with other merchants and with Shopify. To provide these enhanced features, Shopify may make use of personal information collected about your interactions with our store, along with other merchants, and with Shopify. In these circumstances, Shopify is responsible for the processing of your personal information, including for responding to your requests to exercise your rights over use of your personal information for these purposes. To learn more about how Shopify uses your personal information and any rights you may have, you can visit the <a href="https://privacy.shopify.com/en">Shopify Consumer Privacy Policy</a>. Depending on where you live, you may exercise certain rights with respect to your personal information here <a href="https://privacy.shopify.com/en">Shopify Privacy Portal Link</a>.
    `
  },
  {
    title: "Third Party Websites and Links",
    content: `
The Services may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.
    `
  },
  {
    title: "Children's Data",
    content: `
The Services are not intended to be used by children, and we do not knowingly collect any personal information about children under the age of majority in your jurisdiction. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted. As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we "share" or "sell" (as those terms are defined in applicable law) personal information of individuals under 16 years of age.
    `
  },
  {
    title: "Security and Retention of Your Information",
    content: `
Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee "perfect security." In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.<br><br>

How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide you with Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
    `
  },
  {
    title: "Your Rights and Choices",
    content: `
Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law.<br><br>

<strong>Right to Access / Know.</strong> You may have a right to request access to personal information that we hold about you.<br>
<strong>Right to Delete.</strong> You may have a right to request that we delete personal information we maintain about you.<br>
<strong>Right to Correct.</strong> You may have a right to request that we correct inaccurate personal information we maintain about you.<br>
<strong>Right of Portability.</strong> You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.<br>
<strong>Managing Communication Preferences.</strong> We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or orders that you have made.<br><br>

You may exercise any of these rights where indicated on the Services or by contacting us using the contact details provided below. To learn more about how Shopify uses your personal information and any rights you may have, including rights related to data processed by Shopify, you can visit <a href="https://privacy.shopify.com/en">https://privacy.shopify.com/en</a>.<br><br>

We will not discriminate against you for exercising any of these rights. We may need to verify your identity before we can process your requests, as permitted or required under applicable law. In accordance with applicable laws, you may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.
    `
  },
  {
    title: "Complaints",
    content: `
If you have complaints about how we process your personal information, please contact us using the contact details provided below. Depending on where you live, you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority.
    `
  },
  {
    title: "International Transfers",
    content: `
Please note that we may transfer, store and process your personal information outside the country you live in.<br><br>

If we transfer your personal information out of the European Economic Area or the United Kingdom, we will rely on recognized transfer mechanisms like the European Commission's Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.
    `
  },
  {
    title: "Changes to This Privacy Policy",
    content: `
We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on this website, update the "Last updated" date and provide notice as required by applicable law.
    `
  },
  {
    title: "Contact",
    content: `
Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please call or email us at <strong>made4uu.store@gmail.com</strong> or contact us at <strong>Yash Car Accessories Taware Colony Parvati Paytha, Panchashil niwas villa no2, Pune, MH, 411009, IN</strong>
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

function Privacy() {
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
          Privacy Policy
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-4 text-sm text-gray-400">
          Last updated: {privacyData.lastUpdated}
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

export default Privacy;
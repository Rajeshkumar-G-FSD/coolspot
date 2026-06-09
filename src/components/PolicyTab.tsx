/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, FileText, XCircle, RefreshCw } from "lucide-react";

export type PolicyType = "privacy" | "terms" | "cancellation" | "refund";

interface PolicyTabProps {
  policyType: PolicyType;
}

const POLICIES = {
  privacy: {
    icon: ShieldCheck,
    color: "text-blue-500",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your personal information",
    sections: [
      {
        heading: "Information We Collect",
        content:
          "We collect personal information you provide when making a booking — including your name, email address, phone number, and payment details. We may also collect device and usage information when you visit our website.",
      },
      {
        heading: "How We Use Your Information",
        content:
          "Your information is used to process and confirm bookings, communicate regarding your stay, send booking confirmations and invoices, and improve our services. We do not sell your personal information to third parties.",
      },
      {
        heading: "Data Security",
        content:
          "We take appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All sensitive data is handled securely.",
      },
      {
        heading: "Data Sharing",
        content:
          "We do not share your personal data with third parties except where required by law, or with service providers directly involved in processing your booking (e.g., payment processors).",
      },
      {
        heading: "Cookies",
        content:
          "Our website may use cookies to enhance your browsing experience. You may choose to disable cookies in your browser settings, though this may affect some functionality.",
      },
      {
        heading: "Your Rights",
        content:
          "You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, contact us at Coolspotcottage@gmail.com.",
      },
      {
        heading: "Contact",
        content:
          "For privacy-related queries, contact us at Coolspotcottage@gmail.com or call +91 70103 95526.",
      },
    ],
  },
  terms: {
    icon: FileText,
    color: "text-indigo-500",
    title: "Terms & Conditions",
    subtitle: "Please read these terms carefully before making a booking",
    sections: [
      {
        heading: "Booking Confirmation",
        content:
          "A booking is confirmed only upon receipt of advance payment and written/WhatsApp confirmation from Cool Spot Cottages. Verbal bookings are not guaranteed.",
      },
      {
        heading: "Check-in & Check-out",
        content:
          "Standard check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available subject to room availability and at additional charges.",
      },
      {
        heading: "Maximum Occupancy",
        content:
          "Each room accommodates a maximum of 3 adults. Extra guests beyond the stated occupancy may incur additional charges or may be denied entry at the management's discretion.",
      },
      {
        heading: "House Rules",
        content:
          "Guests must comply with all house rules including quiet hours (11:00 PM – 6:00 AM), no smoking indoors, no unauthorized parties, and respectful behaviour towards staff and other guests.",
      },
      {
        heading: "Guest Responsibility",
        content:
          "Guests are responsible for any damage caused to the property, fixtures, or equipment during their stay. Damage costs will be charged at applicable repair or replacement rates.",
      },
      {
        heading: "Liability",
        content:
          "Cool Spot Cottages is not liable for loss, theft, or damage to personal belongings. Guests are advised to keep valuables safely. The management's decision on all disputes shall be final.",
      },
      {
        heading: "Right to Refuse Service",
        content:
          "Management reserves the right to refuse accommodation or to ask guests to leave the premises in case of misconduct, violation of house rules, or non-payment.",
      },
    ],
  },
  cancellation: {
    icon: XCircle,
    color: "text-red-500",
    title: "Cancellation Policy",
    subtitle: "Our cancellation terms and how they apply to your booking",
    sections: [
      {
        heading: "Free Cancellation Window",
        content:
          "Cancellations made 20 or more days before the check-in date are eligible for a full refund of the advance amount or total amount paid. No cancellation fee applies.",
      },
      {
        heading: "Late Cancellation (Within 20 Days)",
        content:
          "Cancellations made within 20 days of the check-in date may not be eligible for a refund. The advance amount paid may be forfeited as a cancellation fee.",
      },
      {
        heading: "No-Show Policy",
        content:
          "In the event of a no-show without prior cancellation notice, the full booking amount may be charged. No refund will be issued for no-shows.",
      },
      {
        heading: "How to Cancel",
        content:
          "To cancel a booking, contact us via WhatsApp (+91 70103 95526) or email (Coolspotcottage@gmail.com) with your booking reference number. Cancellation is confirmed only upon acknowledgement from our team.",
      },
      {
        heading: "Date Change Requests",
        content:
          "Date changes are subject to room availability. If a date change request is made within 20 days of the original check-in, it may be treated as a cancellation and re-booking.",
      },
      {
        heading: "Special Circumstances",
        content:
          "In cases of genuine emergencies (medical, natural calamities, government-imposed travel restrictions), we may offer date changes or partial refunds at our discretion. Please contact us as soon as possible with supporting documentation.",
      },
    ],
  },
  refund: {
    icon: RefreshCw,
    color: "text-green-500",
    title: "Refund Policy",
    subtitle: "How and when refunds are processed after cancellation",
    sections: [
      {
        heading: "Refund Eligibility",
        content:
          "Refunds are issued when a cancellation is made 20 or more days before the check-in date, or in the event of an overbooking or room unavailability caused by Cool Spot Cottages.",
      },
      {
        heading: "Refund Processing Time",
        content:
          "Eligible refunds will be processed within 5–7 business days from the date of cancellation confirmation. The amount will be credited to the original payment method used.",
      },
      {
        heading: "Full Refund",
        content:
          "If you paid in full or paid an advance and cancel within the eligible window (20+ days before check-in), the entire amount will be refunded without any deductions.",
      },
      {
        heading: "Non-Refundable Scenarios",
        content:
          "Refunds will NOT be issued for: cancellations within 20 days of check-in; no-shows; early departures after check-in has commenced; or violations of house rules leading to eviction.",
      },
      {
        heading: "Advance Payment Refunds",
        content:
          "If you paid an advance to hold your booking and cancel within the eligible window, the full advance amount will be refunded. No service charges will be deducted.",
      },
      {
        heading: "Refund Queries",
        content:
          "For refund-related queries or disputes, contact us at Coolspotcottage@gmail.com or WhatsApp +91 70103 95526 with your booking ID and payment proof.",
      },
    ],
  },
};

export default function PolicyTab({ policyType }: PolicyTabProps) {
  const policy = POLICIES[policyType];
  const Icon = policy.icon;

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#08151f] pt-20">
      {/* Header */}
      <section className="py-14 bg-[#001a52] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-amber-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-headline-lg text-4xl md:text-5xl mb-4"
          >
            {policy.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm max-w-xl mx-auto"
          >
            {policy.subtitle}
          </motion.p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 md:px-16 py-14 space-y-5">
        {policy.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#001a52]/8 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-[#001a52] dark:text-[#819ae7] mt-0.5">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#001a52] dark:text-[#dbe1ff] mb-2 uppercase tracking-wide">
                  {section.heading}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="text-center pt-4 border-t border-slate-100 dark:border-white/5">
          <p className="text-[11px] text-slate-400">
            Last updated: June 2026 &nbsp;·&nbsp; Cool Spot Cottages, Ooty, Tamil Nadu
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Questions? Contact us at{" "}
            <a href="mailto:Coolspotcottage@gmail.com" className="text-[#001a52] dark:text-[#819ae7] hover:underline">
              Coolspotcottage@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Headphones,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Contact Us | DeWiN - DeWiN Solutions",
  description: "Get in touch with DeWiN Solutions for all your digital solution needs",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#1E2260] py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact DeWiN Solutions
            </h1>
            <p className="text-xl text-gray-300">
              We're here to help! Reach out to us for any inquiries about our digital solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-14 h-14 rounded-xl bg-[#1E2260]/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-[#1E2260]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Numbers</h3>
              <div className="space-y-1">
                <a href="tel:+919999999999" className="block text-gray-600 hover:text-[#1E2260]">
                  +91 99999 99999
                </a>
                <a href="tel:+919999999998" className="block text-gray-600 hover:text-[#1E2260]">
                  +91 99999 99998
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-14 h-14 rounded-xl bg-[#1E2260]/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-[#1E2260]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Addresses</h3>
              <div className="space-y-1">
                <a href="mailto:info@dewin.com" className="block text-gray-600 hover:text-[#1E2260]">
                  info@dewin.com
                </a>
                <a href="mailto:support@dewin.com" className="block text-gray-600 hover:text-[#1E2260]">
                  support@dewin.com
                </a>
                <a href="mailto:sales@dewin.com" className="block text-gray-600 hover:text-[#1E2260]">
                  sales@dewin.com
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-14 h-14 rounded-xl bg-[#1E2260]/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-7 w-7 text-[#1E2260]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
              <div className="space-y-1 text-gray-600">
                <p>Monday - Saturday</p>
                <p className="font-medium text-gray-900">9:00 AM - 7:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Address */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
              <p className="text-gray-600 mb-8">
                Have a question or need assistance? Fill out the form below and we'll get back to you shortly.
              </p>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input placeholder="John" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input placeholder="Doe" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input type="email" placeholder="john@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input type="tel" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input placeholder="How can we help you?" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    placeholder="Describe your inquiry in detail..."
                    rows={5}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#1E2260] hover:bg-[#161848]"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Address & Additional Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
              <p className="text-gray-600 mb-8">
                Stop by our office to meet our team and learn more about our digital solutions.
              </p>

              {/* Address Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1E2260]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-[#1E2260]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Head Office
                    </h3>
                    <p className="text-gray-600">
                      DeWiN Solutions Pvt. Ltd.
                      <br />
                      Laxmi Plaza, 213, Off New Link Rd,
                      <br />
                      Laxmi Industrial Estate, Milat Nagar,
                      <br />
                      Andheri West, Mumbai, Maharashtra 400053
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Support */}
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1E2260]/10 flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-6 w-6 text-[#1E2260]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Quick Support
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Need immediate assistance? Call our support team 24/7.
                    </p>
                    <a
                      href="tel:+919999999999"
                      className="inline-flex items-center gap-2 text-[#1E2260] font-medium hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      +91 99999 99999
                    </a>
                  </div>
                </div>
              </div>

              {/* Sales Inquiry */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1E2260]/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-[#1E2260]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sales Inquiries
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Interested in our enterprise solutions? Our sales team is here to help.
                    </p>
                    <a
                      href="mailto:sales@dewin.com"
                      className="inline-flex items-center gap-2 text-[#1E2260] font-medium hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      sales@dewin.com
                    </a>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 p-6 bg-gradient-to-br from-[#1E2260] to-[#141740] rounded-xl text-white">
                <h3 className="text-xl font-bold mb-2">
                  Looking for solutions?
                </h3>
                <p className="text-gray-200 mb-4">
                  Browse our complete marketplace of digital products and services.
                </p>
                <Link href="/products">
                  <Button className="bg-white text-[#1E2260] hover:bg-gray-100">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Find Us on Map
          </h2>
          <div className="bg-gray-100 rounded-xl overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Map will be displayed here</p>
              <p className="text-sm">Add your Google Maps embed code in settings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

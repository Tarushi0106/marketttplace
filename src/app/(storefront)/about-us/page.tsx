import Link from "next/link";
import { ChevronRight, Award, Target, Users, Clock, Shield, Globe, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us | Shaurrya Teleservices",
  description: "Learn about Shaurrya Teleservices and our mission to provide enterprise-grade cloud hosting solutions.",
};

export default function AboutUsPage() {
  const stats = [
    { value: "15+", label: "Years of Experience" },
    { value: "50K+", label: "Happy Customers" },
    { value: "99.99%", label: "Uptime Guarantee" },
    { value: "24/7", label: "Support Available" },
  ];

  const timeline = [
    { year: "2010", title: "Company Founded", description: "Started with a vision to revolutionize cloud hosting in India." },
    { year: "2015", title: "Data Center Launch", description: "Opened our first Tier-4 data center in Mumbai." },
    { year: "2018", title: "50K Customers", description: "Reached milestone of 50,000 customers across India." },
    { year: "2020", title: "Expansion", description: "Expanded to multiple data centers across Asia Pacific." },
    { year: "2024", title: "Innovation", description: "Launched new AI-powered cloud management platform." },
  ];

  const team = [
    { name: "Rahul Sharma", role: "CEO & Founder", description: "20+ years in telecommunications and cloud infrastructure." },
    { name: "Priya Patel", role: "CTO", description: "Former senior engineer at major cloud providers." },
    { name: "Amit Kumar", role: "Head of Operations", description: "Expert in data center management and operations." },
    { name: "Sneha Singh", role: "Head of Customer Success", description: "Dedicated to ensuring customer satisfaction." },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-[#8B1D1D] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 mb-6">
              Since 2010
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About{" "}
              <span className="text-[#FF6B6B]">Shaurrya Teleservices</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              We're on a mission to make enterprise-grade cloud infrastructure accessible to businesses of all sizes across India and beyond.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#8B1D1D] flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To empower businesses with reliable, secure, and affordable cloud hosting solutions that enable digital transformation and growth.
              </p>
              <p className="text-gray-600">
                We believe that every business deserves access to world-class infrastructure, regardless of size or budget.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#8B1D1D] flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-6">
                To be the leading cloud infrastructure provider in India and a trusted partner for businesses worldwide.
              </p>
              <p className="text-gray-600">
                We strive to innovate continuously and set new standards in customer service and technological excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#8B1D1D] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a small startup to a leading cloud provider, here's how we've grown.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 hidden md:block"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 text-right md:text-left">
                    <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <span className="inline-block px-4 py-1 rounded-full bg-[#8B1D1D]/10 text-[#8B1D1D] font-semibold mb-2">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#8B1D1D] border-4 border-white shadow-lg z-10 flex-shrink-0"></div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Industry veterans passionate about delivering exceptional cloud solutions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8B1D1D] to-[#B91C1C] flex items-center justify-center">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#8B1D1D] font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#8B1D1D] flex items-center justify-center">
                  <Phone className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">+91 98765 43210</p>
                <p className="text-gray-600">+91 22 1234 5678</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#8B1D1D] flex items-center justify-center">
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@shaurrya.com</p>
                <p className="text-gray-600">sales@shaurrya.com</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#8B1D1D] flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">Mumbai, India</p>
                <p className="text-gray-600">Data Center: Mumbai & Bangalore</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B1D1D] to-[#B91C1C]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Partner with Us?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who trust NetNxt for their cloud hosting needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#8B1D1D] hover:bg-gray-100" asChild>
              <Link href="/products">
                View Products
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#8B1D1D] bg-transparent"
              asChild
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

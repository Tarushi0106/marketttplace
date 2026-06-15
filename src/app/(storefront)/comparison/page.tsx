import Link from "next/link";
import { ChevronRight, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Compare Hosting Plans | DeWiN",
  description: "Compare DeWiN hosting plans with competitors and see why we're the best choice for your business.",
};

export default function ComparisonPage() {
  const features = [
    {
      category: "Performance",
      items: [
        { name: "CPU Cores", dewin: "Up to 64 vCPU", aws: "Up to 128 vCPU", azure: "Up to 128 vCPU", gcp: "Up to 128 vCPU" },
      ],
    },
    {
      category: "Storage",
      items: [
        { name: "SSD Storage", dewin: "Unlimited", aws: "Pay per use", azure: "Pay per use", gcp: "Pay per use" },
        { name: "Free Backup", dewin: true, aws: false, azure: false, gcp: false },
      ],
    },
    {
      category: "Security",
      items: [
        { name: "DDoS Protection", dewin: "Included", aws: "Paid add-on", azure: "Paid add-on", gcp: "Paid add-on" },
        { name: "Free SSL Certificates", dewin: true, aws: false, azure: false, gcp: false },
        { name: "Automated Backups", dewin: true, aws: "Paid", azure: "Paid", gcp: "Paid" },
      ],
    },
    {
      category: "Support",
      items: [
        { name: "24/7 Live Support", dewin: true, aws: "Premium only", azure: "Premium only", gcp: "Premium only" },
        { name: "Phone Support", dewin: true, aws: false, azure: false, gcp: false },
        { name: "Response Time", dewin: "< 15 minutes", aws: "1-4 hours", azure: "1-4 hours", gcp: "1-4 hours" },
      ],
    },
    {
      category: "Pricing",
      items: [
        { name: "Starting Price", dewin: "₹199/mo", aws: "₹1,200/mo", azure: "₹1,100/mo", gcp: "₹1,000/mo" },
        { name: "No Hidden Fees", dewin: true, aws: false, azure: false, gcp: false },
        { name: "Money-Back Guarantee", dewin: "30 days", aws: false, azure: false, gcp: false },
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-[#1E2260] text-white py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/10 text-white hover:bg-white/20 border-white/20 mb-6">
              Transparent Comparison
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How We Compare to{" "}
              <span className="text-[#FF6B6B]">Industry Giants</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10">
              See how DeWiN delivers better value, performance, and support compared to
              AWS, Azure, and Google Cloud Platform.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 w-1/4">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-[#1E2260] w-1/4 bg-[#EEF2FF] rounded-t-xl">
                    <span className="text-2xl">DeWiN</span>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700 w-1/4">
                    AWS
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700 w-1/4">
                    Azure
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700 w-1/4">
                    GCP
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <>
                    <tr key={category.category} className="bg-gray-50">
                      <td colSpan={5} className="py-3 px-4 font-semibold text-gray-900">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-700">{item.name}</td>
                        <td className="py-4 px-4 text-center bg-[#EEF2FF]/50">
                          {typeof item.dewin === "boolean" ? (
                            item.dewin ? (
                              <Check className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="font-semibold text-[#1E2260]">{item.dewin}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof item.aws === "boolean" ? (
                            item.aws ? (
                              <Check className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-600">{item.aws}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof item.azure === "boolean" ? (
                            item.azure ? (
                              <Check className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-600">{item.azure}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {typeof item.gcp === "boolean" ? (
                            item.gcp ? (
                              <Check className="h-6 w-6 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-600">{item.gcp}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why DeWiN Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why DeWiN Stands Out
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're not just another cloud provider. We're your partner in growth.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1E2260] flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Transparent Pricing
                </h3>
                <p className="text-gray-600">
                  No hidden fees, no surprise charges. What you see is what you pay.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1E2260] flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Indian-Owned
                </h3>
                <p className="text-gray-600">
                  Proudly Indian company with local data centers and support.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1E2260] flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Fastest Setup
                </h3>
                <p className="text-gray-600">
                  Get your server up and running in under 2 minutes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E2260] to-[#4A9FD5]">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Switch?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Try DeWiN risk-free with our enterprise-grade support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#1E2260] hover:bg-gray-100" asChild>
              <Link href="/products">
                View Plans
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#1E2260] bg-transparent"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

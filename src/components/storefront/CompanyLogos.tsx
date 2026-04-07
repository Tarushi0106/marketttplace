"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Company logos data with SVG URLs
const companyLogos = [
  {
    id: "1",
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    website: "https://microsoft.com",
  },
  {
    id: "2",
    name: "Amazon Web Services",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    website: "https://aws.amazon.com",
  },
  {
    id: "3",
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    website: "https://ibm.com",
  },
  {
    id: "4",
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    website: "https://oracle.com",
  },
  {
    id: "5",
    name: "Cisco",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
    website: "https://cisco.com",
  },
  {
    id: "6",
    name: "Dell",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg",
    website: "https://dell.com",
  },
  {
    id: "7",
    name: "SAP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg",
    website: "https://sap.com",
  },
];

export function CompanyLogos() {
  const [logos, setLogos] = useState(companyLogos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always use the hardcoded logos for reliability
    // Skip API call to avoid database issues
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-xl font-semibold">Trusted by Leading Companies</p>
          </div>
          <div className="flex gap-10 justify-center items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-28 h-12 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-gray-500 text-xl font-semibold">
            Trusted by Leading Companies
          </p>
        </div>
      </div>

      {/* Auto-scrolling logos container */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />

        {/* Scrolling track */}
        <div className="flex animate-scroll-left gap-10">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {logo.website ? (
                <a
                  href={logo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 transform hover:scale-105"
                  title={logo.name}
                >
                  <img
                    src={logo.logo}
                    alt={logo.name}
                    className="h-12 w-auto object-contain"
                    style={{ height: "50px", width: "auto" }}
                  />
                </a>
              ) : (
                <div
                  className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  title={logo.name}
                >
                  <img
                    src={logo.logo}
                    alt={logo.name}
                    className="h-12 w-auto object-contain"
                    style={{ height: "50px", width: "auto" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

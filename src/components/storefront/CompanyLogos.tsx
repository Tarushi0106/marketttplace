"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CompanyLogo {
  id: string;
  name: string;
  logo: string;
  website: string | null;
}

// Default logos (fallback if none in DB)
const defaultLogos: CompanyLogo[] = [
  {
    id: "1",
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png",
    website: "https://microsoft.com",
  },
  {
    id: "2",
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png",
    website: "https://google.com",
  },
  {
    id: "3",
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png",
    website: "https://amazon.com",
  },
  {
    id: "4",
    name: "Cisco",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/512px-Cisco_logo_blue_2016.svg.png",
    website: "https://cisco.com",
  },
  {
    id: "5",
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png",
    website: "https://ibm.com",
  },
  {
    id: "6",
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/512px-Oracle_logo.svg.png",
    website: "https://oracle.com",
  },
  {
    id: "7",
    name: "SAP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/512px-SAP_2011_logo.svg.png",
    website: "https://sap.com",
  },
  {
    id: "8",
    name: "Dell",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/512px-Dell_Logo.svg.png",
    website: "https://dell.com",
  },
];

export function CompanyLogos() {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogos() {
      try {
        const response = await fetch("/api/company-logos");
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setLogos(data.data);
        } else {
          setLogos(defaultLogos);
        }
      } catch (error) {
        console.error("Error fetching company logos:", error);
        setLogos(defaultLogos);
      } finally {
        setLoading(false);
      }
    }
    fetchLogos();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-lg">Trusted by Leading Companies</p>
          </div>
          <div className="flex gap-12 justify-center">
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
          <p className="text-gray-500 text-lg font-medium">
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
        <div className="flex animate-scroll-left">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex-shrink-0 mx-8 md:mx-12"
            >
              {logo.website ? (
                <a
                  href={logo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  title={logo.name}
                >
                  <img
                    src={logo.logo}
                    alt={logo.name}
                    className="h-10 md:h-12 w-auto object-contain"
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
                    className="h-10 md:h-12 w-auto object-contain"
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

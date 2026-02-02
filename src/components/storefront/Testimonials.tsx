"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  clientName: string;
  designation: string;
  company: string | null;
  quote: string;
  title: string | null;
  image: string | null;
  rating: number | null;
}

// Default testimonials (fallback if none in DB)
const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    clientName: "Rajesh Menon",
    designation: "IT Services",
    company: null,
    quote: "Shaurrya's network infrastructure transformed our operations. The uptime and support are exceptional. We've seen a 40% improvement in connectivity across all our branches.",
    title: "Shaurrya's Services are Unmatched",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "2",
    clientName: "Arjun Desai",
    designation: "Bank Manager",
    company: null,
    quote: "The security solutions provided by Shaurrya give us peace of mind. Their 24/7 monitoring and quick response time have been invaluable for our financial operations.",
    title: "Shaurrya's Services are Unmatched",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: "3",
    clientName: "Priya Sharma",
    designation: "CTO",
    company: "TechStart Solutions",
    quote: "Moving to Shaurrya's cloud infrastructure was the best decision we made. Scalable, reliable, and cost-effective. Their team made the migration seamless.",
    title: "Best Cloud Partner We've Had",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    rating: 5,
  },
];

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch("/api/testimonials");
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setTestimonials(data.data);
        } else {
          setTestimonials(defaultTestimonials);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 600 + 24; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What our Clients Say
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Trusted by businesses across India
            </p>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[600px] h-[280px] bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What our Clients Say
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Trusted by businesses across India
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 snap-start w-[calc(100vw-48px)] md:w-[600px]"
              >
                <div className="bg-[#FDF8F6] rounded-2xl p-6 md:p-8 h-full flex items-center gap-6">
                  {/* Client Image */}
                  <div className="flex-shrink-0 hidden md:block">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.clientName}
                        className="w-40 h-52 object-cover object-top rounded-lg"
                      />
                    ) : (
                      <div className="w-40 h-52 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-400">
                          {testimonial.clientName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Quote Icon */}
                    <Quote className="h-10 w-10 text-[#8B1D1D] fill-[#8B1D1D] mb-4" />

                    {/* Title */}
                    {testimonial.title && (
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {testimonial.title}
                      </h3>
                    )}

                    {/* Quote Text */}
                    <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                      {testimonial.quote}
                    </p>

                    {/* Client Info */}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.clientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {testimonial.designation}
                        {testimonial.company && `, ${testimonial.company}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Desktop */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-[#8B1D1D]"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

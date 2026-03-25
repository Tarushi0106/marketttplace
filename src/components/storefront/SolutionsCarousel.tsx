"use client";

import { useRef } from "react";
import Link from "next/link";
import { 
  ChevronRight, ChevronLeft, Cloud, Shield, Wifi, Database, Settings, 
  Share2, Server, Monitor, Lock, Brain, Folder, ArrowRight, Zap, Code, 
  Layers, Box, Download, HardDrive, Cpu, Globe, Smartphone, Terminal, 
  FileCode, DatabaseZap, CloudLightning, WifiHigh, Crosshair, 
  LayoutDashboard, Megaphone, ShoppingCart, Briefcase, TrendingUp, PenTool, 
  Mail, MessageSquare, Bell, Users, Calendar, CreditCard, Search, Filter, 
  Settings2, PieChart, BarChart, LineChart, FileText, Archive, Key, 
  Fingerprint, RefreshCw, Upload, DownloadCloud, Share, Link2, Globe2, 
  Laptop, Tablet, Watch, Headphones, Speaker, Camera, Video, Music, 
  Radio, Disc, Book, BookOpen, Library, GraduationCap, Award, Star, 
  Heart, Flag, Map, Compass, Navigation, MapPin, Target, Sun, Moon, 
  Droplet, Flame, Snowflake, Wind, CloudRain, CloudSnow, CloudDrizzle, 
  CloudFog, CloudSun, CloudMoon, Bookmark, Tag, Ticket, 
  Gift, Coffee, Truck, Plane, Ship, Bike, Footprints, Package, 
  Hexagon, Octagon, Diamond, Gem, Sparkles, Puzzle, Wrench, Hammer, 
  Scale, Gavel, Building, Factory, Store, ShoppingBag, Wallet, 
  Banknote, Coins, Currency, ChartLine, ChartBar, ChartPie, Activity,
  Rocket, Play, Pause
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  iconBgColor: string | null;
  productCount: number;
  bgClass: string;
  titleClass: string;
  textClass: string;
  iconBg: string;
}

interface SolutionsCarouselProps {
  categories: Category[];
  iconMap?: Record<string, React.ReactNode>;
}

// Extended Icon mapping for more product-matching icons
const defaultIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  shield: Shield,
  cloud: Cloud,
  settings: Settings,
  brain: Brain,
  share2: Share2,
  database: Database,
  server: Server,
  monitor: Monitor,
  lock: Lock,
  // Additional software/product icons
  zap: Zap,
  code: Code,
  layers: Layers,
  box: Box,
  download: Download,
  "hard-drive": HardDrive,
  cpu: Cpu,
  globe: Globe,
  smartphone: Smartphone,
  terminal: Terminal,
  "file-code": FileCode,
  "database-zap": DatabaseZap,
  "cloud-lightning": CloudLightning,
  security: Lock,
  "wifi-high": WifiHigh,
  crosshair: Crosshair,
  layout: LayoutDashboard,
  megaphone: Megaphone,
  "shopping-cart": ShoppingCart,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "pen-tool": PenTool,
  mail: Mail,
  "message-square": MessageSquare,
  bell: Bell,
  users: Users,
  calendar: Calendar,
  "credit-card": CreditCard,
  search: Search,
  filter: Filter,
  "settings-2": Settings2,
  "pie-chart": PieChart,
  "bar-chart": BarChart,
  "line-chart": ChartLine,
  "file-text": FileText,
  archive: Archive,
  key: Key,
  fingerprint: Fingerprint,
  "refresh-cw": RefreshCw,
  upload: Upload,
  "download-cloud": DownloadCloud,
  share: Share,
  link: Link2,
  laptop: Laptop,
  tablet: Tablet,
  watch: Watch,
  headphones: Headphones,
  speaker: Speaker,
  camera: Camera,
  video: Video,
  book: Book,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  award: Award,
  star: Star,
  heart: Heart,
  flag: Flag,
  map: Map,
  compass: Compass,
  navigation: Navigation,
  "map-pin": MapPin,
  target: Target,
  sun: Sun,
  moon: Moon,
  flame: Flame,
  droplet: Droplet,
  // Fallback icons for unknown categories
  software: Box,
  app: Smartphone,
  tool: Wrench,
  product: Package,
  folder: Folder,
  default: Box,
};

export function SolutionsCarousel({ categories }: SolutionsCarouselProps) {
  const solutionsScrollRef = useRef<HTMLDivElement>(null);

  const scrollSolutionsLeft = () => {
    if (solutionsScrollRef.current) {
      solutionsScrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollSolutionsRight = () => {
    if (solutionsScrollRef.current) {
      solutionsScrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const getIcon = (iconName: string | null, className: string, categoryName?: string) => {
    // If we have a specific icon name, try to find it
    if (iconName) {
      const IconComponent = defaultIconMap[iconName];
      if (IconComponent) {
        return <IconComponent className={className} />;
      }
    }
    
    // If no icon or unknown icon, try to match by category name
    if (categoryName) {
      const name = categoryName.toLowerCase();
      if (name.includes('software') || name.includes('app') || name.includes('application')) return <Box className={className} />;
      if (name.includes('cloud') || name.includes('server') || name.includes('hosting')) return <Cloud className={className} />;
      if (name.includes('security') || name.includes('protect') || name.includes('shield')) return <Lock className={className} />;
      if (name.includes('data') || name.includes('database') || name.includes('storage')) return <Database className={className} />;
      if (name.includes('network') || name.includes('wifi') || name.includes('internet')) return <Wifi className={className} />;
      if (name.includes('business') || name.includes('enterprise') || name.includes('company')) return <Briefcase className={className} />;
      if (name.includes('analytics') || name.includes('report') || name.includes('chart')) return <BarChart className={className} />;
      if (name.includes('development') || name.includes('dev') || name.includes('code')) return <Code className={className} />;
      if (name.includes('marketing') || name.includes('campaign') || name.includes('ads')) return <Megaphone className={className} />;
      if (name.includes('sales') || name.includes('crm') || name.includes('customer')) return <TrendingUp className={className} />;
      if (name.includes('payment') || name.includes('billing') || name.includes('invoice')) return <CreditCard className={className} />;
      if (name.includes('communication') || name.includes('email') || name.includes('message')) return <Mail className={className} />;
      if (name.includes('team') || name.includes('collaborate') || name.includes('project')) return <Users className={className} />;
      if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return <Smartphone className={className} />;
      if (name.includes('backup') || name.includes('restore') || name.includes('recovery')) return <DownloadCloud className={className} />;
      if (name.includes('tool') || name.includes('utility') || name.includes('helper')) return <Wrench className={className} />;
      if (name.includes('ai') || name.includes('intelligence') || name.includes('machine')) return <Brain className={className} />;
      if (name.includes('integration') || name.includes('api') || name.includes('connect')) return <Link2 className={className} />;
      if (name.includes('video') || name.includes('media') || name.includes('streaming')) return <Video className={className} />;
      if (name.includes('document') || name.includes('pdf') || name.includes('file')) return <FileText className={className} />;
      if (name.includes('monitoring') || name.includes('track') || name.includes('watch')) return <Activity className={className} />;
      if (name.includes('design') || name.includes('creative') || name.includes('graphic')) return <Sparkles className={className} />;
      if (name.includes('hr') || name.includes('human') || name.includes('resource')) return <Users className={className} />;
      if (name.includes('accounting') || name.includes('finance') || name.includes('book')) return <Wallet className={className} />;
      if (name.includes('inventory') || name.includes('stock') || name.includes('product')) return <Package className={className} />;
      if (name.includes('education') || name.includes('learning') || name.includes('course')) return <GraduationCap className={className} />;
      if (name.includes('health') || name.includes('medical') || name.includes('healthcare')) return <Heart className={className} />;
      if (name.includes('travel') || name.includes('booking') || name.includes('reservation')) return <Plane className={className} />;
      if (name.includes('restaurant') || name.includes('food') || name.includes('delivery')) return <Coffee className={className} />;
      if (name.includes('real estate') || name.includes('property') || name.includes('housing')) return <Building className={className} />;
      if (name.includes('manufacturing') || name.includes('production') || name.includes('factory')) return <Factory className={className} />;
    }
    
    // Default fallback
    return <Box className={className} />;
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Browse Top Solutions
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-2xl">
              Discover our comprehensive range of enterprise solutions designed to transform your business operations.
            </p>
          </div>
          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollSolutionsLeft}
              className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={scrollSolutionsRight}
              className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Container - Simple Names Only */}
        <div
          ref={solutionsScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] justify-center"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex-shrink-0 snap-start"
            >
              <div className="px-8 py-4 bg-white border border-gray-200 rounded-xl hover:border-red-400 hover:shadow-md transition-all duration-300">
                <span className="text-lg font-medium text-gray-900 whitespace-nowrap">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

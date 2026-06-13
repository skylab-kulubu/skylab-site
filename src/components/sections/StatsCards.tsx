"use client";

import type { LucideIcon } from "lucide-react";
import {
  Users,
  Sparkles,
  Code2,
  Trophy,
  Star,
  Heart,
  Zap,
  Globe,
  BookOpen,
  Rocket,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  Search,
  Settings,
  Bell,
  Mail,
  Home,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  Share,
  Link,
  Image,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Mic,
  Camera,
  Video,
  Headphones,
  Music,
  Radio,
  Map,
  Navigation,
  Compass,
  Flag,
  Tag,
  Bookmark,
  Folder,
  File,
  Edit,
  Trash,
  Copy,
  Clipboard,
  Send,
  MessageCircle,
  Phone,
  Wifi,
  Battery,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  Printer,
  Database,
  Server,
  Cloud,
  Sun,
  Moon,
  Snowflake,
  Wind,
  Droplets,
  Flame,
  Coffee,
  Gift,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Package,
  Briefcase,
  Building,
  Car,
  Bike,
  Plane,
  Ship,
  Train,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Info,
  AlertCircle,
  Angry,
  Laugh,
  Annoyed,
  Crown,
  Gem,
  Medal,
  Megaphone,
  PartyPopper,
  Lightbulb,
  GraduationCap,
  Cpu,
  Terminal,
  Palette,
  PenTool,
  Layers,
  Box,
  Atom,
  Brain,
  Bot,
  Shield,
  Activity,
  BarChart3,
} from "lucide-react";
import { Twitter, Instagram, Linkedin, Youtube, Twitch, Figma, Github } from "@/components/ui/BrandIcons";
import { StatsCard } from "@/components/ui/StatsCard";
import { EditableList } from "inscribed";
import { useCmsContext } from "@/hooks/use-cms-context";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { DynamicIcon } from "lucide-react/dynamic";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Sparkles,
  Code2,
  Trophy,
  Star,
  Heart,
  Zap,
  Globe,
  BookOpen,
  Rocket,
  Award,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Plus,
  Minus,
  Search,
  Settings,
  Bell,
  Mail,
  Home,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  Upload,
  Share,
  Link,
  Image,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Mic,
  Camera,
  Video,
  Headphones,
  Music,
  Radio,
  Map,
  Navigation,
  Compass,
  Flag,
  Tag,
  Bookmark,
  Folder,
  File,
  Edit,
  Trash,
  Copy,
  Clipboard,
  Send,
  MessageCircle,
  Phone,
  Wifi,
  Battery,
  Monitor,
  Laptop,
  Smartphone,
  Tablet,
  Printer,
  Database,
  Server,
  Cloud,
  Sun,
  Moon,
  Snowflake,
  Wind,
  Droplets,
  Flame,
  Coffee,
  Gift,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Package,
  Briefcase,
  Building,
  Car,
  Bike,
  Plane,
  Ship,
  Train,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Info,
  AlertCircle,
  Angry,
  Laugh,
  Annoyed,
  Crown,
  Gem,
  Medal,
  Megaphone,
  PartyPopper,
  Lightbulb,
  GraduationCap,
  Cpu,
  Terminal,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Twitch,
  Figma,
  Palette,
  PenTool,
  Layers,
  Box,
  Atom,
  Brain,
  Bot,
  Shield,
  Activity,
  BarChart3,
};

const ICON_MAP_LOWER: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(ICON_MAP).map(([k, v]) => [k.toLowerCase(), v]),
);

function toKebab(name: string): string {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

const dynamicIconCache: Record<string, LucideIcon> = {};

function makeDynamicIcon(kebab: string): LucideIcon {
  const cached = dynamicIconCache[kebab];
  if (cached) return cached;
  const Cmp = (props: any) => (
    <DynamicIcon name={kebab as never} fallback={Users as never} {...props} />
  );
  Cmp.displayName = `DynamicLucide(${kebab})`;
  const icon = Cmp as unknown as LucideIcon;
  dynamicIconCache[kebab] = icon;
  return icon;
}

function getIcon(name: string): LucideIcon {
  if (!name) return Users;
  if (ICON_MAP[name]) return ICON_MAP[name];
  const lower = name.toLowerCase().trim();
  if (ICON_MAP_LOWER[lower]) return ICON_MAP_LOWER[lower];
  return makeDynamicIcon(toKebab(name));
}

const defaultStats: any[] = [];

export default function StatsCards({
  isVisible: propIsVisible,
}: {
  isVisible?: boolean;
}) {
  const { isAdmin, setActiveBlock } = useCmsContext();
  const { ref: sectionRef, isVisible: scrollIsVisible } = useScrollReveal(0.3);
  const isVisible = propIsVisible ?? scrollIsVisible;
  const prefersReducedMotion = useReducedMotion();

  const gridRef = useRef<HTMLDivElement>(null);
  const [fadeEnd, setFadeEnd] = useState(450);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      setFadeEnd(Math.max(450, Math.round(el.offsetHeight + 320)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const opacity = useTransform(
    scrollY,
    [0, fadeEnd],
    prefersReducedMotion ? [1, 1] : [1, 0],
  );
  const pointerEvents = useTransform(scrollY, (v) =>
    v > fadeEnd - 50 ? "none" : "auto",
  );

  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="relative z-30 w-full"
    >
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 md:px-8">
        <div
          ref={gridRef}
          className="cms-stats-grid grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-6"
        >
          <EditableList
            blockPath="hero.stats"
            itemSchema={{
              value: { blockType: "Text", defaultValue: "0" },
              label: { blockType: "Text", defaultValue: "" },
              suffix: { blockType: "Text", defaultValue: "" },
              iconName: { blockType: "Text", defaultValue: "Users" },
            }}
            defaultValue={[]}
          >
            {(stat, index) => {
              const Icon = getIcon(stat.iconName ?? "");
              const delay = index * 150;
              const containerStyle = {
                transitionDuration: "800ms",
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                isolation: "isolate",
              } as React.CSSProperties;

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isAdmin) {
                      setActiveBlock("hero.stats");
                    }
                  }}
                  className={cn(
                    "h-full transition-all ease-out",
                    isAdmin &&
                      "cursor-pointer hover:ring-2 hover:ring-purple-400/50 rounded-xl",
                    isVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95",
                  )}
                  style={containerStyle}
                >
                  <StatsCard
                    value={Number(stat.value) || 0}
                    label={stat.label}
                    suffix={stat.suffix}
                    icon={Icon}
                    delay={delay}
                    isVisible={isVisible}
                  />
                </div>
              );
            }}
          </EditableList>
        </div>
      </div>
    </motion.div>
  );
}

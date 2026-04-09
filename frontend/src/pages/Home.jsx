import { useEffect, useMemo, useState } from "react";
import {
  Recycle,
  ShieldCheck,
  Truck,
  Leaf,
  BarChart3,
  Cpu,
  Smartphone,
  Laptop,
} from "lucide-react";

import img1 from "../assets/image-1.jpeg";
import img2 from "../assets/image-2.jpeg";
import img3 from "../assets/image-3.jpeg";

import category1 from "../assets/Mobiles.png";
import category2 from "../assets/Laptop.png";
import category3 from "../assets/Accessories.png";
import category4 from "../assets/homeelctronics.png";
import category5 from "../assets/Office-E-Waste.png";
import category6 from "../assets/Hardisk.png";

import HeroSection from "../components/home/HeroSection";
import CategoriesSection from "../components/home/CategoriesSection";
import FeaturesSection from "../components/home/FeaturesSection";
import CTASection from "../components/home/CTASection";

export default function Home() {
  const sliderImages = useMemo(
    () => [
      {
        src: img1,
        title: "Mountains of discarded electronics",
        subtitle:
          "E-waste is one of the fastest-growing waste streams in the world.",
      },
      {
        src: img2,
        title: "Toxic disposal harms communities",
        subtitle:
          "Improper recycling can release hazardous materials into soil, water, and air.",
      },
      {
        src: img3,
        title: "Circular reuse creates real value",
        subtitle:
          "Devices can be repaired, resold, recycled, and tracked transparently.",
      },
    ],
    []
  );

  const impactStats = [
    {
      value: "62M+",
      label: "tons of e-waste generated globally",
      icon: Cpu,
    },
    {
      value: "< 25%",
      label: "properly collected and recycled",
      icon: Recycle,
    },
    {
      value: "1000s",
      label: "recoverable parts and materials",
      icon: BarChart3,
    },
  ];

  const features = [
    {
      title: "Smart Device Evaluation",
      desc: "Get transparent value estimation for old, broken, or unused electronics.",
      icon: Smartphone,
    },
    {
      title: "Verified Recycler Network",
      desc: "Connect only with trusted recyclers and refurbishers.",
      icon: ShieldCheck,
    },
    {
      title: "Doorstep Pickup",
      desc: "Schedule a smooth pickup experience without confusion.",
      icon: Truck,
    },
    {
      title: "Impact Tracking",
      desc: "See your carbon savings, earnings, and material recovery in one place.",
      icon: Leaf,
    },
  ];

  const categories = [
    { name: "Mobiles & Tablets", image: category1 },
    { name: "Laptops & PCs", image: category2 },
    { name: "Accessories", image: category3 },
    { name: "Home Electronics", image: category4 },
    { name: "Broken Devices", image: category5 },
    { name: "Office E-Waste", image: category6 },
  ];

  const supportedDevices = [Smartphone, Laptop, Cpu];

  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    if (!sliderImages.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const handleImageError = (index) => {
    setBrokenImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <HeroSection
        impactStats={impactStats}
        sliderImages={sliderImages}
        activeIndex={activeIndex}
        brokenImages={brokenImages}
        goPrev={goPrev}
        goNext={goNext}
        setActiveIndex={setActiveIndex}
        handleImageError={handleImageError}
        supportedDevices={supportedDevices}
      />

      <CategoriesSection categories={categories} />
      <FeaturesSection features={features} />
      <CTASection />
    </div>
  );
}
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

import Header from "./Header";
import FestivalHero from "../../components/FestiBanner"; // Import the FestivalHero component

// -------------------- Add By Pawan For Lazy Loading (START) --------------------
const StoneCollection = lazy(() => import("./StoneCollection"));
const VideoSection = lazy(() => import("./VideoSection"));
const Certificate = lazy(() => import("./Certificates"));
const JewelleryCollection = lazy(() => import("./JewelleryCollection"));
const Legacy = lazy(() => import("./Legacy"));
const LegacyTrust = lazy(() => import("./LegacyTrust"));
const SlideImage = lazy(() => import("./SlideImage"));
const GemstoneEducationYoutubeSection = lazy(() => import("./GemstoneEducationYoutubeSection"));
const GemstoneReviews = lazy(() => import("./GemstoneReviews"));
const TrustBadges = lazy(() => import("../../components/trust"));
// import ExclusiveJewellery from "./ExclusiveJewellery";
// import TestimonialReview from "./TestimonialReview";

// If a section has not come into view after this many ms, load it anyway
// (keeps content available for search-engine crawlers and anchor links).
const LOAD_ANYWAY_AFTER_MS = 5000;
const LazySection = ({
  children,
  className = "",
  minHeight = 400,
  eager = false,
  rootMargin = "300px",
}) => {
  const ref = useRef(null);
  const [show, setShow] = useState(eager);

  useEffect(() => {
    if (show) return undefined;

    // Very old browsers: just show it
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    if (ref.current) observer.observe(ref.current);

    const timer = setTimeout(() => setShow(true), LOAD_ANYWAY_AFTER_MS);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [show, rootMargin]);

  return (
    <section
      ref={ref}
      className={className}
      style={show ? undefined : { minHeight }}
    >
      {show && (
        <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>
          {children}
        </Suspense>
      )}
    </section>
  );
};
// -------------------- Add By Pawan For Lazy Loading (END) --------------------

function Home() {
  return (
    <>
      <Helmet>
        <title>Buy Certified Gemstones Online | GemRishi India Trusted Astrology Gems</title>
        <meta name="description" content="Discover certified natural gemstones and astrology jewelry from GemRishi India. Trusted source for authentic gems, birthstones, and healing crystals." />
      </Helmet>
      <div className="flex flex-col">
        <section className="bg-green-25">
          <FestivalHero />
        </section>
        {/* Hero Section */}
        <section className="bg-green-25">
          <Header />
        </section>

        {/* -------------------- Add By Pawan For Lazy Loading (START) -------------------- */}

        {/* Stones (right below the hero -> load code immediately) */}
        <LazySection className="bg-white-50" eager minHeight={500}>
          <StoneCollection />
        </LazySection>

        {/* Video section */}
        <LazySection minHeight={450}>
          <VideoSection />
        </LazySection>

        {/* Certificate Section */}
        <LazySection className="bg-green-25" minHeight={400}>
          <Certificate />
        </LazySection>

        {/* Jewellery */}
        <LazySection className="bg-white" minHeight={500}>
          <JewelleryCollection />
        </LazySection>

        {/* Legecy section */}
        <LazySection className="bg-green-220 " minHeight={400}>
          <Legacy />
        </LazySection>

        {/* Legacy Trust */}
        <LazySection className="bg-green-50" minHeight={400}>
          <LegacyTrust />
        </LazySection>

        {/* Slide Image */}
        <LazySection className="bg-green-25" minHeight={350}>
          <SlideImage />
        </LazySection>

        {/* GemstoneEducationYoutubeSection section (YouTube iframes -> only loaded when near) */}
        <LazySection className="bg-green-220 " minHeight={500}>
          <GemstoneEducationYoutubeSection />
        </LazySection>

        {/* Reviews */}
        <LazySection minHeight={400}>
          <GemstoneReviews />
        </LazySection>

        {/* Trust Badges */}
        <LazySection className="bg-green-100" minHeight={250}>
          <TrustBadges />
        </LazySection>

        {/* -------------------- Add By Pawan For Lazy Loading (END) -------------------- */}

        {/*
				Exclusive Jewellery
				<section className="bg-white border-b border-gray-200 ">
					<ExclusiveJewellery />
				</section> */}
      </div>
    </>
  );
}

export default Home;
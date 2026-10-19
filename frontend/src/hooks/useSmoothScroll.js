import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function useSmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll on page change
    window.scrollTo(0, 0);

    // Respect reduced-motion preferences
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      ScrollTrigger.refresh();
      return;
    }

    // Locomotive Scroll v5
    const locomotiveScroll = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
      },

      // Synchronize GSAP ScrollTrigger
      scrollCallback: () => {
        ScrollTrigger.update();
      },
    });

    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    // Cleanup on route change
    return () => {
      cancelAnimationFrame(frame);
      locomotiveScroll.destroy();
    };
  }, [pathname]);
}

/**
 * ScrollManager
 * Handles smooth scrolling with Lenis and scroll-related functionality
 */

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default class ScrollManager {
  constructor() {
    // Store reference to Lenis instance
    this.lenis = null;
    this.isRunning = false;

    // Bind methods to this context
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.destroy = this.destroy.bind(this);
    this.tick = this.tick.bind(this);
  }

  /**
   * GSAP tick method for Lenis
   * @param time
   */
  tick(time) {
    if (this.lenis && this.isRunning) {
      this.lenis.raf(time * 1000);
    }
  }

  /**
   * Initialize Lenis for smooth scrolling
   */
  init() {
   // console.log("Initializing Lenis");
    //destroy lenis if already initialized

    // Initialize Lenis with explicit direction
    this.lenis = new Lenis({
      smooth: true,
      wheelMultiplier: 1.0, // Adjust sensitivity as needed
      touchMultiplier: 1.0, // Adjust for mobile
      normalizeWheel: true,
      smoothTouch: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Track scroll position for debugging
    this.lenis.on(
      "scroll",
      () => {
        // Pass scroll info to ScrollTrigger
        ScrollTrigger.update();
      }
    );

    // Add Lenis's update to GSAP's ticker
    gsap.ticker.add(this.tick);

    // Disable lag smoothing in GSAP to prevent any delay
    gsap.ticker.lagSmoothing(0);

    this.isRunning = true;
  }

  /**
   * Scroll to a target element or position
   * @param {Element|number|string} target - Element, position, or selector
   * @param {Object} options - Options for the scroll behavior
   */
  scrollTo(target, options = {}) {
    if (!this.lenis) return;

    // Default options
    const defaultOptions = {
      offset: 0,
      duration: 2,
      immediate: false,
      lock: false,
      onComplete: null,
    };

    // Merge default options with provided options
    const scrollOptions = { ...defaultOptions, ...options };

    // Scroll to the target
    this.lenis.scrollTo(target, scrollOptions);
  }

  /**
   * Update Lenis when content changes
   */
  update() {
    // console.log("new update");
    if (this.lenis) {
      //this.lenis.scrollTo("top", { immediate: true }); // Scroll to top immediately
      //console.log("Updating Lenis");
      this.lenis.resize(); // Make sure to resize before updating
      //console.log(this.lenis);

      // Ensure ScrollTrigger is also updated
      ScrollTrigger.refresh();
    }else{
      this.init()
    }
  }

  /**
   * Temporarily stop Lenis scrolling (useful during transitions)
   */
  stop() {
    if (this.lenis) {
      //  console.log("Stopping Lenis");
      this.isRunning = false;
      this.lenis.stop();
    }
  }

  /**
   * Resume Lenis scrolling after it has been stopped
   */
  start() {
    if (this.lenis) {
      // console.log("Starting Lenis");
      this.isRunning = true;
      this.lenis.start();
    }
  }


  /**
   * Destroy the Lenis instance and clean up event listeners
   */
  destroy() {
    if (this.lenis) {
      // console.log("Destroying Lenis");
      gsap.ticker.remove(this.tick);
      this.lenis.destroy();
      this.lenis = null;
      this.isRunning = false;
    }
  }
}

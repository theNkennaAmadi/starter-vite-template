import Swup from "swup";
import SwupHeadPlugin from "@swup/head-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";


// Page Modules
import Home from "./pages/home.js";
import About from "./pages/about.js";
import Contact from "./pages/contact.js";
import Collection from "./pages/collection.js";
import Collections from "./pages/collections.js";
import NotFound from "./pages/not-found.js";

// Component Modules
import ScrollManager from "./utils/scroll.js";
import Global from "./utils/global.js";


// Animation Libraries
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import "splitting/dist/splitting.css";




export default class App {
  constructor() {
    this.pageMap = {
        home: Home,
        about: About,
        contact: Contact,
        collection: Collection,
        collections: Collections,
        notFound: NotFound,
    };

    // Store references to managers
    this.scroll = null;


    // Store initial load state
    this.initialLoad = true;

  }

  init() {
    //console.log("App initialized");
    this.swup = new Swup({
      containers: ["#main"],
      plugins: [
        new SwupHeadPlugin(),
        new SwupA11yPlugin(),
        new SwupPreloadPlugin(),
      ],
    });

    console.log('Swup initialized');

    //  Initialize scroll behavior
    // this.initScrollBehavior();

    // Check for reduced motion preference
    //this.handleReducedMotion();


    // Setup the page right away for the initial load
    this.setupPage();



    // Run setupPage on every Swup content replacement
    this.swup.hooks.before('content:replace', () => {
      // Clean up the previous page instance
      if (this.pageInstance && typeof this.pageInstance.destroy === "function") {
        this.pageInstance.destroy()
      }
      const element = document.querySelector("[data-namespace]");
      if (!element) return;


      ScrollTrigger.killAll();
      gsap
        .getTweensOf(element.querySelectorAll("*"))
        .forEach((tween) => {
          tween.revert();
          tween.kill();
        });
      ScrollTrigger.clearScrollMemory();
      this.scroll.destroy();
    })

    //  Also run setup on every Swup page transition
    this.swup.hooks.on("page:view", () => {
      // Re-init page modules
      this.setupPage();

      // Update scroll manager so it knows about new DOM content
      this.scroll.update();
    });
  }

  /**
   * Initialize smooth scrolling with Lenis
   */
  initScrollBehavior() {
    if (!this.scroll) {
      // console.log("Creating new ScrollManager (Lenis) instance");
      this.scroll = new ScrollManager();
      this.scroll.init();
    } else {
      //console.log("Reusing existing ScrollManager instance");
      // Make sure it's running in case you previously stopped it
      this.scroll.start();
      // And do a refresh if needed:
      this.scroll.update();
      ScrollTrigger.refresh();
    }
  }


  // Reusable method to detect the current namespace and instantiate the right page
  setupPage() {
    const element = document.querySelector("[data-namespace]");
    if (!element) return;

    const namespace = element.getAttribute("data-namespace");
    const PageClass = this.pageMap[namespace];

    this.initScrollBehavior();


    if (PageClass) {
      // console.log("PageClass", namespace);
       new Global(element);
      this.pageInstance = new PageClass(element, this.scroll, this.initialLoad, this.swup);
    }

    this.initialLoad = false;
  }
}

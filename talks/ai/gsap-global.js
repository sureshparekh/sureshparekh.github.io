// talk.js expects gsap and DrawSVGPlugin as globals.
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

window.gsap = gsap;
window.DrawSVGPlugin = DrawSVGPlugin;

// Run animations on wall-clock time: if the galaxy drops a frame, beats still finish on schedule.
gsap.ticker.lagSmoothing(0);

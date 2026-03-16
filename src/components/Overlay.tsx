"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function Overlay() {
  const { scrollYProgress } = useScroll();

  // Opacities for the 3 text sections
  // Section 1: visible from 0 to 15%, fades out by 25%
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -100]);

  // Section 2: fades in 20% to 30%, stays until 45%, fades out by 55%
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [100, 0, 0, -100]);

  // Section 3: fades in 50% to 60%, stays until 80%, fades out by 90%
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.8, 0.9], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.6, 0.8, 0.9], [100, 0, 0, -100]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-8">
      {/* Section 1 */}
      <motion.div
        style={{ opacity: opacity1, y: y1 }}
        className="absolute flex flex-col items-center justify-center text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
          Suresh Parekh
        </h1>
        <p className="text-xl md:text-3xl font-light text-gray-300">
          Astrophysicist
        </p>
      </motion.div>

      {/* Section 2 */}
      <motion.div
        style={{ opacity: opacity2, y: y2 }}
        className="absolute left-[10%] max-w-md"
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Precision. Performance. Discovery
        </h2>
        <p className="text-lg md:text-xl text-gray-300">
          Engineering high-performance GPU algorithms to decode the universe's most complex phenomena—from Active Galactic Nuclei to stellar evolution
        </p>
      </motion.div>

      {/* Section 3 */}
      <motion.div
        style={{ opacity: opacity3, y: y3 }}
        className="absolute right-[10%] max-w-md text-right"
      >
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Meet BRAIN
        </h2>
        <p className="text-lg md:text-xl text-gray-300">
          A next-generation, simulation-based inference engine. Built to process massive JWST and MaNGA datacubes at unprecedented computational speeds
        </p>
      </motion.div>
    </div>
  );
}

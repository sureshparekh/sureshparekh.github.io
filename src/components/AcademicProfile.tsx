"use client";

import { motion } from "framer-motion";
import { FaGraduationCap, FaMicroscope, FaGithub, FaEnvelope } from "react-icons/fa";
import { SiGooglescholar, SiOrcid } from "react-icons/si";

const AdsLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <mask id="ads-orbit-mask">
        {/* Everything white is visible, everything black is hidden */}
        <rect width="100" height="100" fill="white" />
        {/* Cut out space for the handle so the orbit doesn't cross it */}
        <line x1="38.5" y1="61.5" x2="14.5" y2="85.5" stroke="black" strokeWidth="22" />
        {/* Cut out space around the dot */}
        <circle cx="24.5" cy="19.5" r="14" fill="black" />
        {/* Cut out space for the main magnifying glass so the orbit stops cleanly */}
        <circle cx="52.5" cy="47.5" r="28" fill="black" />
      </mask>
    </defs>

    {/* Orbital ring */}
    <circle
      cx="52.5"
      cy="47.5"
      r="39.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      mask="url(#ads-orbit-mask)"
    />

    {/* Orbiting dot/moon */}
    <circle cx="24.5" cy="19.5" r="8" fill="currentColor" />

    {/* Magnifying Glass Handle */}
    <line
      x1="38.5"
      y1="61.5"
      x2="16.5"
      y2="83.5"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
    />

    {/* Magnifying Glass Ring */}
    <circle
      cx="52.5"
      cy="47.5"
      r="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
    />

    {/* The lowercase 'a' */}
    <text
      x="53"
      y="61"
      fontFamily="'Times New Roman', Times, serif"
      fontWeight="bold"
      fontSize="45"
      textAnchor="middle"
      fill="currentColor"
    >
      a
    </text>
  </svg>
);

export default function AcademicProfile() {
  const experiences = [
    {
      year: "Feb 2025 - Present",
      title: "PhD Student in Astrophysics",
      institution: "UFRGS, Brazil",
      description:
        "Developing BRAIN, a simulation-based inference & GPU accelerated tool for stellar population synthesis of specs and datacubes aiming to process JWST and Manga datasets.",
      icon: <FaMicroscope className="w-6 h-6 text-white" />,
    },
    {
      year: "Aug 2023 - Present",
      title: "Research Assistant (Advisor: Dr. Viral Parekh)",
      institution: "NRAO, USA",
      description:
        "Analyzed Radio and X-ray data of Galaxy clusters to study radio halos/relics and extended emissions from GC's central regions.",
      icon: <FaMicroscope className="w-6 h-6 text-white" />,
    },
    {
      year: "Jun 2023 - Present",
      title: "Research Assistant (Advisors: Dr. Ray, Dr. Yadav, Dr. Sharma)",
      institution: "GLA University, Mathura, India",
      description:
        "Developed a pipeline to determine cosmological model parameters using observational data (OHD, BAO, Pantheon) and performed cosmography.",
      icon: <FaMicroscope className="w-6 h-6 text-white" />,
    },
    {
      year: "Aug 2021 - May 2023",
      title: "Master of Science in Physics",
      institution: "Savitribai Phule Pune University",
      description: "Pune, India.",
      icon: <FaGraduationCap className="w-6 h-6 text-white" />,
    },
    {
      year: "Sep 2022 - Dec 2022",
      title: "Research Assistant (Advisor: Prof. Avinash Deshpande)",
      institution: "IUCAA, India",
      description:
        "Analyzed Vela Pulsar timing using Ooty Radio Telescope data by implementing Fourier Transform and dedispersion techniques.",
      icon: <FaMicroscope className="w-6 h-6 text-white" />,
    },
    {
      year: "Aug 2022 - May 2023",
      title: "Research Assistant (Advisor: Dr. Vaidehi Paliya)",
      institution: "IUCAA, India",
      description:
        "Developed a pipeline to detect X-ray-to-radio offsets from low-count X-ray images using Bayesian Analysis and the LIRA statistical tool.",
      icon: <FaMicroscope className="w-6 h-6 text-white" />,
    },
    {
      year: "May 2018 - April 2021",
      title: "Bachelor of Science in Physics",
      institution: "St. Xavier's College",
      description: "Ahmedabad, India. Gold Medal for excellence in research for Bachelor's thesis.",
      icon: <FaGraduationCap className="w-6 h-6 text-white" />,
    },
  ];

  const publications = [
    {
      title: "A power law solution for FLRW Universe with observational Constraints",
      authors: "L. Sharma, S. Parekh, S. Maurya, K. Singh, S. Ray, et al.",
      status: "arXiv:2310.18665 (PRD Under Review)",
      link: "https://arxiv.org/abs/2310.18665",
    },
    {
      title: "Modified power law cosmology: theoretical scenarios and observational constraints",
      authors: "L. Sharma, S. Parekh, S. Ray, A. Yadav et al.",
      status: "IJGMMP (Under Review)",
      link: "#",
    },
    {
      title: "Constraining anisotropic universe under f (R, T ) theory of gravity",
      authors: "L. Sharma, S. Parekh, S. Ray, A. Yadav et al.",
      status: "Preprints.org",
      link: "https://www.preprints.org/",
    },
    {
      title: "A power law solution for Bianchi-I Universe with observational constraints",
      authors: "L. Sharma, S. Parekh, S. Ray, A. Yadav et al.",
      status: "arXiv:2402.13596 (MDPI Under Review)",
      link: "https://arxiv.org/abs/2402.13596",
    },
  ];

  const socials = [
    {
      name: "Google Scholar",
      icon: <SiGooglescholar className="w-8 h-8 group-hover:text-blue-400 transition-colors" />,
      url: "https://scholar.google.com/citations?user=E2m8pzwAAAAJ&hl=en",
    },
    {
      name: "NASA ADS",
      icon: <AdsLogo className="w-8 h-8 group-hover:text-amber-500 transition-colors" />,
      url: "https://ui.adsabs.harvard.edu/search/q=author%3A%22Parekh%2C%20Suresh%22&sort=date%20desc%2C%20bibcode%20desc&p_=0",
    },
    {
      name: "ORCID",
      icon: <SiOrcid className="w-8 h-8 group-hover:text-green-400 transition-colors" />,
      url: "https://orcid.org/0009-0008-5705-2908",
    },
    {
      name: "GitHub",
      icon: <FaGithub className="w-8 h-8 group-hover:text-gray-300 transition-colors" />,
      url: "https://github.com/sureshparekh",
    },
    {
      name: "Email",
      icon: <FaEnvelope className="w-8 h-8 group-hover:text-red-400 transition-colors" />,
      url: "mailto:suresh.parekh@ufrgs.br",
    },
  ];

  return (
    <section className="relative z-20 min-h-screen bg-[#121212] py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-16">
            Academic Journey
          </h2>
          <div className="relative border-l border-white/20 ml-4 md:ml-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="mb-12 ml-10 relative"
              >
                {/* Timeline Node */}
                <div className="absolute -left-[3.4rem] top-1 w-12 h-12 rounded-full bg-[#121212] border-2 border-white/20 flex items-center justify-center">
                  {exp.icon}
                </div>
                
                <span className="inline-block py-1 px-3 rounded text-sm font-medium bg-white/10 text-white mb-3">
                  {exp.year}
                </span>
                <h3 className="text-2xl font-bold text-white mb-1">{exp.title}</h3>
                <h4 className="text-lg text-emerald-400 mb-3">{exp.institution}</h4>
                <p className="text-gray-400 max-w-2xl leading-relaxed">{exp.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Publications Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-12">
            Selected Publications
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {publications.map((pub, index) => (
              <motion.a
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View publication: ${pub.title}`}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.3)" }}
                className="group p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all block"
              >
                <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {pub.title}
                </h3>
                <p className="text-gray-400 mb-4">{pub.authors}</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300">
                  {pub.status}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Connect / Socials Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="text-center pt-16 border-t border-white/10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
            Let's Connect
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Connect on ${social.name}`}
                className="group flex flex-col items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  {social.icon}
                </div>
                <span className="text-sm font-medium">{social.name}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

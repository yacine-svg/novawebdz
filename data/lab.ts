import type { L } from "@/locales/translations";

/* AI / data / full-stack projects shown in the "Lab" section.
   Put the exact repository address in `repo` (the profile is used by default). */

export type LabProject = {
  title: L;
  text: L;
  tags: string[];
  status: L;
  repo: string;
};

const profile = "https://github.com/yacine-svg";

export const lab: LabProject[] = [
  {
    title: { fr: "Résumé vidéo agentique", en: "Agentic video summarization" },
    text: {
      fr: "Un système d'agents IA qui repère les scènes importantes d'une vidéo et rédige un résumé adapté à ce que l'utilisateur cherche.",
      en: "A multi-agent AI system that finds the key scenes of a video and writes a summary tailored to what the user is looking for.",
    },
    tags: ["Python", "LLM", "Computer vision", "Agents"],
    status: { fr: "Projet de master · en cours", en: "MSc project · in progress" },
    repo: profile,
  },
  {
    title: { fr: "Rapports fidèles avec des LLM", en: "Faithful report generation with LLMs" },
    text: {
      fr: "Générer des rapports à partir de données avec un grand modèle de langage, et vérifier que chaque phrase reste fidèle aux sources.",
      en: "Generating reports from data with a large language model, and checking that every sentence stays faithful to the sources.",
    },
    tags: ["Python", "LLM", "NLP", "Evaluation"],
    status: { fr: "Atelier de master · 2026", en: "MSc workshop · 2026" },
    repo: profile,
  },
  {
    title: { fr: "OmniPad-PS5", en: "OmniPad-PS5" },
    text: {
      fr: "Contribution à un projet open source qui fait passer une manette Xbox 360 pour une manette PS5 : lecture des entrées, traduction et envoi.",
      en: "Contribution to an open-source project that makes an Xbox 360 controller work as a PS5 controller: reading inputs, translating and forwarding them.",
    },
    tags: ["Open source", "Gamepad", "PS5"],
    status: { fr: "Contribution open source", en: "Open-source contribution" },
    repo: profile,
  },
  {
    title: { fr: "Ce portfolio", en: "This portfolio" },
    text: {
      fr: "Une rue d'Alger en 3D construite entièrement en code, sans modèle externe, avec une version 2D pour les téléphones.",
      en: "A 3D Algiers street built entirely in code, with no external models, plus a 2D version for phones.",
    },
    tags: ["Next.js", "TypeScript", "React Three Fiber", "GSAP"],
    status: { fr: "En ligne", en: "Live" },
    repo: profile,
  },
];

/* Skills web in the About section. `links` draws the threads between nodes. */
export const skills = {
  nodes: [
    { id: "next", label: "Next.js", group: "web" },
    { id: "react", label: "React", group: "web" },
    { id: "ts", label: "TypeScript", group: "web" },
    { id: "three", label: "Three.js", group: "web" },
    { id: "gsap", label: "GSAP", group: "web" },
    { id: "tw", label: "Tailwind", group: "web" },
    { id: "ui", label: "UI design", group: "design" },
    { id: "django", label: "Django", group: "back" },
    { id: "python", label: "Python", group: "back" },
    { id: "ai", label: "AI / ML", group: "ai" },
    { id: "llm", label: "LLM", group: "ai" },
    { id: "data", label: "Data Science", group: "ai" },
  ],
  links: [
    ["next", "react"],
    ["react", "ts"],
    ["next", "ts"],
    ["react", "three"],
    ["three", "gsap"],
    ["gsap", "ui"],
    ["tw", "ui"],
    ["next", "tw"],
    ["ui", "react"],
    ["next", "django"],
    ["django", "python"],
    ["python", "ai"],
    ["ai", "llm"],
    ["ai", "data"],
    ["data", "python"],
    ["llm", "python"],
    ["ts", "django"],
  ] as [string, string][],
};

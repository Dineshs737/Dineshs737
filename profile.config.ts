import { ProfileConfig } from "./src/interface/ProfileConfig.interface";

const config: ProfileConfig = {
  defaults: {
    name: "Dineshs737",
    location: "Srilanka, Mannar",
    bio: "Undergraduate Student",
    company: "@Learning",
    blog: "github.com/Dineshs737",
  },
  techStack: [
    {
      name: "React",
      color: "#61dafb",
      iconType: "svg",
      iconData: `<circle cx="0" cy="0" r="4" fill="#61dafb"/>
        <ellipse cx="0" cy="0" rx="15" ry="6" fill="none" stroke="#61dafb" stroke-width="2"/>
        <ellipse cx="0" cy="0" rx="15" ry="6" fill="none" stroke="#61dafb" stroke-width="2" transform="rotate(60)"/>
        <ellipse cx="0" cy="0" rx="15" ry="6" fill="none" stroke="#61dafb" stroke-width="2" transform="rotate(120)"/>`,
    },
    {
      name: "TypeScript",
      color: "#3178c6",
      iconType: "rect-text",
      iconData: "TS",
    },
    {
      name: "Node.js",
      color: "#68a063",
      iconType: "svg",
      iconData: `<path d="M0,-12 L10.4,-6 L10.4,6 L0,12 L-10.4,6 L-10.4,-6 Z" fill="none" stroke="#68a063" stroke-width="2.5"/>
        <path d="M0,-12 L0,12 M-5.2,3 L0,6 L5.2,3" stroke="#68a063" stroke-width="2.5" fill="none"/>`,
    },
    {
      name: "Python",
      color: "#ffd43b",
      iconType: "svg",
      iconData: `<path d="M-9,-9 L-9,-2 C-9,0 -6,0 -3,0 L3,0 C6,0 9,0 9,-2 L9,-9 M9,9 L9,2 C9,0 6,0 3,0 L-3,0 C-6,0 -9,0 -9,2 L-9,9" fill="none" stroke="#3776ab" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M-9,-9 L-9,-2 C-9,0 -6,0 -3,0 L3,0 C6,0 9,0 9,-2 L9,-9" fill="#3776ab" opacity="0.4"/>
        <path d="M9,9 L9,2 C9,0 6,0 3,0 L-3,0 C-6,0 -9,0 -9,2 L-9,9" fill="#ffd43b" opacity="0.4"/>
        <circle cx="-6" cy="-6" r="2" fill="#ffd43b"/>
        <circle cx="6" cy="6" r="2" fill="#3776ab"/>`,
    },
    {
      name: "JavaScript",
      color: "#f7df1e",
      iconType: "rect-text",
      iconData: "JS",
    },
    {
      name: "Docker",
      color: "#2496ed",
      iconType: "svg",
      iconData: `<rect x="-12" y="-2" width="5" height="5" fill="#2496ed"/>
        <rect x="-6" y="-2" width="5" height="5" fill="#2496ed"/>
        <rect x="0" y="-2" width="5" height="5" fill="#2496ed"/>
        <rect x="-6" y="-8" width="5" height="5" fill="#2496ed"/>
        <rect x="0" y="-8" width="5" height="5" fill="#2496ed"/>
        <rect x="6" y="-8" width="5" height="5" fill="#2496ed"/>
        <path d="M-12,4 L12,4 Q14,4 14,6 L14,8 Q14,9 13,9 L-11,9 Q-12,9 -12,8 Z" fill="#2496ed"/>
        <path d="M-14,11 Q-12,12 -10,11 Q-8,10 -6,11 Q-4,12 -2,11" stroke="#2496ed" stroke-width="1.5" fill="none"/>`,
    },
    {
      name: "AWS",
      color: "#ff9900",
      iconType: "svg",
      iconData: `<path d="M-12,5 Q0,10 12,5" stroke="#ff9900" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M-8,-8 L-4,-2 L-12,-2 Z" fill="#ff9900"/>
        <path d="M4,-8 L8,-2 L0,-2 Z" fill="#ff9900"/>
        <path d="M-4,-5 L0,2 L-8,2 Z" fill="#ff9900" opacity="0.7"/>
        <path d="M8,-5 L12,2 L4,2 Z" fill="#ff9900" opacity="0.7"/>`,
    },
    {
      name: "MySQL",
      color: "#4479a1",
      iconType: "svg",
      iconData: `<path d="M-8,-3 Q-6,-9 0,-9 Q6,-9 9,-5 Q10,-2 9,1 Q8,5 6,7 L5,10 Q4,12 3,11 Q2,10 3,8" fill="none" stroke="#4479a1" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="-3" cy="-6" r="2" fill="#4479a1"/>
        <path d="M6,7 Q7,6 8,7" stroke="#4479a1" stroke-width="2" fill="none"/>
        <ellipse cx="-6" cy="4" rx="5" ry="2.5" fill="none" stroke="#00758f" stroke-width="2"/>
        <line x1="-11" y1="4" x2="-11" y2="9" stroke="#00758f" stroke-width="2"/>
        <line x1="-1" y1="4" x2="-1" y2="9" stroke="#00758f" stroke-width="2"/>
        <ellipse cx="-6" cy="9" rx="5" ry="2.5" fill="none" stroke="#00758f" stroke-width="2"/>`,
    },
  ],
  quote: "Building cool stuff with code",
  socialLinks: [
    {
      platform: "GitHub",
      label: "Dineshs737",
      url: "https://github.com/Dineshs737",
      color: "181717",
      logo: "github",
    },
    {
      platform: "LinkedIn",
      label: "Connect",
      url: "https://linkedin.com/in/yourprofile",
      color: "0A66C2",
      logo: "linkedin",
    },
    {
      platform: "Twitter",
      label: "Follow",
      url: "https://twitter.com/yourhandle",
      color: "1DA1F2",
      logo: "twitter",
    },
  ],
  svg: {
    width: 1400,
    height: 1050,
  },
  theme: "dark",
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "Java"],
    frontend: ["React", "HTML/CSS", "Tailwind"],
    backend: ["Node.js", "Express", "SpringBoot"],
    databases: ["MySQL", "PostgreSQL", "MongoDB"],
    tools: ["Git", "Docker", "Neovim", "VS Code"],
    learning: ["Kubernetes", "GraphQL", "Rust"],
  },
};

export default config;

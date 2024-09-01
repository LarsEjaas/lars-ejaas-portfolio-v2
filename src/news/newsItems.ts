import type { CardInfo } from "../components/carousel/Carousel.astro";

type NewsFeed = (typeof newsFeed)[number];

type NewsItems = {
  da: Record<NewsFeed, CardInfo>;
  en: Record<NewsFeed, CardInfo>;
};

/**
 * To add a new news item, add an id to the newsFeed array and add info to the newsObject.
 */

const newsFeed = [
  "welcome",
  "skillsTimeline",
  "letter",
  "makingOf",
  "bruceWillis",
  "sallingGroup",
  "twitter",
  "updatedSkills",
  "AccuRanker",
] as const;

/**
 * The newsObject is provided in a cronological order, so: latest news should be at the bottom.
 *
 * //============================================
 * @example
 * // Template for adding a new news item:
 * title: '',
 * description: '',
 * date: '',
 * imageSrc: '',
 * imageAlt: '',
 * href: '',
 * outline: '',
 */
const newsObject = {
  da: {
    welcome: {
      title: "Velkommen til min nye hjemmeside",
      description:
        "Her i dette feed kan du løbende følge med i opdateringer på siden.",
      date: "28. februar 2021",
      imageSrc: "ejaas_logo.png",
      imageAlt: "",
      href: "/da/",
      outline: "1",
    },
    skillsTimeline: {
      title: "Få et overblik over mine kompetencer",
      description:
        "Her får du et overblik over mine evner indenfor webudvikling og -design.",
      date: "1. marts 2021",
      imageSrc: "Skills_timeline.jpg",
      imageAlt: "Visuel oversigt over kompetencer for lars ejaas",
      href: "/kompetencer/",
      outline: "2",
    },
    letter: {
      title: "Kontakt mig direkte",
      description: "Du kan skrive en besked til mig direkte her fra siden.",
      date: "1. marts 2021",
      imageSrc: "hand_holding_letter.jpg", // Assuming the extension
      imageAlt: "Hånd der holder et brev",
      href: "/",
      outline: "4",
    },
    makingOf: {
      title: "Om LarsEjaas.com",
      description: "Læs mere om udviklingen af denne hjemmeside.",
      date: "11. maj 2021",
      imageSrc: "lars_ejaas_com_timeline.jpg",
      imageAlt: "Screenshot mosaik fra larsejaas.com",
      href: "/portfolio/#mosaic/",
      outline: "2",
    },
    bruceWillis: {
      title: "En hyldest til Bruce Willis",
      description:
        "Læs mere om mit seneste projekt, der hylder en af Hollywoods største filmstjerner.",
      date: "13. maj 2021",
      imageSrc: "bruce_willis_rocks.jpg", // Assuming the extension
      imageAlt: "Screenshot fra siden bruce-willis.rocks",
      href: "/portfolio/#brucewillis/",
      outline: "3",
    },
    sallingGroup: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
    twitter: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
    updatedSkills: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
    AccuRanker: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
  },
  en: {
    welcome: {
      title: "Welcome to my New Website",
      description:
        "In this feed you can keep up to date with any updates on the page.",
      date: "February 28th, 2021",
      imageSrc: "ejaas_logo.png",
      imageAlt: "",
      href: "/",
      outline: "1",
    },
    skillsTimeline: {
      title: "Get an Overview of my Development Skills",
      description:
        "Here you get an overview of my abilities in web development and -design.",
      date: "March 1st, 2021",
      imageSrc: "Skills_timeline.jpg",
      imageAlt: "Visual overview of skills for lars ejaas",
      href: "/en/kompetencer/",
      outline: "2",
    },
    letter: {
      title: "Write to me Directly",
      description: "You can write a message to me directly from this webpage.",
      date: "March 1st, 2021",
      imageSrc: "hand_holding_letter.jpg", // Assuming the extension
      imageAlt: "Hand holding a letter",
      href: "/",
      outline: "4",
    },
    makingOf: {
      title: "About LarsEjaas.com",
      description: "Read more about how I made this page.",
      date: "May 11th, 2021",
      imageSrc: "lars_ejaas_com_timeline.jpg", // Assuming the extension
      imageAlt: "Screenshot mosaic from larsejaas.com",
      href: "/en/portfolio/#mosaic/",
      outline: "2",
    },
    bruceWillis: {
      title: "A Tribute to Bruce Willis",
      description:
        "Read about my latest project, celebrating one of Hollywood's greatest movie stars.",
      date: "May 13th, 2021",
      imageSrc: "bruce_willis_rocks.jpg", // Assuming the extension
      imageAlt: "Screenshot from bruce-willis.rocks",
      href: "/en/portfolio/#brucewillis/",
      outline: "3",
    },
    sallingGroup: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
    twitter: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
    updatedSkills: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
    AccuRanker: {
      title: "",
      description: "",
      date: "",
      imageSrc: "",
      imageAlt: "",
      href: "",
      outline: "",
    },
  },
} as const satisfies NewsItems;

export const newsItems = {
  da: Object.entries(newsObject.da).map(([_key, value]) => value),
  en: Object.entries(newsObject.en).map(([_key, value]) => value),
};

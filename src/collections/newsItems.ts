import type { CardInfo } from '@components/carousel/Carousel.astro';

type NewsFeed = (typeof newsFeed)[number];

type NewsItems = {
  da: Record<NewsFeed, CardInfo>;
  en: Record<NewsFeed, CardInfo>;
};

/**
 * To add a new news item, add an id to the newsFeed array and add info to the newsObject.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const newsFeed = [
  'welcome',
  'skillsTimeline',
  'letter',
  'makingOf',
  'bruceWillis',
  'salling_group',
  'twitter',
  'updatedSkills',
  'accuRanker',
  'friggTech',
  'bluesky',
  'v2',
  'jobseeking',
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
      title: 'Velkommen til min nye hjemmeside',
      description:
        'Her i dette feed kan du løbende følge med i opdateringer på siden.',
      date: '28. februar 2021',
      imageSrc: 'ejaas_logo.png',
      imageAlt:
        'Et turkis og hvidt logo med ordet »ejaas« på en fremtrædende plads.',
      href: '/da/arbejde/#larsEjaasComV1',
      outline: '1',
    },
    skillsTimeline: {
      title: 'Få et overblik over mine kompetencer',
      description:
        'Her får du et overblik over mine evner indenfor webudvikling og -design.',
      date: '1. marts 2021',
      imageSrc: 'skills_timeline.png',
      imageAlt:
        'Et gitter af logoer for webudviklingsværktøjer og programmeringssprog på en mørk turkis baggrund.',
      href: '/da/kompetencer/',
      outline: '2',
    },
    letter: {
      title: 'Kontakt mig direkte',
      description: 'Du kan skrive en besked til mig direkte her fra siden.',
      date: '1. marts 2021',
      imageSrc: 'hand_holding_letter.jpg',
      imageAlt: 'Hånd, der holder et brev på en lyseblå baggrund.',
      href: '/da/arkiv/kontakt/',
      outline: '4',
    },
    makingOf: {
      title: 'Om LarsEjaas.com',
      description: 'Læs mere om udviklingen af denne hjemmeside.',
      date: '11. maj 2021',
      imageSrc: 'lars_ejaas_com_timeline.png',
      imageAlt:
        'Flere vinklede smartphoneskærme viser farverig grafik og tekst, herunder logoer og abstrakte designs, på en turkis gitterbaggrund.',
      href: '/da/arbejde/#larsEjaasComV1',
      outline: '2',
    },
    bruceWillis: {
      title: 'En hyldest til Bruce Willis',
      description:
        'Læs mere om mit seneste projekt, der hylder en af Hollywoods største filmstjerner.',
      date: '13. maj 2021',
      imageSrc: 'bruce_willis_rocks.png',
      imageAlt:
        'Sepiatonet billede af Bruce Willis med filmplakater for »Cosmic Sin« og »Breach« til højre. Teksten lyder »Bruce Willis« og »2021 Cosmic Sin«.',
      href: '/da/arbejde/#bruceWillis',
      outline: '3',
    },
    salling_group: {
      title: 'Frontend udvikler hos Salling Group',
      description:
        'Jeg ser tilbage på mine første 4 måneder hos Salling Group: \nDet har været en fantastisk lærerig oplevelse indtil videre i et talentfuldt team.',
      date: '10. februar 2022',
      imageSrc: 'salling_group.png',
      imageAlt:
        'Hvid tekst »salling group« på en mørk blågrøn baggrund; ren, moderne skrifttype formidler professionalisme og enkelhed.',
      href: '/da/arbejde/#sallingGroup',
      outline: 'gold',
    },
    twitter: {
      title: 'Følg mig på Twitter',
      description:
        'Her skriver jeg om min passion for programmering, teknologi og mit arbejde som udvikler.',
      date: '17. februar 2022',
      imageSrc: 'twitter_timeline.png',
      imageAlt:
        'En stiliseret blå fuglesilhuet, der ligner Twitter-logoet, er centreret på en baggrund med gradient, der går fra blågrøn til hvid. Tonen er slank og moderne.',
      href: 'https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5ELarsEjaas&screen_name=LarsEjaas',
      outline: '4',
    },
    updatedSkills: {
      title: 'Tjek min opdaterede kompetence profil',
      description:
        'Her får du et overblik over mine evner indenfor webudvikling og -design.',
      date: '17. februar 2022',
      imageSrc: 'updated_skills.png',
      imageAlt:
        'Et gitter af 3D-fliser indeholder forskellige farverige teknologilogoer, herunder React, JavaScript, HTML5 og WordPress, på en blå baggrund, hvilket giver en teknisk kyndig fornemmelse.',
      href: '/kompetencer/',
      outline: '1',
    },
    accuRanker: {
      title: 'Nyt job hos AccuRanker',
      description:
        '1. maj starter jeg ud i et nyt spændende job som frontend-udvikler hos AccuRanker.',
      date: '29. april 2022',
      imageSrc: 'accuranker_timeline.png',
      imageAlt:
        'Lys, blågrøn baggrund med et diskret mønster. Et gult firkantet logo med en hvid bølge ved siden af fed, sort tekst med teksten »AccuRanker«, som giver en moderne, professionel tone.',
      href: '/da/arbejde/#accuRanker',
      outline: '3',
    },
    friggTech: {
      title: 'Nyt job hos Frigg Tech',
      description:
        'Jeg er begejstret for at offentliggøre at jeg startede i nyt job hos Frigg Tech som frontend-udvikler pr. 1. januar.',
      date: '1. januar 2025',
      imageSrc: 'frigg_tech.png',
      imageAlt:
        'Et moderne logo med ordet »FRIGG« i lyseblå på en mørk, abstrakt baggrund, der ligner en bygningsfacade, og som signalerer innovation og elegance.',
      href: '/work/#friggTech',
      outline: '4',
    },
    bluesky: {
      title: 'Nu kan du finde mig på Bluesky',
      description:
        'Alle de udviklere, jeg følger, er skiftet til Bluesky, så jeg tænkte, det var tid til at prøve noget nyt!\n\nKom og find mig her!',
      date: '20. januar 2025',
      imageSrc: 'bluesky.png',
      imageAlt:
        'Nærbillede af en smartphone med et sommerfuglelogo på en blå skærm mod en lys, delvis overskyet himmel. Scenen formidler en frisk, håbefuld stemning.',
      href: 'https://bsky.app/profile/larsejaas.bsky.social',
      outline: 'gold',
    },
    v2: {
      title: 'Redesignet hjemmeside',
      description:
        'Jeg har redesignet min hjemmeside fra bunden med et friskt nyt look og opdateret indhold.\n\nJeg håber du kan lide den!',
      date: '1. juni 2025',
      imageSrc: 'new_website.png',
      imageAlt:
        'En bærbar computer viser en hjemmeside med turkis tema for en frontend-udvikler. Funktionerne omfatter et profilbillede, navigationsikoner og en sektion med »Seneste nyt«.',
      href: '/',
      outline: '3',
    },
    jobseeking: {
      title: 'På udkig efter mit næste eventyr',
      description:
        'Ansætter du, kender du nogen, der gør, eller vil du bare gerne netværke?\n\nSend mig en besked!',
      date: '1. juni 2025',
      imageSrc: 'looking_for_work.jpg',
      imageAlt:
        'En bærbar computer viser en hjemmeside med turkis tema for en frontend-udvikler. Funktionerne omfatter et profilbillede, navigationsikoner og en sektion med »Seneste nyt«.',
      href: '/da/kontakt/',
      outline: '2',
    },
  },
  en: {
    welcome: {
      title: 'Welcome to my New Website',
      description:
        'In this feed you can keep up to date with any updates on the page.',
      date: 'February 28th, 2021',
      imageSrc: 'ejaas_logo.png',
      imageAlt:
        'A turquoise and white logo featuring the word "ejaas" prominently displayed.',
      href: '/work/#larsEjaasComV1',
      outline: '1',
    },
    skillsTimeline: {
      title: 'Get an Overview of my Development Skills',
      description:
        'Here you get an overview of my abilities in web development and -design.',
      date: 'March 1st, 2021',
      imageSrc: 'skills_timeline.png',
      imageAlt:
        'A grid of logos for web development tools and programming languages on a dark turquoise background.',
      href: '/skills/',
      outline: '2',
    },
    letter: {
      title: 'Write to me Directly',
      description: 'You can write a message to me directly from this webpage.',
      date: 'March 1st, 2021',
      imageSrc: 'hand_holding_letter.jpg',
      imageAlt: 'Hand holding a letter on a pale blue background.',
      href: '/archive/contact/',
      outline: '4',
    },
    makingOf: {
      title: 'About LarsEjaas.com',
      description: 'Read more about how I made this page.',
      date: 'May 11th, 2021',
      imageSrc: 'lars_ejaas_com_timeline.png',
      imageAlt:
        'Multiple angled smartphone screens display vibrant graphics and text, including logos and abstract designs, against a turquoise grid background.',
      href: '/work/#larsEjaasComV1',
      outline: '2',
    },
    bruceWillis: {
      title: 'A Tribute to Bruce Willis',
      description:
        "Read about my latest project, celebrating one of Hollywood's greatest movie stars.",
      date: 'May 13th, 2021',
      imageSrc: 'bruce_willis_rocks.png',
      imageAlt:
        'Sepia-toned image of Bruce Willis with movie posters for "Cosmic Sin" and "Breach" on the right. Text reads "Bruce Willis" and "2021 Cosmic Sin."',
      href: '/work/#bruceWillis',
      outline: '3',
    },
    salling_group: {
      title: 'Frontend Developer at Salling Group',
      description:
        "Reflecting on my first 4 months at Salling Group: \nIt's been a great learning experience so far within a talented team.",
      date: 'February 10th, 2022',
      imageSrc: 'salling_group.png',
      imageAlt:
        'White text "salling group" on a dark teal background; clean, modern font conveys professionalism and simplicity.',
      href: '/work/#sallingGroup',
      outline: 'gold',
    },
    twitter: {
      title: 'Follow me on Twitter',
      description:
        'I tweet about the stuff I am passionate about: Programming, technology, and my life as a developer.',
      date: 'February 17th, 2022',
      imageSrc: 'twitter_timeline.png',
      imageAlt:
        'A stylized blue bird silhouette, resembling the Twitter logo, is centered on a gradient background transitioning from teal to white. The tone is sleek and modern.',
      href: 'https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5ELarsEjaas&screen_name=LarsEjaas',
      outline: '4',
    },
    updatedSkills: {
      title: 'Check out my Updated list of Skills',
      description:
        'Here you get an overview of my abilities in web development and -design.',
      date: 'February 17th, 2022',
      imageSrc: 'updated_skills.png',
      imageAlt:
        'A grid of 3D tiles features various colorful technology logos, including React, JavaScript, HTML5, and WordPress, on a blue background, conveying a tech-savvy feel.',
      href: '/skills/',
      outline: '1',
    },
    accuRanker: {
      title: 'New job at AccuRanker',
      description:
        'I am excited to be joining AccuRanker on May 1st as a frontend developer.',
      date: 'April 29th, 2022',
      imageSrc: 'accuranker_timeline.png',
      imageAlt:
        'Bright, teal background with a subtle pattern. A yellow square logo with a white wave next to bold, black text reading "AccuRanker," conveying a modern, professional tone.',
      href: '/work#accuRanker/',
      outline: '3',
    },
    friggTech: {
      title: 'New job at Frigg Tech',
      description:
        'I am thrilled to announce that I have joined Frigg Tech as a frontend developer January 1st.',
      date: 'January 1st, 2025',
      imageSrc: 'frigg_tech.png',
      imageAlt:
        'A modern logo with the word "FRIGG" in light blue against a dark, abstract background resembling a building facade, conveying innovation and sleekness.',
      href: '/work/#friggTech',
      outline: '4',
    },
    bluesky: {
      title: 'I am now on Bluesky',
      description:
        'All the developers I follow have moved to Bluesky, so I thought it was time to try something new!\n\nCome find me here!',
      date: 'January 20th, 2025',
      imageSrc: 'bluesky.png',
      imageAlt:
        'Close-up of a smartphone with a butterfly logo on a blue screen, set against a bright, partly cloudy sky. The scene conveys a fresh, hopeful mood.',
      href: 'https://bsky.app/profile/larsejaas.bsky.social',
      outline: 'gold',
    },
    v2: {
      title: 'Redesigned Website',
      description:
        'I’ve completely redesigned my website with a fresh new look and updated content.\n\nI hope you like it!',
      date: 'June 1st, 2025',
      imageSrc: 'new_website.png',
      imageAlt:
        'A laptop displays a turquoise-themed website for a frontend developer. Features include a profile picture, navigation icons, and a "Latest News" section.',
      href: '/',
      outline: '3',
    },
    jobseeking: {
      title: 'Looking for my next adventure',
      description:
        'Are you hiring, know someone who is, or do you just want to network?\n\nDrop me a message!',
      date: 'June 1st, 2025',
      imageSrc: 'looking_for_work.jpg',
      imageAlt: '',
      href: '/contact/',
      outline: '2',
    },
  },
} as const satisfies NewsItems;

export const newsItems = {
  da: Object.entries(newsObject.da).map(([_key, value]) => value),
  en: Object.entries(newsObject.en).map(([_key, value]) => value),
};

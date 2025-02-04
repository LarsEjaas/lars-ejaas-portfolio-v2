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
  'v2',
  'friggTech',
  'bluesky',
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
      imageAlt: '',
      href: '/da/arbejde/#larsEjaasComV1',
      outline: '1',
    },
    skillsTimeline: {
      title: 'Få et overblik over mine kompetencer',
      description:
        'Her får du et overblik over mine evner indenfor webudvikling og -design.',
      date: '1. marts 2021',
      imageSrc: 'skills_timeline.png',
      imageAlt: 'Visuel oversigt over kompetencer for lars ejaas',
      href: '/da/kompetencer/',
      outline: '2',
    },
    letter: {
      title: 'Kontakt mig direkte',
      description: 'Du kan skrive en besked til mig direkte her fra siden.',
      date: '1. marts 2021',
      imageSrc: 'hand_holding_letter.jpg',
      imageAlt: 'Hånd der holder et brev',
      href: '/da/arkiv/kontakt/',
      outline: '4',
    },
    makingOf: {
      title: 'Om LarsEjaas.com',
      description: 'Læs mere om udviklingen af denne hjemmeside.',
      date: '11. maj 2021',
      imageSrc: 'lars_ejaas_com_timeline.png',
      imageAlt: 'Screenshot mosaik fra larsejaas.com',
      href: '/da/arbejde/#larsEjaasComV1',
      outline: '2',
    },
    bruceWillis: {
      title: 'En hyldest til Bruce Willis',
      description:
        'Læs mere om mit seneste projekt, der hylder en af Hollywoods største filmstjerner.',
      date: '13. maj 2021',
      imageSrc: 'bruce_willis_rocks.png',
      imageAlt: 'Screenshot fra siden bruce-willis.rocks',
      href: '/da/arbejde/#bruceWillis',
      outline: '3',
    },
    salling_group: {
      title: 'Frontend udvikler hos Salling Group',
      description:
        'Jeg ser tilbage på mine første 4 måneder hos Salling Group: \nDet har været en fantastisk lærerig oplevelse indtil videre i et talentfuldt team.',
      date: '10. februar 2022',
      imageSrc: 'salling_group.png',
      imageAlt: 'Salling Group logo',
      href: '/da/arbejde/#sallingGroup',
      outline: 'gold',
    },
    twitter: {
      title: 'Følg mig på Twitter',
      description:
        'Her skriver jeg om min passion for programmering, teknologi og mit arbejde som udvikler.',
      date: '17. februar 2022',
      imageSrc: 'twitter_timeline.png',
      imageAlt: 'Følg mig på Twitter',
      href: 'https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5ELarsEjaas&screen_name=LarsEjaas',
      outline: '4',
    },
    updatedSkills: {
      title: 'Tjek min opdaterede kompetence profil',
      description:
        'Her får du et overblik over mine evner indenfor webudvikling og -design.',
      date: '17. februar 2022',
      imageSrc: 'updated_skills.png',
      imageAlt: 'Opdateret kompetenceprofil',
      href: '/kompetencer/',
      outline: '1',
    },
    accuRanker: {
      title: 'Nyt job hos AccuRanker',
      description:
        '1. maj starter jeg ud i et nyt spændende job som frontend-udvikler hos AccuRanker.',
      date: '29. april 2022',
      imageSrc: 'accuranker_timeline.png',
      imageAlt: 'AccuRanker logo på turkis baggrund',
      href: '/da/arbejde/#accuRanker',
      outline: '3',
    },
    v2: {
      title: 'Redesignet hjemmeside',
      description:
        'Jeg har redesignet min hjemmeside fra bunden med et friskt nyt look og opdateret indhold.\n\nJeg håber du kan lide den!',
      date: '15. november 2024',
      imageSrc: 'new_website.png',
      imageAlt: 'Bærbar computer med skærmbillede af det nye hjemmesidedesign',
      href: '/',
      outline: '3',
    },
    friggTech: {
      title: 'Nyt job hos Frigg Tech',
      description:
        'Jeg er begejstret for at offentliggøre at jeg startede i nyt job hos Frigg Tech som frontend-udvikler pr. 1. januar.',
      date: '1. januar 2025',
      imageSrc: 'frigg_tech.png',
      imageAlt: 'Lysegrønt Frigg Tech logo på en mørkeblå baggrund',
      href: '/work/#friggTech',
      outline: '4',
    },
    bluesky: {
      title: 'Nu kan du finde mig på Bluesky',
      description:
        'Mange techies er for nylig skiftet til Bluesky, så jeg tænkte, at jeg ville se, hvad al den begejstring handler om.\n\nJeg ville elske, hvis du ville komme og være med!',
      date: '20. januar 2025',
      imageSrc: 'bluesky.png',
      imageAlt:
        'Bluesky sommerfugle-logo afbilledet på en telefon foran en skyfyldt blå himmel',
      href: 'https://bsky.app/profile/larsejaas.bsky.social',
      outline: 'gold',
    },
  },
  en: {
    welcome: {
      title: 'Welcome to my New Website',
      description:
        'In this feed you can keep up to date with any updates on the page.',
      date: 'February 28th, 2021',
      imageSrc: 'ejaas_logo.png',
      imageAlt: '',
      href: '/work/#larsEjaasComV1',
      outline: '1',
    },
    skillsTimeline: {
      title: 'Get an Overview of my Development Skills',
      description:
        'Here you get an overview of my abilities in web development and -design.',
      date: 'March 1st, 2021',
      imageSrc: 'skills_timeline.png',
      imageAlt: 'Visual overview of skills for lars ejaas',
      href: '/skills/',
      outline: '2',
    },
    letter: {
      title: 'Write to me Directly',
      description: 'You can write a message to me directly from this webpage.',
      date: 'March 1st, 2021',
      imageSrc: 'hand_holding_letter.jpg',
      imageAlt: 'Hand holding a letter',
      href: '/archive/contact/',
      outline: '4',
    },
    makingOf: {
      title: 'About LarsEjaas.com',
      description: 'Read more about how I made this page.',
      date: 'May 11th, 2021',
      imageSrc: 'lars_ejaas_com_timeline.png',
      imageAlt: 'Screenshot mosaic from larsejaas.com',
      href: '/work/#larsEjaasComV1',
      outline: '2',
    },
    bruceWillis: {
      title: 'A Tribute to Bruce Willis',
      description:
        "Read about my latest project, celebrating one of Hollywood's greatest movie stars.",
      date: 'May 13th, 2021',
      imageSrc: 'bruce_willis_rocks.png',
      imageAlt: 'Screenshot from bruce-willis.rocks',
      href: '/work/#bruceWillis',
      outline: '3',
    },
    salling_group: {
      title: 'Frontend Developer at Salling Group',
      description:
        "Reflecting on my first 4 months at Salling Group: \nIt's been a great learning experience so far within a talented team.",
      date: 'February 10th, 2022',
      imageSrc: 'salling_group.png',
      imageAlt: 'Salling Group logo',
      href: '/work/#sallingGroup',
      outline: 'gold',
    },
    twitter: {
      title: 'Follow me on Twitter',
      description:
        'I tweet about the stuff I am passionate about: Programming, technology, and my life as a developer.',
      date: 'February 17th, 2022',
      imageSrc: 'twitter_timeline.png',
      imageAlt: 'Follow me on Twitter',
      href: 'https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5ELarsEjaas&screen_name=LarsEjaas',
      outline: '4',
    },
    updatedSkills: {
      title: 'Check out my Updated list of Skills',
      description:
        'Here you get an overview of my abilities in web development and -design.',
      date: 'February 17th, 2022',
      imageSrc: 'updated_skills.png',
      imageAlt: 'Updated list of skills',
      href: '/skills/',
      outline: '1',
    },
    accuRanker: {
      title: 'New job at AccuRanker',
      description:
        'I am excited to be joining AccuRanker on May 1st as a frontend developer.',
      date: 'April 29th, 2022',
      imageSrc: 'accuranker_timeline.png',
      imageAlt: 'AccuRanker logo on top of a turquoise background',
      href: '/work#accuRanker/',
      outline: '3',
    },
    v2: {
      title: 'Redesigned Website',
      description:
        'I’ve completely redesigned my website with a fresh new look and updated content.\n\nI hope you like it!',
      date: 'November 15th, 2024',
      imageSrc: 'new_website.png',
      imageAlt: 'Laptop with screenshot of the new website design',
      href: '/',
      outline: '3',
    },
    friggTech: {
      title: 'New job at Frigg Tech',
      description:
        'I am thrilled to announce that I have joined Frigg Tech as a frontend developer January 1st.',
      date: 'January 1st, 2025',
      imageSrc: 'frigg_tech.png',
      imageAlt: 'Light green Frigg Tech logo on dark blue background',
      href: '/work/#friggTech',
      outline: '4',
    },
    bluesky: {
      title: 'I am now on Bluesky',
      description:
        'Lots of techies have recently switched to Bluesky, so I thought I’d see what all the fuss is about.\n\nI’d love it if you’d come and join me!',
      date: 'January 20th, 2025',
      imageSrc: 'bluesky.png',
      imageAlt:
        'Bluesky butterfly logo pictured on a phone in front of a blue sky',
      href: 'https://bsky.app/profile/larsejaas.bsky.social',
      outline: '2',
    },
  },
} as const satisfies NewsItems;

export const newsItems = {
  da: Object.entries(newsObject.da).map(([_key, value]) => value),
  en: Object.entries(newsObject.en).map(([_key, value]) => value),
};

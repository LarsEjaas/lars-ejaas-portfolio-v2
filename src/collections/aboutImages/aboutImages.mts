import type { Language } from '@i18n/utils';

export type ImageDetails = {
  /** Filename of the image excluding the file extension */
  imageName: string;
  titleDA: string;
  titleEN: string;
  id: string;
  imageAltDA: string;
  imageAltEN: string;
  imageDescriptionDA: string;
  imageDescriptionEN: string;
  hrefDA: string;
  hrefEN: string;
};

export const lightboxRoutes = {
  img1: ['cycling-hjorring-2011', 'cykling-hjorring-2011'],
  img2: ['cyclocross-2009', 'cykelcross-2009'],
  img3: ['cycling-hammel-2007', 'cykellob-hammel-2007'],
  // The following have identical hrefs in both languages,
  // so just store a single string instead of an array.
  img4: 'sonderborg-2009',
  img5: 'nice-2009',
  img6: 'esbjerg-2017',
  img7: 'half-marathon-aarhus-2015',
  img8: 'marselislobet-aarhus-2015',
  img9: 'aarhus-track-race-2017',
  img10: 'hannover-marathon-2016-2',
  img11: 'hannover-marathon-2016-1',
} as const;

type LightboxRoutes = typeof lightboxRoutes;
type Key = keyof LightboxRoutes;

function getLightboxHref<K extends Key, L extends Language>(
  id: K,
  lang: L
): LightboxRoutes[K] extends readonly [infer EN, infer DA]
  ? L extends 'en'
    ? EN
    : DA
  : LightboxRoutes[K] {
  const val = lightboxRoutes[id];
  if (Array.isArray(val)) {
    return lang === 'en' ? val[0] : val[1];
  }
  return val as any;
}

export function getLightboxSlugs(lang: Language) {
  return Object.values(lightboxRoutes).map((slug) =>
    typeof slug === 'string' ? slug : slug[lang === 'en' ? 0 : 1]
  );
}

export const aboutImagesInfo = [
  {
    imageName: 'hjørring_2011',
    titleDA: 'Cykelløb i Hjørring, 2011',
    titleEN: 'Cycling in Hjørring, 2011',
    id: 'img1',
    imageAltDA:
      'Landevejs-cykelrytter i farverigt racertøj poserer med sin cykel på en solskinsdag, iført solbriller og hjelm. Andre cyklister i baggrunden på en vej.',
    imageAltEN:
      'Road cyclist in a colorful racing outfit poses with his bike on a sunny day, sporting sunglasses and a helmet. Other cyclists in the background on a road.',
    imageDescriptionDA: 'Poserer efter et cykelløb i Hjørring, 2011.',
    imageDescriptionEN:
      'Posing after a cycling race in Hjørring, Denmark - 2011.',
    hrefEN: getLightboxHref('img1', 'en'),
    hrefDA: getLightboxHref('img1', 'da'),
  },
  {
    imageName: 'cross_fredericia_2009',
    titleDA: 'Cykelcross i Fredericia, 2009',
    titleEN: 'Cyclocross Race in Fredericia, 2009',
    id: 'img2',
    imageAltDA:
      'Cykelcrossrytter i et mudret cykelcrossløb, iført rødt og blåt dragt og hjelm, kører beslutsomt på en græsklædt, våd sti. Tilskuer i baggrunden i blå jakke.',
    imageAltEN:
      'Cyclo-cross bikerider in a muddy cyclocross race, wearing a red and blue kit and helmet, rides determinedly on a grassy, wet trail. Spectator in the background in a blue jacket.',
    imageDescriptionDA:
      'Cykelcross løb på en mudret vinterdag i Fredericia, 2009.',
    imageDescriptionEN:
      'Cyclocross racing on a muddy winter day in Fredericia, Denmark - 2009.',
    hrefEN: getLightboxHref('img2', 'en'),
    hrefDA: getLightboxHref('img2', 'da'),
  },
  {
    imageName: 'hammel_2007',
    titleDA: 'Cykelløb i Hammel, 2007',
    titleEN: 'Cycling Roadrace in Hammel, 2009',
    id: 'img3',
    imageAltDA:
      'To cykelryttere i et cykelløb, fokuserede og beslutsomme, mod en baggrund af slørede tilskuere og sikkerhedsbarrierer, der formidler hastighed og konkurrenceintensitet.',
    imageAltEN:
      'Two cyclists in a race, focused and determined, against a backdrop of blurred spectators and safety barriers, conveying speed and competition intensity.',
    imageDescriptionDA: 'Deltager i et dansk elite-cykelløb i Hammel, 2007.',
    imageDescriptionEN:
      'Competing in a Danish elite road race in Hammel, Denmark - 2007.',
    hrefEN: getLightboxHref('img3', 'en'),
    hrefDA: getLightboxHref('img3', 'da'),
  },
  {
    imageName: 'dm_sønderborg_2009',
    titleDA: 'DM i linieløb, Sønderborg - 2009',
    titleEN: 'Danish road-racing championships, Sønderborg - 2009',
    id: 'img4',
    imageAltDA:
      'Cykelrytter i rød og blå trøje kører på en sort landevejscykel under et løb, fokuseret og foroverbøjet. Sølvfarvet hjelm, røde solbriller. Bymiljø med metalbarrierer.',
    imageAltEN:
      'Cyclist in red and blue jersey riding a black roadbike during a race, focused and leaning forward. Silver helmet, red sunglasses. Urban setting with metal barriers.',
    imageDescriptionDA:
      'Deltager i de danske mesterskaber i linieløb i Sønderborg - 2009.',
    imageDescriptionEN:
      'Participating in the Danish road-racing championships - 2009.',
    hrefEN: getLightboxHref('img4', 'en'),
    hrefDA: getLightboxHref('img4', 'da'),
  },
  {
    imageName: 'nice_2009',
    titleDA: 'Træningslejr i Nice, 2009',
    titleEN: 'Training Camp in Nice, 2009',
    id: 'img5',
    imageAltDA:
      'Nærbillede af landevejscyklist i rød, hvid og blå trøje, der fører an i en gruppe, fokuseret og beslutsom. Iført solbriller og hjelm udstråler han intensitet.',
    imageAltEN:
      'Closeup of road-cyclist in a red, white, and blue jersey leads a group, focused and determined. Wearing sunglasses and a helmet, he conveys intensity.',
    imageDescriptionDA:
      'Træning med mit hold under en tidlig træningslejr i Nice, Frankrig - foråret 2009',
    imageDescriptionEN:
      'Training with my team during an early spring training camp in Nice, France - 2009.',
    hrefEN: getLightboxHref('img5', 'en'),
    hrefDA: getLightboxHref('img5', 'da'),
  },
  {
    imageName: 'esbjerg_2017',
    titleDA: 'Halvmarathon i Esbjerg 2017',
    titleEN: 'Halvmarathon in Esbjerg, Denmark 2017',
    id: 'img6',
    imageAltDA:
      'Løber i hvid tanktop og sorte shorts fotograferet bagfra på en solrig gade. Teksten »AGF ATLETIK« står på trøjen, og der er grønt langs vejen. Energisk tone.',
    imageAltEN:
      'Backshot of runner in a white tank top and black shorts running on a sunny street. The text "AGF ATLETIK" is on the shirt, and greenery lines the road. Energetic tone.',
    imageDescriptionDA: 'Deltager i Esbjerg City half - halvmaraton - 2017.',
    imageDescriptionEN:
      'Participating in a half marathon in Esbjerg, Denmark - 2017.',
    hrefEN: getLightboxHref('img6', 'en'),
    hrefDA: getLightboxHref('img6', 'da'),
  },
  {
    imageName: 'half_marathon_aarhus_2015',
    titleDA: 'Halvmarathon i Aarhus 2015',
    titleEN: 'Halvmarathon in Aarhus, Denmark 2015',
    id: 'img7',
    imageAltDA:
      'En atlet løber på en løbebane iført solbriller, en sort og hvid tanktop og et startnummer med nummeret 884.Stemningen er fokuseret og beslutsom.',
    imageAltEN:
      'Athlete running on a track, wearing sunglasses, a black and white tank top, and a race bib with the number 884. The mood is focused and determined.',
    imageDescriptionDA: 'Deltager i et halvmaraton i Aarhus - 2015.',
    imageDescriptionEN:
      'Participating in a half marathon in Aarhus, Denmark - 2015.',
    hrefEN: getLightboxHref('img7', 'en'),
    hrefDA: getLightboxHref('img7', 'da'),
  },
  {
    imageName: 'marselislobet_aarhus_2015',
    titleDA: 'Marselisløbet i Aarhus 2015',
    titleEN: 'Marselisløbet, Aarhus 2015',
    id: 'img8',
    imageAltDA:
      'Løber i blå tanktop og grønne solbriller, fokuseret udtryk, løber udendørs med startnummer 61245. Slørede tilskuere og træer langs gaden i baggrunden.',
    imageAltEN:
      'Runner in a blue tank top and green sunglasses, focused expression, runs outdoors with race bib 61245. Blurred spectators and trees line the street in the background.',
    imageDescriptionDA: 'Deltager i Marselisborgløbet i Aarhus - 2015.',
    imageDescriptionEN:
      'Participating in a local race in Aarhus, Denmark - 2015.',
    hrefEN: getLightboxHref('img8', 'en'),
    hrefDA: getLightboxHref('img8', 'da'),
  },
  {
    imageName: 'aarhus_track_race_2017',
    titleDA: '5000m. baneløb i Aarhus, 2017',
    titleEN: 'Local 5000m. trackrace in Aarhus, 2017',
    id: 'img9',
    imageAltDA:
      'Løber i hvid tanktop og sorte shorts løber på en løbebane, iført grønne solbriller og et ur. Løbere i baggrunden er slørede. Beslutsomt udtryk.',
    imageAltEN:
      'Runner in a white tank top and black shorts races on a track, wearing green sunglasses and a watch. Background runners are blurred. Determined expression.',
    imageDescriptionDA: 'Deltager i et lokalt 5000 m. baneløb i Aarhus - 2017.',
    imageDescriptionEN:
      'Participating in a local 5000m. track race in Aarhus, Denmark - 2017.',
    hrefEN: getLightboxHref('img9', 'en'),
    hrefDA: getLightboxHref('img9', 'da'),
  },
  {
    imageName: 'hannover_2016_2',
    titleDA: 'Hannover Marathon, Tyskland 2016',
    titleEN: 'Hannover Marathon, Germany 2016',
    id: 'img10',
    imageAltDA:
      'Løbere konkurrerer tæt i et bymaraton med synlige startnumre. En kameramand på motorcykel indfanger konkurrencen. Atmosfæren er intens.',
    imageAltEN:
      'Runners compete closely in a city marathon, with bib numbers visible. A cameraman on a motorcycle captures the action. The atmosphere is intense.',
    imageDescriptionDA: 'Deltager i Hannover Marathon, Tyskland - 2016.',
    imageDescriptionEN: 'Participating in Hannover Marathon, Germany - 2016.',
    hrefEN: getLightboxHref('img10', 'en'),
    hrefDA: getLightboxHref('img10', 'da'),
  },
  {
    imageName: 'hannover_2016_1',
    titleDA: 'Hannover Marathon, Tyskland 2016',
    titleEN: 'Hannover Marathon, Germany 2016',
    id: 'img11',
    imageAltDA:
      'Løbere i et maratonløb runder et sving på en gade i byen. De ser fokuserede og målrettede ud, iført nummererede startnumre og lyst sportstøj.',
    imageAltEN:
      'Runners in a marathon rounding a bend on a city street. They appear focused and determined, wearing numbered bibs and bright athletic gear.',
    imageDescriptionDA: 'Deltager i Hannover Marathon, Tyskland - 2016.',
    imageDescriptionEN: 'Participating in Hannover Marathon, Germany - 2016.',
    hrefEN: getLightboxHref('img11', 'en'),
    hrefDA: getLightboxHref('img11', 'da'),
  },
] as const satisfies readonly ImageDetails[];

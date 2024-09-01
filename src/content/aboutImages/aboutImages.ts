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

export const aboutImagesInfo = [
  {
    imageName: 'hjørring_2011',
    titleDA: 'Cykelløb i Hjørring, 2011',
    titleEN: 'Cycling in Hjørring, 2011',
    id: 'img1',
    imageAltDA:
      'Portrait of Lars Ejaas af a bicycle race in Hjørring, Denmark.',
    imageAltEN: 'Portræt af Lars Ejaas ved et cykelløb i Hjørring.',
    imageDescriptionDA: 'Poserer after et cykelløb i Hjørring.',
    imageDescriptionEN: 'Posing after a cycling race in Hjørring, Denmark.',
    hrefEN: 'cycling-hjorring-2011',
    hrefDA: 'cykling-hjorring-2011',
  },
  {
    imageName: 'cross_fredericia_2009',
    titleDA: 'Cykelcross i Fredericia, 2009',
    titleEN: 'Cyclocross Race in Fredericia, 2009',
    id: 'img2',
    imageAltDA:
      'Lars Ejaas under et cykelcross løb på et mudret græs-dækket spor.',
    imageAltEN:
      'Lars Ejaas racing a cyclocross bike on a muddy grass-covered trail.',
    imageDescriptionDA: 'Poserer after et cykelløb i Hjørring.',
    imageDescriptionEN:
      'Cyclocross racing on a muddy winter day in Fredericia, Denmark - 2009.',
    hrefEN: 'cyclocross-2009',
    hrefDA: 'cykelcross-2009',
  },
  {
    imageName: 'hammel_2007',
    titleDA: 'Cykelløb i Hammel, 2007',
    titleEN: 'Cycling Roadrace in Hammel, 2009',
    id: 'img3',
    imageAltDA: 'Lars Ejaas under et cykelløb i Hammel, Danmark.',
    imageAltEN: 'Lars Ejaas racing in an elite road race in Hammel, Denmark.',
    imageDescriptionDA: 'Deltager i et dansk elite-cykelløb i Hammel, 2007.',
    imageDescriptionEN:
      'Competing in a danish elite road race in Hammel, Denmark - 2007.',
    hrefEN: 'cycling-hammel-2007',
    hrefDA: 'cykellob-hammel-2007',
  },
  {
    imageName: 'dm_sønderborg_2009',
    titleDA: 'DM i linieløb, Sønderborg - 2009',
    titleEN: 'Danish road-racing championships, Sønderborg - 2009',
    id: 'img4',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'sonderborg-2009',
    hrefDA: 'sonderborg-2009',
  },
  {
    imageName: 'nice_2009',
    titleDA: 'Træningslejr i Nice, 2009',
    titleEN: 'Training Camp in Nice, 2009',
    id: 'img5',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'nice-2009',
    hrefDA: 'nice-2009',
  },
  {
    imageName: 'esbjerg_2017',
    titleDA: 'Halvmarathon i Esbjerg 2017',
    titleEN: 'Halvmarathon in Esbjerg, Denmark 2017',
    id: 'img6',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'esbjerg-2017',
    hrefDA: 'esbjerg-2017',
  },
  {
    imageName: 'half_marathon_aarhus_2015',
    titleDA: 'Halvmarathon i Aarhus 2015',
    titleEN: 'Halvmarathon in Aarhus, Denmark 2015',
    id: 'img7',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'half-marathon-aarhus-2015',
    hrefDA: 'half-marathon-aarhus-2015',
  },
  {
    imageName: 'marselislobet_aarhus_2015',
    titleDA: 'Marselisløbet i Aarhus 2015',
    titleEN: 'Marselisløbet, Aarhus 2015',
    id: 'img8',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'marselislobet-aarhus-2015',
    hrefDA: 'marselislobet-aarhus-2015',
  },
  {
    imageName: 'aarhus_track_race_2017',
    titleDA: '5000m. baneløb i Aarhus, 2017',
    titleEN: 'Local 5000m. trackrace in Aarhus, 2017',
    id: 'img9',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'aarhus-track-race-2017',
    hrefDA: 'aarhus-track-race-2017',
  },
  {
    imageName: 'hannover_2016_2',
    titleDA: 'Hannover Marathon, Tyskland 2016',
    titleEN: 'Hannover Marathon, Germany 2016',
    id: 'img10',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'hannover-marathon-2016-2',
    hrefDA: 'hannover-marathon-2016-2',
  },
  {
    imageName: 'hannover_2016_1',
    titleDA: 'Hannover Marathon, Tyskland 2016',
    titleEN: 'Hannover Marathon, Germany 2016',
    id: 'img11',
    imageAltDA: '',
    imageAltEN: '',
    imageDescriptionDA: '',
    imageDescriptionEN: '',
    hrefEN: 'hannover-marathon-2016-1',
    hrefDA: 'hannover-marathon-2016-1',
  },
] as const satisfies readonly ImageDetails[];

import type { ImageType } from '@customTypes/index';

export type ImageDetails = {
  imageName: string;
  title: string;
  id: string;
  imageSrc: ImageType;
  imageAltDA: string;
  imageAltEN: string;
  imageDescriptionDA: string;
  imageDescriptionEN: string;
  hrefDA: string;
  hrefEN: string;
};

export const aboutImagesInfo = [
  {
    imageName: 'cycling_hjørring_2011',
    title: 'Cycling in Hjørring, 2011',
    id: 'img1',
    imageSrc: 'hjørring_2011.png',
    imageAltDA:
      'Portrait of Lars Ejaas af a bicycle race in Hjørring, Denmark.',
    imageAltEN: 'Portræt af Lars Ejaas ved et cykelløb i Hjørring.',
    imageDescriptionDA: 'Poserer after et cykelløb i Hjørring.',
    imageDescriptionEN: 'Posing after a cycling race in Hjørring, Denmark.',
    hrefEN: 'cycling-hjorring-2011',
    hrefDA: 'cykling-hjorring-2011',
  },
  {
    imageName: 'cyclocross_2011',
    title: 'Cykelløb i Hjørring, 2011',
    id: 'img2',
    imageSrc: 'cross_2011.png',
    imageAltDA:
      'Portrait of Lars Ejaas af a bicycle race in Hjørring, Denmark.',
    imageAltEN: 'Portræt af Lars Ejaas ved et cykelløb i Hjørring.',
    imageDescriptionDA: 'Poserer after et cykelløb i Hjørring.',
    imageDescriptionEN: 'Posing after a cycling race in Hjørring, Denmark.',
    hrefEN: 'cyclocross-2011',
    hrefDA: 'cyklecross-2011',
  },
] as const satisfies readonly ImageDetails[];

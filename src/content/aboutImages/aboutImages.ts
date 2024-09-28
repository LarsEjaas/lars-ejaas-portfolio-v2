import type { ImageType } from '@customTypes/index';

type ImageDetails = {
  imageName: string;
  imageSrc: ImageType;
  imageAltDA: string;
  imageAltEN: string;
  imageDescriptionDA: string;
  imageDescriptionEN: string;
  href: string;
};

export const aboutImagesInfo: ImageDetails[] = [
  {
    imageName: 'cycling_hjørring_2011',
    imageSrc: 'hjørring_2011.png',
    imageAltDA:
      'Portrait of Lars Ejaas af a bicycle race in Hjørring, Denmark.',
    imageAltEN: 'Portræt af Lars Ejaas ved et cykelløb i Hjørring.',
    imageDescriptionDA: 'Poserer after et cykelløb i Hjørring.',
    imageDescriptionEN: 'Posing after a cycling race in Hjørring, Denmark.',
    href: 'image1',
  },
  {
    imageName: 'cyclocross_2011',
    imageSrc: 'cross_2011.png',
    imageAltDA:
      'Portrait of Lars Ejaas af a bicycle race in Hjørring, Denmark.',
    imageAltEN: 'Portræt af Lars Ejaas ved et cykelløb i Hjørring.',
    imageDescriptionDA: 'Poserer after et cykelløb i Hjørring.',
    imageDescriptionEN: 'Posing after a cycling race in Hjørring, Denmark.',
    href: 'image2',
  },
];

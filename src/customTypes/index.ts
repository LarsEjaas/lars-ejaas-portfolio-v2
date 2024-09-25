export enum ValidationPattern {
  email = '[a-zA-Z0-9._\\-]+@[a-zA-Z0-9._\\-]+\\.[a-zA-Z0-9_\\-]+',
}

export type ImageModule = {
  default: string;
};

export type SVGModule = {
  default: {
    src: string;
    width: number;
    height: number;
    format: 'svg';
  };
};

type ImageExtension = 'jpg' | 'png';

type Year = 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28;

type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

type DanishMonth =
  | 'januar'
  | 'februar'
  | 'marts'
  | 'april'
  | 'maj'
  | 'juni'
  | 'juli'
  | 'august'
  | 'september'
  | 'oktober'
  | 'november'
  | 'december';

type DayOfMonth =
  | '1st'
  | '2nd'
  | '3rd'
  | '4th'
  | '5th'
  | '6th'
  | '7th'
  | '8th'
  | '9th'
  | '10th'
  | '11th'
  | '12th'
  | '13th'
  | '14th'
  | '15th'
  | '16th'
  | '17th'
  | '18th'
  | '19th'
  | '20th'
  | '21st'
  | '22nd'
  | '23rd'
  | '24th'
  | '25th'
  | '26th'
  | '27th'
  | '28th'
  | '29th'
  | '30th'
  | '31st';

export type ImageType = `${string}.${ImageExtension}`;

export type SVGFileType = `${string}.svg`;

export type EnglishDate = `${Month} ${DayOfMonth}, 20${Year}`;

export type DanishDate = `${
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31}. ${DanishMonth} 20${Year}`;

export type ColorVariants =
  | 'princeton'
  | 'verdigris'
  | 'flirt'
  | 'aquamarine'
  | 'bluemunsell';

export type HTMLMarqueeTitle =
  `<h3 class="stylized-capitalized-text">${string}</h3>`;

export type HTMLMarqueeDescription = unknown;

/**
 * Type predicate to filter out empty instances of an array
 * Returns true if a value is not empty (i.e., not null or undefined).
 * @template TValue The type of the value to check.
 * @param {TValue|null|undefined} value The value to check.
 * @returns {value is TValue} True if the value is not empty.
 * @example
 * const arr = [1, null, 2, undefined, 3];
 * const nonEmpty = arr.filter(notEmpty);
 * // type of nonEmpty is number[]
 */
export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== undefined && value !== null;
}

/** Generic type guard function to check if `KeyType` is a key of `ObjectType`
 * @example 
 * if (hasProperty(keyToCheck, object)) {
  // Do something with the key - the type is now narrowed to keyof ObjectType
} 
 */
export function hasProperty<
  KeyType extends string,
  ObjectType extends Record<KeyType, any>,
>(key: KeyType, obj: ObjectType): key is KeyType & keyof ObjectType {
  return key in obj;
}

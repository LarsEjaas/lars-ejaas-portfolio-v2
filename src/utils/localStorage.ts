export const DARKMODE_KEY = 'ejaas_dark_mode' as const;
export const TRANSITION_TYPE = 'transition-type' as const;

const serializeJSON = <T>(value: T) => {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    throw new Error(`Failed to serialize the value ${value} hook.`);
  }
};

function deserializeJSON(value: string | undefined) {
  try {
    return value && JSON.parse(value);
  } catch {
    return value;
  }
}

const getItem = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch (_error) {
    console.warn('Failed to get value from localStorage');
    return null;
  }
};

const setItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (_error) {
    console.warn('Failed to set value to localStorage');
  }
};

/**
 * @example getValueFromLocalStorage('darkmode', false);
 * */
export function getValueFromLocalStorage<T>(key: string, defaultValue: T): T;
export function getValueFromLocalStorage<T>(key: string): T | undefined;
export function getValueFromLocalStorage<T>(
  key: string,
  defaultValue?: T
): T | undefined {
  const value = getItem(key);
  if (value) {
    return deserializeJSON(value) as T;
  }
  if (defaultValue) {
    return defaultValue;
  }
  return defaultValue;
}

export const setValueInLocalStorage = <T>(key: string, value: T) => {
  const serializedValue = serializeJSON(value);
  setItem(key, serializedValue);
};

import { getFocusableElements } from './keyboardArrowNavigation';
import { NODE_ENV } from 'astro:env/client';
const IS_DEV = NODE_ENV === 'development' || false;

type Position = {
  rowIndex: number;
  columnIndex: number;
};

const moveRight = (
  elementGrid: HTMLElement[][],
  { rowIndex, columnIndex }: Position
) => {
  if (!elementGrid[rowIndex]?.[columnIndex]) {
    return;
  }
  if (columnIndex + 1 < elementGrid[rowIndex].length) {
    elementGrid[rowIndex][columnIndex + 1]?.focus();
  }
};

const moveLeft = (
  elementGrid: HTMLElement[][],
  { rowIndex, columnIndex }: Position
) => {
  if (!elementGrid[rowIndex]?.[columnIndex]) {
    return;
  }
  if (columnIndex > 0) {
    elementGrid[rowIndex][columnIndex - 1]?.focus();
  }
};

const moveDown = (
  elementGrid: HTMLElement[][],
  { rowIndex, columnIndex }: Position
) => {
  if (!elementGrid[rowIndex]?.[columnIndex]) {
    return;
  }
  if (
    rowIndex < elementGrid.length - 1 &&
    (elementGrid[rowIndex + 1]?.length || 0) >= columnIndex + 1
  ) {
    elementGrid[rowIndex + 1]?.[columnIndex]?.focus();
    return;
  }
  elementGrid[0]?.[columnIndex]?.focus();
};

const moveUp = (
  elementGrid: HTMLElement[][],
  { rowIndex, columnIndex }: Position
) => {
  if (!elementGrid[rowIndex]?.[columnIndex]) {
    return;
  }
  if (rowIndex > 0) {
    elementGrid[rowIndex - 1]?.[columnIndex]?.focus();
    return;
  }
  // Check if the last row has enough columns
  if ((elementGrid[elementGrid.length - 1]?.length || 0) >= columnIndex + 1) {
    elementGrid[elementGrid.length - 1]?.[columnIndex]?.focus();
    return;
  }
  elementGrid[elementGrid.length - 2]?.[columnIndex]?.focus();
};

const findElementPosition = (
  grid: HTMLElement[][],
  targetElement: HTMLElement
): { rowIndex: number; columnIndex: number } | null => {
  if (!Array.isArray(grid) || grid.length === 0) {
    return null;
  }

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    const row = grid[rowIndex];

    if (Array.isArray(row)) {
      const columnIndex = row.indexOf(targetElement);
      if (columnIndex !== -1) {
        return { rowIndex, columnIndex };
      }
    }
  }

  return null; // Element not found
};
const createElementGrid = (elements: HTMLElement[], itemsPerRow: number) => {
  // Validate input
  if (
    !Array.isArray(elements) ||
    typeof itemsPerRow !== 'number' ||
    itemsPerRow < 3 ||
    itemsPerRow > 6
  ) {
    if (IS_DEV) {
      throw new Error(
        `Invalid input: Elements should be an array, found: ${elements}. itemsPerRow should be a number between 3 and 6, found: ${itemsPerRow}`
      );
    }
  }

  const grid = [];

  // Iterate through the elements
  for (let i = 0; i < elements.length; i += itemsPerRow) {
    // Slice the array to get itemsPerRow elements (or less for the last row)
    const row = elements.slice(i, i + itemsPerRow);
    grid.push(row);
  }

  return grid;
};

const handleKeyDown = (
  event: KeyboardEvent,
  hostElement: HTMLElement,
  tiles: HTMLElement[]
) => {
  if (
    (event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown') &&
    event.target instanceof HTMLElement
  ) {
    // Do not scroll the page when navigating with the arrow keys
    event.preventDefault();
    const activeElement = event.target;
    const hostElementStyle = getComputedStyle(hostElement);
    const itemsPerRow = Number(
      hostElementStyle.getPropertyValue('--items-in-row')
    );
    const elementGrid = createElementGrid(tiles, itemsPerRow);
    const position = findElementPosition(elementGrid, activeElement);
    if (!position) {
      return;
    }
    if (event.key === 'ArrowRight') {
      moveRight(elementGrid, position);
      return;
    }
    if (event.key === 'ArrowLeft') {
      moveLeft(elementGrid, position);
      return;
    }
    if (event.key === 'ArrowDown') {
      moveDown(elementGrid, position);
      return;
    }
    moveUp(elementGrid, position);
  }
  if (
    event.key === 'Enter' &&
    event.target instanceof HTMLElement &&
    event.target.dataset.active === 'true'
  ) {
    event.preventDefault();
  }
};

/**
 * Create keyboard navigation within this element. Replaces the
 * existing tab navigation with arrow keys navigation left/right.
 * @param {HTMLElement} hostElement - The element to initialize navigation within
 *
 * Each focusable element must manually be marked with the `data-arrow-nav="true"` attribute
 */
export const initializeTileArrowNavigation = (hostElement: HTMLElement) => {
  if (hostElement.dataset.arrowNavInitialized) {
    return;
  }

  const tiles = getFocusableElements(hostElement);
  if (!tiles.length) {
    console.warn(
      'No skill tile elements found. Arrow navigation not initialized.'
    );
    return;
  }

  tiles.forEach((element, index) => {
    element.addEventListener(
      'keydown',
      (e) => handleKeyDown(e, hostElement, tiles),
      {
        passive: false,
      }
    );
    if (index !== 0) {
      element.tabIndex = -1;
    } else {
      // This is needed in Safari to make the first element focusable
      element.tabIndex = 0;
    }
  });
  hostElement.dataset.arrowNavInitialized = 'true';
};

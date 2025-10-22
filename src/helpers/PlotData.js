import {Colors} from '../constants/Colors';

export const Plot1Data = [
  13, 14, 15, 16, 17, 18, 12, 221, 222, 223, 224, 225, 11, 10, 9, 8, 7, 6,
];

export const Plot2Data = [
  24, 25, 26, 23, 331, 27, 22, 332, 28, 21, 333, 29, 20, 334, 30, 19, 335, 31,
];

export const Plot3Data = [
  32, 33, 34, 35, 36, 37, 445, 444, 443, 442, 441, 38, 44, 43, 42, 41, 40, 39,
];

export const Plot4Data = [
  5, 115, 45, 4, 114, 46, 3, 113, 47, 2, 112, 48, 1, 111, 49, 52, 51, 50,
];

export const SafeSpots = [
  221, 222, 223, 224, 225, 14, 27, 331, 332, 333, 334, 335, 40, 441, 442, 443,
  444, 445, 1, 111, 112, 113, 114, 115,
];

export const StarSpots = [9, 22, 35, 48];

export const ArrowSpot = [12, 51, 38, 25];
// Turning points where each player enters their home stretch
// Red -> 52, Green -> 26, Yellow -> 13, Blue -> 39
export const turningPoints = [52, 26, 13, 39]; // Red, Green, Yellow, Blue
export const victoryStart = [111, 331, 221, 441]; // Red, Green, Yellow, Blue home stretch start

// Starting points for each player color based on actual board layout and paths
// Red (bottom-left) -> starts at position 1 (in Plot4Data - Red path)
// Green (top-right) -> starts at position 27 (in Plot2Data - Green path) 
// Yellow (top-left) -> starts at position 14 (in Plot1Data - Yellow path)
// Blue (bottom-right) -> starts at position 40 (in Plot3Data - Blue path)
export const startingPoints = [1, 27, 14, 40];

// Color mapping for players (Player A=Red, B=Green, C=Yellow, D=Blue)
export const colorPlayer = [
  Colors.red,    // Player A (Player 1)
  Colors.green,  // Player B (Player 2) 
  Colors.yellow, // Player C (Player 3)
  Colors.blue,   // Player D (Player 4)
];

// Home stretch paths for each color (matching the corrected layout)
export const homeStretchPaths = {
  red: [111, 112, 113, 114, 115],    // Red player's home stretch
  green: [331, 332, 333, 334, 335],  // Green player's home stretch (corrected)
  yellow: [221, 222, 223, 224, 225], // Yellow player's home stretch (corrected)
  blue: [441, 442, 443, 444, 445]    // Blue player's home stretch
};

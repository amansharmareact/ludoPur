/**
 * Board Layout Test Utilities
 * Helper functions to verify correct player-color-path alignment
 */

import { startingPoints, turningPoints, victoryStart } from '../helpers/PlotData';
import { Colors } from '../constants/Colors';

/**
 * Get the correct starting point for a piece based on its ID
 */
export const getStartingPointForPiece = (pieceId) => {
  const playerLetter = pieceId.slice(0, 1);
  
  switch (playerLetter) {
    case 'A': // Red player
      return startingPoints[0]; // Position 1
    case 'B': // Green player
      return startingPoints[1]; // Position 14 (standard Ludo)
    case 'C': // Yellow player
      return startingPoints[2]; // Position 27 (standard Ludo)
    case 'D': // Blue player
      return startingPoints[3]; // Position 40
    default:
      return startingPoints[0];
  }
};

/**
 * Get the home stretch entry point for a piece based on its ID
 */
export const getHomeStretchEntryForPiece = (pieceId) => {
  const playerLetter = pieceId.slice(0, 1);
  
  switch (playerLetter) {
    case 'A': // Red player
      return 1; // Enters home stretch when reaching position 1 after full round
    case 'B': // Green player
      return 14; // Enters home stretch when reaching position 14 after full round
    case 'C': // Yellow player
      return 27; // Enters home stretch when reaching position 27 after full round
    case 'D': // Blue player
      return 40; // Enters home stretch when reaching position 40 after full round
    default:
      return 1;
  }
};

/**
 * Get the correct home stretch start for a piece based on its ID
 */
export const getHomeStretchStartForPiece = (pieceId) => {
  const playerLetter = pieceId.slice(0, 1);
  
  switch (playerLetter) {
    case 'A': // Red player
      return victoryStart[0]; // Position 111
    case 'B': // Green player
      return victoryStart[1]; // Position 331 (corrected)
    case 'C': // Yellow player
      return victoryStart[2]; // Position 221 (corrected)
    case 'D': // Blue player
      return victoryStart[3]; // Position 441
    default:
      return victoryStart[0];
  }
};

/**
 * Get the color for a piece based on its ID
 */
export const getColorForPiece = (pieceId) => {
  const playerLetter = pieceId.slice(0, 1);
  
  switch (playerLetter) {
    case 'A': // Red player
      return Colors.red;
    case 'B': // Green player
      return Colors.green;
    case 'C': // Yellow player
      return Colors.yellow;
    case 'D': // Blue player
      return Colors.blue;
    default:
      return Colors.red;
  }
};

/**
 * Test function to verify board layout is correct
 */
export const testBoardLayout = () => {
  const testResults = [];
  
  // Test starting points (standard Ludo mapping)
  const testPieces = ['A1', 'B1', 'C1', 'D1'];
  const expectedStartingPoints = [1, 14, 27, 40]; // Red, Green, Yellow, Blue (standard Ludo)
  const expectedHomeStarts = [111, 221, 331, 441]; // Red, Green, Yellow, Blue
  const expectedVictoryPositions = [116, 226, 336, 446]; // Red, Green, Yellow, Blue
  
  testPieces.forEach((pieceId, index) => {
    const startingPoint = getStartingPointForPiece(pieceId);
    const turningPoint = getTurningPointForPiece(pieceId);
    const homeStart = getHomeStretchStartForPiece(pieceId);
    
    testResults.push({
      pieceId,
      startingPoint,
      expectedStartingPoint: expectedStartingPoints[index],
      startingPointCorrect: startingPoint === expectedStartingPoints[index],
      turningPoint,
      expectedTurningPoint: expectedTurningPoints[index],
      turningPointCorrect: turningPoint === expectedTurningPoints[index],
      homeStart,
      expectedHomeStart: expectedHomeStarts[index],
      homeStartCorrect: homeStart === expectedHomeStarts[index]
    });
  });
  
  return testResults;
};

/**
 * Log test results to console
 */
export const logBoardLayoutTest = () => {
  const results = testBoardLayout();
  
  console.log('🧪 Board Layout Test Results:');
  console.log('================================');
  
  results.forEach(result => {
    console.log(`\n${result.pieceId} (${getColorForPiece(result.pieceId).toUpperCase()}):`);
    console.log(`  Starting Point: ${result.startingPoint} ${result.startingPointCorrect ? '✅' : '❌'}`);
    console.log(`  Turning Point: ${result.turningPoint} ${result.turningPointCorrect ? '✅' : '❌'}`);
    console.log(`  Home Start: ${result.homeStart} ${result.homeStartCorrect ? '✅' : '❌'}`);
  });
  
  const allCorrect = results.every(r => 
    r.startingPointCorrect && r.turningPointCorrect && r.homeStartCorrect
  );
  
  console.log(`\n🎯 Overall Result: ${allCorrect ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allCorrect;
};
import {
  SafeSpots,
  StarSpots,
  startingPoints,
  turningPoints,
  victoryStart,
} from '../../helpers/PlotData';
import {playSound} from '../../helpers/SoundUtility';
import {selectCurrentPositions, selectDiceNo} from './gameSelectors';
import {
  announceWinner,
  disableTouch,
  unfreezeDice,
  updateFireworks,
  updatePlayerChance,
  updatePlayerPieceValue,
} from './gameSlice';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function checkWinningCriteria(pieces) {
  return pieces.every(piece => piece.travelCount >= 57);
}

export const handleForwardThunk =
  (playerNo, id, pos) => async (dispatch, getState) => {
    const state = getState();
    const plottedPieces = selectCurrentPositions(state);
    const diceNo = selectDiceNo(state);
    const pieceMovedFromHome = state.game.pieceMovedFromHome;

    const piecesAtPosition = plottedPieces.filter(item => item.pos === pos);

    let alpha = playerNo === 1 ? 'A' : 'B';

    const piece =
      piecesAtPosition[
        piecesAtPosition.findIndex(item => item.id.startsWith(alpha))
      ];

    dispatch(disableTouch());
    
    const beforePlayerPiece = state.game[`player${playerNo}`].find(
      item => item.id === id,
    );
    let travelCount = beforePlayerPiece.travelCount;
    
    // Prevent moving other pieces if a piece was already moved from home with a 6
    if (pieceMovedFromHome && diceNo === 6) {
      console.log(`🚫 Cannot move piece ${id} - a piece was already moved from home, consuming the 6`);
      dispatch(unfreezeDice());
      return;
    }
    
    let finalPath = piece.pos;

    for (let i = 0; i < diceNo; i++) {
      const updatedPosition = getState();
      const playerPiece = updatedPosition.game[`player${playerNo}`].find(
        item => item.id === id,
      );

      let path = playerPiece.pos + 1;

      // Map player to correct turning point based on piece ID
      let playerIndex;
      switch (id.slice(0, 1)) {
        case 'A': // Red player
          playerIndex = 0;
          break;
        case 'B': // Green player
          playerIndex = 1;
          break;
        case 'C': // Yellow player
          playerIndex = 2;
          break;
        case 'D': // Blue player
          playerIndex = 3;
          break;
        default:
          playerIndex = 0;
      }

      if (turningPoints.includes(path) && turningPoints[playerIndex] === path) {
        path = victoryStart[playerIndex];
      }

      if (path === 53) {
        path = 1;
      }

      finalPath = path;
      travelCount += 1;

      dispatch(
        updatePlayerPieceValue({
          playerNo: `player${playerNo}`,
          pieceId: playerPiece.id,
          pos: path,
          travelCount: travelCount,
        }),
      );

      playSound('pile_move');
      await delay(200);
    }

    // Ensure state is updated after movement
    const updatedState = getState();
    const updatedPlottedPieces = selectCurrentPositions(updatedState);

    // Check collision
    const finalPlot = updatedPlottedPieces.filter(
      item => item.pos === finalPath,
    );
    const ids = finalPlot?.map(item => item.id[0]);
    const uniqueIds = new Set(ids);
    const areDifferentIds = uniqueIds.size > 1;

    if (SafeSpots.includes(finalPath) || StarSpots.includes(finalPath)) {
      playSound('safe_spot');
    }

    if (
      areDifferentIds &&
      !SafeSpots.includes(finalPlot[0].pos) &&
      !StarSpots.includes(finalPlot[0].pos)
    ) {
      const enemyPiece = finalPlot.find(piece => piece.id[0] !== id[0]);
      const enemyId = enemyPiece.id[0];
      
      // Map enemy piece to correct player number and starting point
      let no, startingPointIndex;
      switch (enemyId) {
        case 'A': // Red player
          no = 1;
          startingPointIndex = 0;
          break;
        case 'B': // Green player
          no = 2;
          startingPointIndex = 1;
          break;
        case 'C': // Yellow player
          no = 3;
          startingPointIndex = 2;
          break;
        case 'D': // Blue player
          no = 4;
          startingPointIndex = 3;
          break;
        default:
          no = 1;
          startingPointIndex = 0;
      }

      let backwardPath = startingPoints[startingPointIndex];
      let i = enemyPiece.pos;
      playSound('collide');

      while (i !== backwardPath) {
        dispatch(
          updatePlayerPieceValue({
            playerNo: `player${no}`,
            pieceId: enemyPiece.id,
            pos: i,
            travelCount: 0,
          }),
        );
        await delay(5);

        i--;

        if (i === 0) {
          i = 52;
        }
      }

      dispatch(
        updatePlayerPieceValue({
          playerNo: `player${no}`,
          pieceId: enemyPiece.id,
          pos: 0,
          travelCount: 0,
        }),
      );

      dispatch(unfreezeDice());
      return;
    }

    // Handle dice roll and winning
    if (diceNo === 6 || travelCount === 57) {
      dispatch(updatePlayerChance({chancePlayer: playerNo}));
      if (travelCount === 57) {
        playSound('home_win');
        const finalPlayerState = getState();
        const playerAllPieces = finalPlayerState.game[`player${playerNo}`];

        if (checkWinningCriteria(playerAllPieces)) {
          dispatch(announceWinner(playerNo));
          playSound('cheer', true);
          return;
        }
        dispatch(updateFireworks(true));
        dispatch(unfreezeDice());
        return;
      }
    } else {
      let chancePlayer = playerNo === 1 ? 2 : 1;
      dispatch(updatePlayerChance({chancePlayer}));
    }
  };

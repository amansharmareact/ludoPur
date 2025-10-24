import { View, Text, StyleSheet, Alert } from 'react-native';
import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Colors } from '../constants/Colors';
import Pile from './Pile';
import {
  unfreezeDice,
  updatePlayerPieceValue,
  setPieceMovedFromHome,
} from '../redux/reducers/gameSlice';
import { startingPoints } from '../helpers/PlotData';

const Pocket = ({ color, player, data }) => {
  const dispatch = useDispatch();

  const handlePress = async value => {
    let playerNo = value?.id?.slice(0, 1);

    switch (playerNo) {
      case 'A':
        playerNo = 'player1';
        break;
      case 'B':
        playerNo = 'player2';
        break;
      case 'C':
        playerNo = 'player3';
        break;
      case 'D':
        playerNo = 'player4';
        break;
      default:
        playerNo = 'player1';
        break;
    }

    // Map player to correct starting point based on their color/position
    let startingPointIndex;
    switch (value.id.slice(0, 1)) {
      case 'A': // Red player (bottom-left)
        startingPointIndex = 0; // Position 1
        break;
      case 'B': // Green player (top-right)  
        startingPointIndex = 1; // Position 14 (standard Green)
        break;
      case 'C': // Yellow player (top-left)
        startingPointIndex = 2; // Position 14 (corrected)
        break;
      case 'D': // Blue player (bottom-right)
        startingPointIndex = 3; // Position 40
        break;
      default:
        startingPointIndex = 0;
    }

    const startingPosition = startingPoints[startingPointIndex];

    console.log(`🎮 Player ${value.id} (${['Red', 'Green', 'Yellow', 'Blue'][startingPointIndex]}) starting from position ${startingPosition}`);

    dispatch(
      updatePlayerPieceValue({
        playerNo: playerNo,
        pieceId: value.id,
        pos: startingPosition,
        travelCount: 1,
      }),
    );

    // Mark that a piece was moved from home (consumes the 6)
    dispatch(setPieceMovedFromHome(true));
    console.log(`🏠 Piece ${value.id} moved from home - 6 is consumed, no other moves allowed`);

    dispatch(unfreezeDice());

  };

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <View style={styles.childFrame}>
        <View style={styles.flexRow}>
          <Plot
            pieceNo={0}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
          <Plot
            pieceNo={1}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
        </View>

        <View style={[styles.flexRow, { marginTop: 20 }]}>
          <Plot
            pieceNo={2}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
          <Plot
            pieceNo={3}
            player={player}
            color={color}
            data={data}
            handlePress={handlePress}
          />
        </View>
      </View>
    </View>
  );
};

const Plot = ({ pieceNo, player, color, data, handlePress }) => {
  return (
    <View style={[styles.plot, { backgroundColor: color }]}>
      {data && data[pieceNo]?.pos === 0 && (
        <Pile
          player={player}
          color={color}
          onPress={() => {
            handlePress(data[pieceNo]);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    height: '100%',
    borderColor: Colors.borderColor,
  },
  childFrame: {
    backgroundColor: 'white',
    borderWidth: 0.4,
    padding: 15,
    width: '70%',
    height: '70%',
    borderColor: Colors.borderColor,
  },
  flexRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '40%',
    flexDirection: 'row',
  },
  plot: {
    backgroundColor: Colors.green,
    height: '80%',
    width: '36%',
    borderRadius: 50,
  },
});

export default memo(Pocket);

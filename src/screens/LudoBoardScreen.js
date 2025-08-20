import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { deviceHeight, deviceWidth } from '../constants/Scaling';
import Wrapper from '../components/Wrapper';
import MenuIcon from '../assets/images/menu.png';
import { playSound } from '../helpers/SoundUtility';
import MenuModal from '../components/MenuModal';
import StartGame from '../assets/images/start.png';
import { useIsFocused } from '@react-navigation/native';
import {
  selectDiceTouch,
  selectPlayer1,
  selectPlayer2,
} from '../redux/reducers/gameSelectors';
import { useSelector } from 'react-redux';
import WinModal from '../components/WinModal';
import Dice from '../components/Dice';
import { Colors } from '../constants/Colors';
import Pocket from '../components/Pocket';
import { Plot1Data, Plot2Data, Plot3Data, Plot4Data } from '../helpers/PlotData';
import VerticalPath from '../components/path/VerticalPath';
import HorizontalPath from '../components/path/HorizontalPath';
import FourTriangles from '../components/FourTriangles';

const LudoBoardScreen = ({ duration = 600, onTimeUp }) => {
  const player1 = useSelector(selectPlayer1);
  const player2 = useSelector(selectPlayer2);
  const isDiceTouch = useSelector(selectDiceTouch);
  const winner = useSelector(state => state.game.winner);
  const [timeLeft, setTimeLeft] = useState(duration);
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(1)).current;
  const [showStartImage, setShowStartImage] = useState(false);
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.(); // End game callback
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Convert to mm:ss
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  useEffect(() => {
    if (isFocused) {
      setShowStartImage(true);
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );

      blinkAnimation.start();

      const timeout = setTimeout(() => {
        blinkAnimation.stop();
        setShowStartImage(false);
      }, 2500);

      return () => {
        blinkAnimation.stop();
        clearTimeout(timeout);
      };
    }
  }, [isFocused]);

  return (
    <View style={{ position: "relative" }}>
      <Wrapper>
        <View style={styles.Timercontainer}>
          <Text style={styles.timerText}>{minutes}:{seconds}</Text>
        </View>
        <View style={styles.container}>
          <View
            style={[styles.flexRow]}
            pointerEvents={isDiceTouch ? 'none' : 'auto'}>
            <Dice color={Colors.yellow} player={1} data={player1} />
          </View>

          <View style={styles.ludoBoard}>
            <View style={styles.plotContainer}>
              <Pocket color={Colors.green} player={0} data={null} />
              <VerticalPath cells={Plot2Data} color={Colors.yellow} />
              <Pocket color={Colors.yellow} player={2} data={player2} />
            </View>

            <View style={styles.pathContainer}>
              <HorizontalPath cells={Plot1Data} color={Colors.green} />
              <FourTriangles
                player1={player1}
                player2={player2}
              />
              <HorizontalPath cells={Plot3Data} color={Colors.blue} />
            </View>

            <View style={styles.plotContainer}>
              <Pocket color={Colors.red} data={player1} player={1} />
              <VerticalPath cells={Plot4Data} color={Colors.red} />
              <Pocket color={Colors.blue} data={null} player={0} />
            </View>
          </View>

          <View
            style={styles.flexRow}
            pointerEvents={isDiceTouch ? 'none' : 'auto'}>
            <Dice color={Colors.red} player={2} data={player2} />
          </View>
        </View>

        {showStartImage && (
          <Animated.Image
            source={StartGame}
            style={{
              width: deviceWidth * 0.5,
              height: deviceWidth * 0.2,
              position: 'absolute',
              opacity,
            }}
          />
        )}

        {winner != null && <WinModal winner={winner} />}
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: deviceHeight * 0.5,
    width: deviceWidth,
  },
  ludoBoard: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    padding: 10,
  },
  menuIcon: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  menuIconImage: {
    width: 30,
    height: 30,
  },
  flexRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
  },
  plotContainer: {
    width: '100%',
    height: '40%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#ccc',
  },
  pathContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '20%',
    justifyContent: 'space-between',
    backgroundColor: '#1E5162',
  },
  Timercontainer: {
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 10,
    position: "absolute",
    top: 40
  },
  timerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default LudoBoardScreen;

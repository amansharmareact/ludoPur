import {View, Text, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import Modal from 'react-native-modal';
import {useDispatch} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import GradientButton from './GradientButton';
import {announceWinner, resetGame} from '../redux/reducers/gameSlice';
import {resetAndNavigate} from '../helpers/NavigationUtil';
import {playSound} from '../helpers/SoundUtility';
import {colorPlayer} from '../helpers/PlotData';
import HeartGirl from '../assets/animation/girl.json';
import Trophy from '../assets/animation/trophy.json';
import Firework from '../assets/animation/firework.json';
import Pile from './Pile';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WinModal = ({winner}) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(!!winner);
  const [winnerName, setWinnerName] = useState('');

  useEffect(() => {
    setVisible(!!winner);
    
    // Get winner name from AsyncStorage
    if (winner) {
      getWinnerName(winner);
    }
  }, [winner]);

  const getWinnerName = async (playerNumber) => {
    try {
      const roomData = await AsyncStorage.getItem('roomDetails');
      if (roomData) {
        const parsedData = JSON.parse(roomData);
        const playerName = parsedData?.players?.[playerNumber - 1]?.name;
        if (playerName) {
          setWinnerName(playerName);
          console.log(`🏆 Winner: ${playerName} (Player ${playerNumber})`);
        } else {
          setWinnerName(`Player ${playerNumber}`);
        }
      } else {
        setWinnerName(`Player ${playerNumber}`);
      }
    } catch (error) {
      console.error('Error getting winner name:', error);
      setWinnerName(`Player ${playerNumber}`);
    }
  };

  const handleNewGame = () => {
    dispatch(resetGame());
    dispatch(announceWinner(null));
    playSound('game_start');
  };

  const handleHome = async () => {
    console.log('🏠 Navigating to Home Screen');
    
    try {
      // Clear room details when going home
      await AsyncStorage.removeItem('roomDetails');
      console.log('🧹 Room details cleared');
    } catch (error) {
      console.error('Error clearing room details:', error);
    }
    
    dispatch(resetGame());
    dispatch(announceWinner(null));
    playSound('home'); // Play home sound if available
    resetAndNavigate('HomeScreen');
  };

  return (
    <Modal
      style={styles.modal}
      isVisible={visible}
      backdropColor="black"
      backdropOpacity={0.8}
      onBackdropPress={() => {}}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackButtonPress={() => {}}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradientContainer}>
        <View style={styles.content}>
          <View style={styles.pileContainer}>
            <Pile player={winner} color={colorPlayer[winner - 1]} />
          </View>

          <Text style={styles.congratsText}>
            🥳 Congratulations! {winnerName ? winnerName.toUpperCase() : `PLAYER ${winner}`}
          </Text>
          <LottieView
            autoPlay
            hardwareAccelerationAndroid
            loop={false}
            source={Trophy}
            style={styles.trophyAnimation}
          />
          <LottieView
            autoPlay
            hardwareAccelerationAndroid
            loop={true}
            source={Firework}
            style={styles.fireworkAnimation}
          />

          <View style={styles.buttonContainer}>
            {/* <GradientButton title="NEW GAME" onPress={handleNewGame} /> */}
            <GradientButton title="🏠 GO HOME" onPress={handleHome} />
          </View>
        </View>
      </LinearGradient>

      <LottieView
        hardwareAccelerationAndroid
        autoPlay
        loop={true}
        source={HeartGirl}
        style={styles.girlAnimation}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    borderRadius: 20,
    width: '96%',
    borderWidth: 2,
    borderColor: 'gold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  pileContainer: {
    width: 90,
    height: 20,
    marginTop:30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 20,
    color: 'gold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  trophyAnimation: {
    height: 140,
    width: 140,
    marginTop: 20,
  },
  fireworkAnimation: {
    height: 200,
    width: 500,
    position: 'absolute',
    zIndex: -1,
    marginTop: 20,
  },
  girlAnimation: {
    height: 500,
    width: 380,
    position: 'absolute',
    bottom: -200,
    right: -120,
    zIndex: 99,
  },
});

export default WinModal;

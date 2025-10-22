import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Alert,
  Pressable,
  TextInput,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Wrapper from '../components/Wrapper';
import Logo from '../assets/images/logo.png';
import { deviceHeight, deviceWidth } from '../constants/Scaling';
import GradientButton from '../components/GradientButton';
import LottieView from 'lottie-react-native';
import Witch from '../assets/animation/witch.json';
import { playSound } from '../helpers/SoundUtility';
import { useIsFocused } from '@react-navigation/native';
import SoundPlayer from 'react-native-sound-player';
import { navigate } from '../helpers/NavigationUtil';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentPositions } from '../redux/reducers/gameSelectors';
import { resetGame } from '../redux/reducers/gameSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../axios';
import { handleApiError, createRetryHandler, globalLoadingManager } from '../utils/apiErrorHandler';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const currentPosition = useSelector(selectCurrentPositions);
  const witchAnim = useRef(new Animated.Value(-deviceWidth)).current;
  const scaleXAnim = useRef(new Animated.Value(-1)).current;
  const isFocused = useIsFocused();
  const [code, setCode] = useState("");
  const [player1, setPlayer1] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleChange = (text) => {
    // Allow only numbers and limit to 6 digits
    const formatted = text.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(formatted);
  };

  useEffect(() => {
    const loopAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(witchAnim, {
              toValue: deviceWidth * 0.02,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: -1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(3000),
          Animated.parallel([
            Animated.timing(witchAnim, {
              toValue: deviceWidth * 2,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: -1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(witchAnim, {
              toValue: -deviceWidth * 0.05,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(3000),
          Animated.parallel([
            Animated.timing(witchAnim, {
              toValue: -deviceWidth * 2,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleXAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    const cleanupAnimation = () => {
      Animated.timing(witchAnim).stop();
      Animated.timing(scaleXAnim).stop();
    };

    loopAnimation();

    return cleanupAnimation;
  }, [witchAnim, scaleXAnim]);

  useEffect(() => {
    if (isFocused) {
      playSound('home');
    }
  }, [isFocused]);

  const renderButton = useCallback(
    (title, onPress) => <GradientButton title={title} onPress={onPress} />,
    [],
  );

  const startGame = async (isNew = false) => {
    SoundPlayer.stop();
    if (isNew) {
      dispatch(resetGame());
    }
    navigate('LudoBoardScreen');
    playSound('game_start');
  };

  const handleNewGamePress = useCallback(() => {
    startGame(true);
  }, []);

  const handleResumePress = useCallback(() => {
    startGame();
  }, []);

  const verifyCodeAndStart = async () => {
    // Input validation
    if (code.length !== 6) {
      Alert.alert(
        "Invalid Code", 
        "Please enter a 6-digit room code",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (!player1 || player1.trim().length === 0) {
      Alert.alert(
        "Invalid Player Name", 
        "Please enter your player name",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (player1.trim().length > 50) {
      Alert.alert(
        "Player Name Too Long", 
        "Player name cannot exceed 50 characters",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    // Prevent multiple simultaneous requests
    if (isJoining) {
      return;
    }

    setIsJoining(true);
    globalLoadingManager.setLoading('joinRoom', true);

    try {
      console.log(`🎮 Attempting to join room: ${code} as ${player1.trim()}`);

      // Create retry handler for the API call
      const joinRoomRequest = () => api.post("/join-room", {
        code: code,
        playerId: player1.trim()
      });

      const retryHandler = createRetryHandler(joinRoomRequest, 2);
      const response = await retryHandler();

      if (response.data && response.data.success) {
        console.log("✅ Successfully joined room:", response.data.room);
        
        // Store room details for the game
        await AsyncStorage.setItem("roomDetails", JSON.stringify(response.data.room));
        
        // Show success message briefly
        Alert.alert(
          "Success! 🎉", 
          `Joined room ${code} successfully!`,
          [
            {
              text: "Start Game",
              onPress: () => startGame(true),
              style: "default"
            }
          ]
        );
      } else {
        // This shouldn't happen with our new backend, but just in case
        handleApiError(
          { message: "Failed to join room. Please try again." },
          true
        );
      }
    } catch (error) {
      console.error("❌ Failed to join room:", error);
      
      // Use centralized error handler
      const errorInfo = handleApiError(error, true);
      
      // Additional specific handling for common scenarios
      if (errorInfo.statusCode === 404) {
        Alert.alert(
          "Room Not Found",
          "The room code you entered doesn't exist. Please check the code and try again.",
          [{ text: "OK", style: "default" }]
        );
      } else if (errorInfo.statusCode === 400 && errorInfo.message.includes("full")) {
        Alert.alert(
          "Room Full",
          "This room already has 2 players. Please try a different room.",
          [{ text: "OK", style: "default" }]
        );
      } else if (errorInfo.statusCode === 400 && errorInfo.message.includes("already exists")) {
        Alert.alert(
          "Name Taken",
          "A player with this name is already in the room. Please choose a different name.",
          [{ text: "OK", style: "default" }]
        );
      }
    } finally {
      setIsJoining(false);
      globalLoadingManager.setLoading('joinRoom', false);
    }
  };


  return (
    <Wrapper style={styles.mainContainer}>
      <View style={styles.imgContainer}>
        <Image source={Logo} style={styles.img} />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Enter 6 Digit Code:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={code}
          onChangeText={handleChange}
          maxLength={6}
          placeholderTextColor="#fff"
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Enter player name</Text>
        <TextInput
          style={styles.input}
          keyboardType="default"
          value={player1}
          onChangeText={(text)=>setPlayer1(text)}
          placeholderTextColor="#fff"
        />
      </View>
   
      {renderButton(
        isJoining ? 'JOINING...' : 'START GAME', 
        isJoining ? null : verifyCodeAndStart
      )}
      {renderButton('LOGIN AS ADMIN', () => { navigate('AdminLogin') })}

      <Animated.View
        style={[
          styles.witchContainer,
          {
            transform: [{ translateX: witchAnim }, { scaleX: scaleXAnim }],
          },
        ]}>
        <Pressable
          onPress={() => {
            const random = Math.floor(Math.random() * 3) + 1;
            playSound(`girl${random}`);
          }}>
          <LottieView
            hardwareAccelerationAndroid
            source={Witch}
            autoPlay
            speed={1}
            style={styles.witch}
          />
        </Pressable>
      </Animated.View>
      <Text style={styles.artist}>Made By - Aman Sharma ™</Text>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'flex-start',
  },
  label: { fontSize: 18, marginBottom: 10, color: "white" },
  container: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
  imgContainer: {
    width: deviceWidth * 0.6,
    height: deviceHeight * 0.12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 10,
    width: 220,
    borderColor: "yellow",
    borderRadius: 2,
    color: "#fff",

  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  artist: {
    position: 'absolute',
    bottom: 40,
    color: 'white',
    fontWeight: '800',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  witchContainer: {
    position: 'absolute',
    top: '80%',
    left: '24%',
  },
  witch: {
    height: 240,
    width: 240,
    transform: [{ rotate: '25deg' }],
  },
});

export default HomeScreen;

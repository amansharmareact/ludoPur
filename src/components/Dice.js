import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectCurrentPlayerChance,
  selectDiceNo,
  selectDiceRolled,
} from '../redux/reducers/gameSelectors';
import {BackgroundImage} from '../helpers/GetIcons';
import LinearGradient from 'react-native-linear-gradient';
import Arrow from '../assets/images/arrow.png';
import LottieView from 'lottie-react-native';
import DiceRoll from '../assets/animation/diceroll.json';
import {playSound} from '../helpers/SoundUtility';
import {
  enableCellSelection,
  enablePileSelection,
  updateDiceNo,
  updatePlayerChance,
} from '../redux/reducers/gameSlice';

const Dice = React.memo(
  ({color, rotate, player, data, adminRolls, onrolled}) => {
    const dispatch = useDispatch();
    const currentPlayerChance = useSelector(selectCurrentPlayerChance);
    // console.log(currentPlayerChance, "currentPlayerChance")
    const isDiceRolled = useSelector(selectDiceRolled);
    const diceNo = useSelector(selectDiceNo);
    const playerPieces = useSelector(
      state => state.game[`player${currentPlayerChance}`],
    );
    const pileIcon = BackgroundImage.GetImage(color);
    const diceIcon = BackgroundImage.GetImage(diceNo);
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const arrowAnim = useRef(new Animated.Value(0)).current;
    const [diceRolling, setDiceRolling] = useState(false);

    useEffect(() => {
      const animateArrow = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(arrowAnim, {
              toValue: 10,
              duration: 600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(arrowAnim, {
              toValue: -10,
              duration: 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };
      animateArrow();
    }, [currentPlayerChance, isDiceRolled]);

    const handleDicePress = async () => {
      let newDiceNo = 0;
      if (adminRolls) {

        newDiceNo =
          !adminRolls.shown 
            ? adminRolls.number
            : Math.floor(Math.random() * 6) + 1;
        if (!adminRolls.shown) {
          onrolled({...adminRolls, shown: true});
        }
      } else {
        newDiceNo = Math.floor(Math.random() * 6) + 1;
      }

      // const newDiceNo = 2;
      playSound('dice_roll');
      setDiceRolling(true);
      await delay(800);
      dispatch(updateDiceNo({diceNo: newDiceNo}));
      setDiceRolling(false);

      const isAnyPieceAlive = data?.findIndex(i => i.pos != 0 && i.pos != 57);
      const isAnyPieceLocked = data?.findIndex(i => i.pos == 0);

      if (isAnyPieceAlive == -1) {
        if (newDiceNo == 6) {
          dispatch(enablePileSelection({playerNo: player}));
        } else {
          let chancePlayer = player + 1;
          if (chancePlayer > 4) {
            chancePlayer = 1;
          }
          await delay(600);
          dispatch(
            updatePlayerChance({
              chancePlayer: chancePlayer > 2 ? 1 : chancePlayer,
            }),
          );
        }
      } else {
        const canMove = playerPieces.some(
          pile => pile.travelCount + newDiceNo <= 57 && pile.pos != 0,
        );

        if (
          (!canMove && newDiceNo == 6 && isAnyPieceLocked == -1) ||
          (!canMove && newDiceNo != 6 && isAnyPieceLocked != -1) ||
          (!canMove && newDiceNo != 6 && isAnyPieceLocked == -1)
        ) {
          let chancePlayer = player === 1 ? 2 : 1;
          await delay(600);
          dispatch(
            updatePlayerChance({
              chancePlayer: chancePlayer > 2 ? 1 : chancePlayer,
            }),
          );
          return;
        }

        if (newDiceNo == 6) {
          dispatch(enablePileSelection({playerNo: player}));
        }
        dispatch(enableCellSelection({playerNo: player}));
      }
    };

    return (
      <View style={[styles.flexRow, {transform: [{scaleX: rotate ? -1 : 1}]}]}>
        <View style={styles.border1}>
          <LinearGradient
            style={styles.linearGradient}
            colors={['#0052be', '#5f9fcb', '#97c6c9']}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}>
            <View style={styles.pileContainer}>
              <Image source={pileIcon} style={styles.pileIcon} />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.border2}>
          <View style={styles.diceGradient}>
            <View style={styles.diceContainer}>
              {currentPlayerChance == player ? (
                <>
                  {diceRolling ? null : (
                    <TouchableOpacity
                      disabled={isDiceRolled}
                      activeOpacity={0.4}
                      onPress={handleDicePress}>
                      <Image source={diceIcon} style={styles.dice} />
                    </TouchableOpacity>
                  )}
                </>
              ) : null}
            </View>
          </View>
        </View>

        {currentPlayerChance === player && !isDiceRolled ? (
          <Animated.View style={{transform: [{translateX: arrowAnim}]}}>
            <Image source={Arrow} style={{width: 30, height: 30}} />
          </Animated.View>
        ) : null}

        {currentPlayerChance === player && diceRolling ? (
          <LottieView
            source={DiceRoll}
            style={styles.rollingDice}
            loop={true}
            autoPlay
            hardwareAccelerationAndroid
          />
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  flexRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pileIcon: {
    width: 35,
    height: 35,
  },
  diceContainer: {
    backgroundColor: '#e8c0c1',
    borderWidth: 1,
    borderRadius: 5,
    width: 60,
    height: 70,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pileContainer: {
    paddingHorizontal: 3,
    paddingVertical: 10,
  },
  linearGradient: {
    padding: 1,
    borderWidth: 3,
    borderRightWidth: 0,
    borderColor: '#f0ce2c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dice: {
    height: 45,
    width: 45,
  },
  rollingDice: {
    height: 80,
    width: 80,
    zIndex: 99,
    top: -25,
    right: 25,
    position: 'absolute',
  },
  diceGradient: {
    borderWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#f0ce2c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  border1: {
    borderWidth: 3,
    borderRightWidth: 0,
    borderColor: '#f0ce2c',
  },
  border2: {
    borderWidth: 3,
    padding: 1,
    backgroundColor: '#aac8ab',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderColor: '#aac8ab',
  },
});

export default Dice;

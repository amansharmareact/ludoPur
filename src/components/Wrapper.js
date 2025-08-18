import {ImageBackground, StyleSheet, SafeAreaView} from 'react-native';
import React from 'react';
import BG from '../assets/images/bg.jpeg';
import {deviceHeight, deviceWidth} from '../constants/Scaling';

const Wrapper = ({children, style}) => {
  return (
    <ImageBackground source={BG} resizeMode="cover" style={styles}>
      <SafeAreaView style={[styles.safeAreaView, {...style}]}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaView: {
    height: deviceHeight,
    width: deviceWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Wrapper;

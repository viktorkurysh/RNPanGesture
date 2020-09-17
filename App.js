import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
  Dimensions,
} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Animated, {
  add,
  block,
  clockRunning,
  cond,
  diffClamp,
  eq,
  set,
  startClock,
  Value,
  and,
  not,
  decay,
  stopClock,
  Clock,
  spring,
} from 'react-native-reanimated';
import {onGestureEvent, clamp} from 'react-native-redash/lib/module/v1';

const {width, height} = Dimensions.get('screen');
const cardWidth = 0.84 * width;
const cardHeight = 0.67 * cardWidth;

function withSpring(value, velocity, gestureState, offset, snapPoint) {
  const clock = new Clock();
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };
  const config = {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: snapPoint,
  };

  const springIsInterrupted = eq(gestureState, State.BEGAN);
  const finishSpring = [set(offset, state.position), stopClock(clock)];

  return block([
    cond(springIsInterrupted, finishSpring),
    cond(
      eq(gestureState, State.END),
      [
        cond(and(not(clockRunning(clock), not(state.finished))), [
          set(state.time, 0),
          startClock(clock),
        ]),
        spring(clock, state, config),
        cond(state.finished, finishSpring),
      ],
      [set(state.finished, 0), set(state.position, add(offset, value))],
    ),
    state.position,
  ]);
}

function App() {
  const state = new Value(State.UNDETERMINED);
  const translationX = new Value(0);
  const translationY = new Value(0);
  const velocityX = new Value(0);
  const velocityY = new Value(0);
  const snapX = (width - cardWidth) / 2;
  const snapY = (height - cardHeight) / 2;
  const offsetX = new Value(snapX);
  const offsetY = new Value(snapY);
  const gestureHandler = onGestureEvent({
    state,
    translationX,
    translationY,
    velocityX,
    velocityY,
  });

  const translateX = clamp(
    withSpring(translationX, velocityX, state, offsetX, snapX),
    0,
    width - cardWidth,
  );
  const translateY = clamp(
    withSpring(translationY, velocityY, state, offsetY, snapY),
    0,
    height - cardHeight,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <View style={styles.field}>
        <PanGestureHandler {...gestureHandler}>
          <Animated.View
            style={[styles.card, {transform: [{translateX}, {translateY}]}]}
          />
        </PanGestureHandler>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  field: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: '#FD3777',
    borderRadius: 12,
  },
});

export default App;

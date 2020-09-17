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
} from 'react-native-reanimated';
import {onGestureEvent} from 'react-native-redash/lib/module/v1';

const {width, height} = Dimensions.get('screen');
const cardWidth = 0.84 * width;
const cardHeight = 0.67 * cardWidth;

// function withOffset(value, state, offset) {
//   return cond(
//     eq(state, State.END),
//     [set(offset, add(offset, value)), offset],
//     add(offset, value),
//   );
// }

function withDecay(value, gestureState, offset, velocity) {
  const clock = new Clock();
  const state = {
    finished: new Value(0),
    velocity,
    position: new Value(0),
    time: new Value(0),
  };
  const config = {
    deceleration: 0.998,
  };

  const decayIsInterrupted = eq(gestureState, State.BEGAN);
  const finishDecay = [set(offset, state.position), stopClock(clock)];

  return block([
    cond(decayIsInterrupted, finishDecay),
    cond(
      eq(gestureState, State.END),
      [
        cond(and(not(clockRunning(clock), not(state.finished))), [
          set(state.time, 0),
          startClock(clock),
        ]),
        decay(clock, state, config),
        cond(state.finished, finishDecay),
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
  const offsetX = new Value((width - cardWidth) / 2);
  const offsetY = new Value((height - cardHeight) / 2);
  const gestureHandler = onGestureEvent({
    state,
    translationX,
    translationY,
    velocityX,
    velocityY,
  });

  const translateX = diffClamp(
    withDecay(translationX, state, offsetX, velocityX),
    0,
    width - cardWidth,
    velocityX,
  );
  const translateY = diffClamp(
    withDecay(translationY, state, offsetY, velocityY),
    0,
    height - cardHeight,
    velocityY,
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

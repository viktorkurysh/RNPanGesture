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
  cond,
  diffClamp,
  eq,
  set,
  Value,
} from 'react-native-reanimated';
import {onGestureEvent} from 'react-native-redash/lib/module/v1';

const {width, height} = Dimensions.get('screen');
const cardWidth = 0.84 * width;
const cardHeight = 0.67 * cardWidth;

function withOffset(value, state, offset) {
  return cond(
    eq(state, State.END),
    [set(offset, add(offset, value)), offset],
    add(offset, value),
  );
}

function App() {
  const state = new Value(State.UNDETERMINED);
  const translationX = new Value(0);
  const translationY = new Value(0);
  const offsetX = new Value((width - cardWidth) / 2);
  const offsetY = new Value((height - cardHeight) / 2);
  const gestureHandler = onGestureEvent({state, translationX, translationY});

  const translateX = diffClamp(
    withOffset(translationX, state, offsetX),
    0,
    width - cardWidth,
  );
  const translateY = diffClamp(
    withOffset(translationY, state, offsetY),
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

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/helpers';

const ProgressBar = ({ 
  progress = 0, 
  color = COLORS.primary, 
  backgroundColor = COLORS.background,
  height = 4,
  style = {},
  animated = false 
}) => {
  const progressWidth = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${progressWidth}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 2,
  },
});

export default ProgressBar;
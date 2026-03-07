import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { PALETTE } from '../engine/constants';

interface ActionButtonProps {
  onPress: () => void;
  label?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onPress, label = 'A' }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.outer} activeOpacity={0.7}>
      <View style={styles.inner}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PALETTE.roofRed,
    borderWidth: 3,
    borderColor: PALETTE.roofRedLight,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  inner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PALETTE.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.redLight,
  },
  label: {
    color: PALETTE.white,
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default memo(ActionButton);

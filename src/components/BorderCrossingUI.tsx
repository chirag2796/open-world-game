import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE } from '../engine/constants';

interface BorderCrossingUIProps {
  regionName: string;
  isLocked: boolean;
  requiredItem: string;
  onDismiss: () => void;
  onEnter: () => void;
}

const BorderCrossingUI: React.FC<BorderCrossingUIProps> = ({
  regionName,
  isLocked,
  requiredItem,
  onDismiss,
  onEnter,
}) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Mughal Arch top */}
        <View style={styles.archTop}>
          <View style={styles.minaretLeft} />
          <View style={styles.archCurve}>
            <View style={styles.archInner} />
          </View>
          <View style={styles.minaretRight} />
        </View>

        {/* Decorative jali band */}
        <View style={styles.jaliBand}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.jaliDiamond} />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Regional Border</Text>
          <View style={styles.divider} />
          <Text style={styles.regionText}>{regionName}</Text>

          {isLocked ? (
            <>
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>PASSAGE DENIED</Text>
              </View>
              <Text style={styles.requireText}>
                You need an Imperial Sanad{'\n'}to enter this territory.
              </Text>
              {requiredItem && (
                <Text style={styles.itemHint}>
                  Required: {requiredItem}
                </Text>
              )}
            </>
          ) : (
            <>
              <View style={styles.unlockedBadge}>
                <Text style={styles.unlockedText}>PASSAGE GRANTED</Text>
              </View>
              <Text style={styles.welcomeText}>
                Your Imperial Sanad is recognized.{'\n'}You may enter freely.
              </Text>
            </>
          )}
        </View>

        {/* Decorative bottom band */}
        <View style={styles.pietraBand}>
          <View style={[styles.pietraFlower, { backgroundColor: PALETTE.pietraDura }]} />
          <View style={[styles.pietraFlower, { backgroundColor: PALETTE.mughalGold }]} />
          <View style={[styles.pietraFlower, { backgroundColor: PALETTE.pietraDura }]} />
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLocked && (
            <TouchableOpacity style={styles.enterButton} onPress={onEnter} activeOpacity={0.7}>
              <Text style={styles.enterButtonText}>Enter</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backButton} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>Turn Back</Text>
          </TouchableOpacity>
        </View>

        {/* Sandstone base */}
        <View style={styles.base} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    width: 300,
    backgroundColor: PALETTE.marbleCream,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: PALETTE.sandstone,
  },
  archTop: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: PALETTE.sandstone,
  },
  minaretLeft: {
    width: 16,
    height: 50,
    backgroundColor: PALETTE.sandstoneDark,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginRight: 4,
  },
  archCurve: {
    width: 120,
    height: 50,
    backgroundColor: PALETTE.sandstoneDark,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  archInner: {
    width: 80,
    height: 30,
    backgroundColor: PALETTE.mughalGold,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  minaretRight: {
    width: 16,
    height: 50,
    backgroundColor: PALETTE.sandstoneDark,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginLeft: 4,
  },
  jaliBand: {
    height: 16,
    backgroundColor: PALETTE.sandstoneLight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  jaliDiamond: {
    width: 8,
    height: 8,
    backgroundColor: PALETTE.mughalRed,
    transform: [{ rotate: '45deg' }],
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: PALETTE.midGray,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: PALETTE.mughalGold,
    marginVertical: 8,
  },
  regionText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: PALETTE.sandstoneDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  lockedBadge: {
    backgroundColor: PALETTE.mughalRed,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  lockedText: {
    color: PALETTE.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  unlockedBadge: {
    backgroundColor: PALETTE.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  unlockedText: {
    color: PALETTE.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  requireText: {
    color: PALETTE.midGray,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  itemHint: {
    color: PALETTE.mughalRed,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 6,
    fontStyle: 'italic',
  },
  welcomeText: {
    color: PALETTE.midGray,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 18,
  },
  pietraBand: {
    height: 16,
    backgroundColor: PALETTE.marble,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  pietraFlower: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: PALETTE.marbleCream,
  },
  enterButton: {
    backgroundColor: PALETTE.greenDark,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: PALETTE.green,
  },
  enterButtonText: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  backButton: {
    backgroundColor: PALETTE.sandstone,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: PALETTE.sandstoneDark,
  },
  backButtonText: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  base: {
    height: 6,
    backgroundColor: PALETTE.sandstone,
  },
});

export default memo(BorderCrossingUI);

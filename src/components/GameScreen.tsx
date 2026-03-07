import React from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { VILLAGE_MAP, VILLAGE_NPCS, PLAYER_START } from '../data/village-map';
import { useGameLoop } from '../engine/useGameLoop';
import { PALETTE, GAME_AREA_HEIGHT, CONTROLS_HEIGHT, SCREEN_WIDTH, SCALED_TILE } from '../engine/constants';
import TileRenderer from './TileRenderer';
import EntityRenderer from './EntityRenderer';
import DPad from './DPad';
import ActionButton from './ActionButton';
import DialogBox from './DialogBox';

const GameScreen: React.FC = () => {
  const { gameState, setDirection, interact } = useGameLoop(
    VILLAGE_MAP,
    VILLAGE_NPCS,
    PLAYER_START,
  );

  const playerTileX = Math.floor(gameState.playerPos.x / SCALED_TILE);
  const playerTileY = Math.floor(gameState.playerPos.y / SCALED_TILE);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Game viewport */}
      <View style={styles.gameArea}>
        <TileRenderer
          map={VILLAGE_MAP}
          cameraX={gameState.cameraX}
          cameraY={gameState.cameraY}
        />
        <EntityRenderer
          npcs={VILLAGE_NPCS}
          playerPos={gameState.playerPos}
          playerDir={gameState.playerDir}
          playerMoving={gameState.playerMoving}
          animFrame={gameState.animFrame}
          cameraX={gameState.cameraX}
          cameraY={gameState.cameraY}
        />

        {/* Dialog overlay */}
        <DialogBox dialog={gameState.dialog} onAdvance={interact} />
      </View>

      {/* Controls area */}
      <View style={styles.controlsArea}>
        {/* Top bar with info */}
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>Willowdale Village</Text>
          <Text style={styles.coordText}>({playerTileX}, {playerTileY})</Text>
        </View>

        <View style={styles.controlsRow}>
          {/* D-Pad on the left */}
          <View style={styles.dpadContainer}>
            <DPad onDirectionChange={setDirection} />
          </View>

          {/* Action buttons on the right */}
          <View style={styles.buttonsContainer}>
            <ActionButton onPress={interact} label="A" />
            <View style={styles.buttonLabel}>
              <Text style={styles.buttonLabelText}>TALK</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.black,
  },
  gameArea: {
    width: SCREEN_WIDTH,
    height: GAME_AREA_HEIGHT,
    overflow: 'hidden',
    backgroundColor: PALETTE.grassDark,
  },
  controlsArea: {
    height: CONTROLS_HEIGHT,
    backgroundColor: PALETTE.uiBg,
    borderTopWidth: 3,
    borderTopColor: PALETTE.uiBorder,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.uiDark,
  },
  infoText: {
    color: PALETTE.yellow,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  coordText: {
    color: PALETTE.lightGray,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  controlsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dpadContainer: {
    justifyContent: 'center',
  },
  buttonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    marginTop: 6,
  },
  buttonLabelText: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});

export default GameScreen;

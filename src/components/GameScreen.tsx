import React, { useMemo } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { generateIndiaMap, WORLD_NPCS, PLAYER_START, getStateName, getNearestSettlement } from '../data/india-map';
import { useGameLoop } from '../engine/useGameLoop';
import { PALETTE, GAME_AREA_HEIGHT, CONTROLS_HEIGHT, SCREEN_WIDTH, SCALED_TILE } from '../engine/constants';
import TileRenderer from './TileRenderer';
import EntityRenderer from './EntityRenderer';
import DPad from './DPad';
import ActionButton from './ActionButton';
import DialogBox from './DialogBox';
import MiniMap from './MiniMap';

const GameScreen: React.FC = () => {
  // Generate map once
  const worldMap = useMemo(() => generateIndiaMap(), []);

  const { gameState, setDirection, interact } = useGameLoop(
    worldMap,
    WORLD_NPCS,
    PLAYER_START,
  );

  const playerTileX = Math.floor(gameState.playerPos.x / SCALED_TILE);
  const playerTileY = Math.floor(gameState.playerPos.y / SCALED_TILE);
  const stateName = getStateName(playerTileX, playerTileY);
  const settlement = getNearestSettlement(playerTileX, playerTileY);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.gameArea}>
        <TileRenderer
          map={worldMap}
          cameraX={gameState.cameraX}
          cameraY={gameState.cameraY}
        />
        <EntityRenderer
          npcs={WORLD_NPCS}
          playerPos={gameState.playerPos}
          playerDir={gameState.playerDir}
          playerMoving={gameState.playerMoving}
          animFrame={gameState.animFrame}
          cameraX={gameState.cameraX}
          cameraY={gameState.cameraY}
        />
        <MiniMap
          map={worldMap}
          playerTileX={playerTileX}
          playerTileY={playerTileY}
        />
        <DialogBox dialog={gameState.dialog} onAdvance={interact} />
      </View>

      <View style={styles.controlsArea}>
        <View style={styles.infoBar}>
          <View>
            <Text style={styles.infoText}>{settlement || stateName}</Text>
            {settlement && <Text style={styles.stateText}>{stateName}</Text>}
          </View>
          <Text style={styles.coordText}>({playerTileX}, {playerTileY})</Text>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.dpadContainer}>
            <DPad onDirectionChange={setDirection} />
          </View>
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
    backgroundColor: '#1a3a6a',
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
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.uiDark,
  },
  infoText: {
    color: PALETTE.yellow,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  stateText: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
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

import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { generateIndiaMap, WORLD_NPCS, PLAYER_START, getStateName, getNearestSettlement } from '../data/india-map';
import { useGameLoop } from '../engine/useGameLoop';
import { useInventory } from '../engine/useInventory';
import { PALETTE, GAME_AREA_HEIGHT, CONTROLS_HEIGHT, SCREEN_WIDTH, SCALED_TILE } from '../engine/constants';
import TileRenderer from './TileRenderer';
import EntityRenderer from './EntityRenderer';
import DPad from './DPad';
import ActionButton from './ActionButton';
import DialogBox from './DialogBox';
import MiniMap from './MiniMap';
import InventoryScreen from './InventoryScreen';

const GameScreen: React.FC = () => {
  const worldMap = useMemo(() => generateIndiaMap(), []);
  const [showInventory, setShowInventory] = useState(false);

  const { gameState, setDirection, interact } = useGameLoop(
    worldMap,
    WORLD_NPCS,
    PLAYER_START,
  );

  const { inventory, equipItem, unequipItem, removeItem } = useInventory();

  const playerTileX = Math.floor(gameState.playerPos.x / SCALED_TILE);
  const playerTileY = Math.floor(gameState.playerPos.y / SCALED_TILE);
  const stateName = getStateName(playerTileX, playerTileY);
  const settlement = getNearestSettlement(playerTileX, playerTileY);

  const handleUseItem = useCallback((itemId: string) => {
    // For now just consume the item — effect system can be added later
    removeItem(itemId, 1);
  }, [removeItem]);

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
            <View style={styles.buttonRow}>
              <View style={styles.buttonWithLabel}>
                <ActionButton onPress={interact} label="A" />
                <Text style={styles.buttonLabelText}>TALK</Text>
              </View>
              <View style={styles.buttonWithLabel}>
                <TouchableOpacity
                  style={styles.bagButton}
                  onPress={() => setShowInventory(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bagButtonText}>B</Text>
                </TouchableOpacity>
                <Text style={styles.buttonLabelText}>BAG</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {showInventory && (
        <InventoryScreen
          inventory={inventory}
          onClose={() => setShowInventory(false)}
          onEquip={equipItem}
          onUnequip={unequipItem}
          onUse={handleUseItem}
        />
      )}
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
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  buttonWithLabel: {
    alignItems: 'center',
  },
  buttonLabelText: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: 6,
  },
  bagButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4060a0',
    borderWidth: 3,
    borderColor: '#6080c0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagButtonText: {
    color: PALETTE.white,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

export default GameScreen;

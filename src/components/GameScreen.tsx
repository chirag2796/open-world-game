import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { generateIndiaMap, WORLD_NPCS, PLAYER_START, getStateName, getNearestSettlement, getBiomeAt } from '../data/india-map';
import { useGameLoop } from '../engine/useGameLoop';
import { useInventory } from '../engine/useInventory';
import { useBattle } from '../engine/useBattle';
import { useNPCAI } from '../engine/useNPCAI';
import { useSound } from '../engine/useSound';
import { useWeather } from '../engine/useWeather';
import { PALETTE, GAME_AREA_HEIGHT, CONTROLS_HEIGHT, SCREEN_WIDTH, SCALED_TILE } from '../engine/constants';
import TileRenderer from './TileRenderer';
import EntityRenderer from './EntityRenderer';
import DPad from './DPad';
import ActionButton from './ActionButton';
import DialogBox from './DialogBox';
import MiniMap from './MiniMap';
import InventoryScreen from './InventoryScreen';
import BattleScreen from './BattleScreen';
import WeatherEffect from './WeatherEffect';
import DayNightCycle from './DayNightCycle';

const GameScreen: React.FC = () => {
  const worldMap = useMemo(() => generateIndiaMap(), []);
  const [showInventory, setShowInventory] = useState(false);

  const { gameState, setDirection, interact, setPaused, clearEncounter } = useGameLoop(
    worldMap,
    WORLD_NPCS,
    PLAYER_START,
  );

  const { inventory, addItem, equipItem, unequipItem, removeItem, getEquippedStats } = useInventory();
  const { battle, startBattle, doPlayerAction, closeBattle } = useBattle(getEquippedStats, inventory, removeItem);
  const { tickNPCs, getNPCPositions, facePlayer } = useNPCAI(WORLD_NPCS, worldMap);
  const { playSFX } = useSound();

  // NPC AI tick
  const npcTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    npcTickRef.current = setInterval(() => {
      tickNPCs(gameState.playerPos.x, gameState.playerPos.y, gameState.dialog.active || battle.active);
    }, 33);
    return () => { if (npcTickRef.current) clearInterval(npcTickRef.current); };
  }, [tickNPCs, gameState.dialog.active, battle.active]);

  // Pause game loop during battle
  useEffect(() => {
    setPaused(battle.active);
  }, [battle.active, setPaused]);

  // Handle random encounter trigger
  useEffect(() => {
    if (gameState.encounter && !battle.active) {
      const tileX = Math.floor(gameState.playerPos.x / SCALED_TILE);
      const tileY = Math.floor(gameState.playerPos.y / SCALED_TILE);
      const biome = getBiomeAt(tileX, tileY);
      playSFX('battle_start');
      startBattle(biome);
      clearEncounter();
    }
  }, [gameState.encounter, battle.active, gameState.playerPos, startBattle, clearEncounter, playSFX]);

  const playerTileX = Math.floor(gameState.playerPos.x / SCALED_TILE);
  const playerTileY = Math.floor(gameState.playerPos.y / SCALED_TILE);
  const stateName = getStateName(playerTileX, playerTileY);
  const settlement = getNearestSettlement(playerTileX, playerTileY);
  const currentBiome = getBiomeAt(playerTileX, playerTileY);
  const weather = useWeather(currentBiome);

  const npcRenderData = useMemo(() => {
    const positions = getNPCPositions();
    return positions.map(p => {
      const npc = WORLD_NPCS.find(n => n.id === p.id);
      return { ...p, name: npc?.name || '' };
    });
  }, [getNPCPositions]);

  const handleUseItem = useCallback((itemId: string) => {
    removeItem(itemId, 1);
    playSFX('item_use');
  }, [removeItem, playSFX]);

  const handleBattleAction = useCallback((action: Parameters<typeof doPlayerAction>[0], itemId?: string) => {
    if (action === 'attack') playSFX('attack_hit');
    else if (action === 'defend') playSFX('defend');
    else if (action === 'run') playSFX('run_away');
    doPlayerAction(action, itemId);
  }, [doPlayerAction, playSFX]);

  const handleBattleClose = useCallback(() => {
    if (battle.result === 'win') {
      playSFX('victory');
      // Chance to find loot
      if (Math.random() < 0.3) {
        addItem('healing_herb', 1);
      }
    }
    closeBattle();
  }, [closeBattle, battle.result, playSFX, addItem]);

  const handleInteract = useCallback(() => {
    playSFX('npc_talk');
    interact();
  }, [interact, playSFX]);

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
          npcData={npcRenderData}
          playerPos={gameState.playerPos}
          playerDir={gameState.playerDir}
          playerMoving={gameState.playerMoving}
          animFrame={gameState.animFrame}
          cameraX={gameState.cameraX}
          cameraY={gameState.cameraY}
        />
        <WeatherEffect weather={weather} />
        <DayNightCycle />
        <MiniMap
          map={worldMap}
          playerTileX={playerTileX}
          playerTileY={playerTileY}
        />
        <DialogBox dialog={gameState.dialog} onAdvance={handleInteract} />
      </View>

      <View style={styles.controlsArea}>
        <View style={styles.infoBar}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoText}>{settlement || stateName}</Text>
            {settlement && <Text style={styles.stateText}>{stateName}</Text>}
          </View>
          <View style={styles.infoRight}>
            <Text style={styles.levelText}>Lv.{battle.playerLevel}</Text>
            <Text style={styles.goldText}>{battle.playerGold}G</Text>
            <Text style={styles.coordText}>({playerTileX},{playerTileY})</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.dpadContainer}>
            <DPad onDirectionChange={setDirection} />
          </View>
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonRow}>
              <View style={styles.buttonWithLabel}>
                <ActionButton onPress={handleInteract} label="A" />
                <Text style={styles.buttonLabelText}>TALK</Text>
              </View>
              <View style={styles.buttonWithLabel}>
                <TouchableOpacity
                  style={styles.bagButton}
                  onPress={() => { playSFX('menu_select'); setShowInventory(true); }}
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
          onClose={() => { playSFX('menu_back'); setShowInventory(false); }}
          onEquip={(id) => { playSFX('equip'); equipItem(id); }}
          onUnequip={(slot) => { playSFX('equip'); unequipItem(slot); }}
          onUse={handleUseItem}
        />
      )}

      {battle.active && (
        <BattleScreen
          battle={battle}
          inventory={inventory}
          onAction={handleBattleAction}
          onClose={handleBattleClose}
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.uiDark,
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
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
  levelText: {
    color: PALETTE.green,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  goldText: {
    color: PALETTE.yellow,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  coordText: {
    color: PALETTE.midGray,
    fontSize: 10,
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

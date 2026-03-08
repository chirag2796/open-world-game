import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../core/store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { GameLoop } from '../../core/systems/GameLoop';
import { EntityManager } from '../../core/ecs/EntityManager';
import { MovementSystem } from '../../core/systems/MovementSystem';
import { CameraSystem, cameraX, cameraY, initCamera } from '../../core/systems/CameraSystem';
import { EncounterSystem, consumeEncounter, resetEncounterState } from '../../core/systems/EncounterSystem';
import { NPCAISystem } from '../../core/systems/NPCAISystem';
import { saveGame } from '../../core/persistence/SaveManager';
import { generateIndiaMap, WORLD_NPCS, PLAYER_START, getStateName, getStateCode, getNearestSettlement, getBiomeAt } from '../../data/india-map';
import { ITEMS } from '../../data/items';
import { PALETTE, GAME_AREA_HEIGHT, CONTROLS_HEIGHT, SCREEN_WIDTH, SCALED_TILE } from '../../engine/constants';
import { useSound } from '../../engine/useSound';
import TileRenderer from '../../components/TileRenderer';
import EntityRenderer from '../../components/EntityRenderer';
import DPad from '../../components/DPad';
import ActionButton from '../../components/ActionButton';
import DialogBox from '../../components/DialogBox';
import MiniMap from '../../components/MiniMap';
import InventoryScreen from '../../components/InventoryScreen';
import BattleScreen from '../../components/BattleScreen';
import WeatherEffect from '../../components/WeatherEffect';
import DayNightCycle from '../../components/DayNightCycle';
import { useWeather } from '../../engine/useWeather';
import { Direction, NPC, BattleAction } from '../../types';
import { getRandomEnemy, xpForLevel } from '../../data/enemies';
import { getRequiredSanad, getRegionName } from '../../data/regions';
import BorderCrossingUI from '../../components/BorderCrossingUI';

const WorldScreen: React.FC = () => {
  // === MAP (generated once) ===
  const worldMap = useMemo(() => generateIndiaMap(), []);

  // === ECS ===
  const entityMgr = useRef(new EntityManager()).current;
  const gameLoop = useRef(new GameLoop()).current;
  const initialized = useRef(false);

  // === STORE (targeted selectors) ===
  const playerPos = useGameStore(s => s.playerPos);
  const playerDir = useGameStore(s => s.playerDir);
  const playerMoving = useGameStore(s => s.playerMoving);
  const animFrame = useGameStore(s => s.animFrame);
  const camX = useGameStore(s => s.cameraX);
  const camY = useGameStore(s => s.cameraY);
  const dialog = useGameStore(s => s.dialog);
  const showInventory = useGameStore(s => s.showInventory);
  const paused = useGameStore(s => s.paused);
  const playerLevel = useGameStore(s => s.playerLevel);
  const playerGold = useGameStore(s => s.playerGold);
  const playerHP = useGameStore(s => s.playerHP);
  const playerMaxHP = useGameStore(s => s.playerMaxHP);
  const playerXP = useGameStore(s => s.playerXP);
  const battleActive = useGameStore(s => s.battleActive);
  const slots = useGameStore(s => s.slots);
  const equipped = useGameStore(s => s.equipped);
  const weather = useGameStore(s => s.weather);
  const borderCrossing = useGameStore(s => s.borderCrossing);
  const currentRegion = useGameStore(s => s.currentRegion);

  // Store actions (stable refs via zustand)
  const store = useGameStore;

  const { playSFX } = useSound();

  // === INITIALIZATION ===
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Create entities
    entityMgr.createPlayer(PLAYER_START.x, PLAYER_START.y);
    for (const npc of WORLD_NPCS) {
      entityMgr.createNPC(npc);
    }

    // Init camera
    initCamera(PLAYER_START.x * SCALED_TILE, PLAYER_START.y * SCALED_TILE);

    // Configure game loop
    gameLoop.setMap(worldMap);
    gameLoop.setNPCs(WORLD_NPCS);
    gameLoop.setEntities(entityMgr.getAll());
    gameLoop.addSystem(MovementSystem);
    gameLoop.addSystem(CameraSystem);
    gameLoop.addSystem(EncounterSystem);
    gameLoop.addSystem(NPCAISystem);

    // Sync ECS state → Zustand store every tick
    gameLoop.setOnTick(() => {
      const state = store.getState();
      if (state.paused || state.dialog.active || state.battleActive) return;

      const player = entityMgr.getPlayer();
      if (!player) return;

      // Only update store when values actually changed to avoid re-render loops
      const px = player.position.x;
      const py = player.position.y;
      const dir = player.sprite.direction;
      const moving = player.sprite.moving;
      const frame = player.sprite.animFrame;
      const cx = cameraX;
      const cy = cameraY;

      const updates: Record<string, unknown> = {};
      let hasChanges = false;

      if (state.playerPos.x !== px || state.playerPos.y !== py) {
        updates.playerPos = { x: px, y: py };
        hasChanges = true;
      }
      if (state.playerDir !== dir) { updates.playerDir = dir; hasChanges = true; }
      if (state.playerMoving !== moving) { updates.playerMoving = moving; hasChanges = true; }
      if (state.animFrame !== frame) { updates.animFrame = frame; hasChanges = true; }
      if (state.cameraX !== cx) { updates.cameraX = cx; hasChanges = true; }
      if (state.cameraY !== cy) { updates.cameraY = cy; hasChanges = true; }

      if (hasChanges) {
        store.setState(updates);
      }

      // Check region crossing
      const tileX = Math.floor(px / SCALED_TILE);
      const tileY = Math.floor(py / SCALED_TILE);
      const regionCode = getStateCode(tileX, tileY);
      if (regionCode && regionCode !== state.currentRegion) {
        const s = store.getState();
        if (!s.unlockedRegions.has(regionCode)) {
          // Blocked — show border crossing UI
          const rName = getRegionName(regionCode);
          s.showBorderCrossing(regionCode, rName);
          // Push player back
          const player = entityMgr.getPlayer();
          if (player) {
            player.position.x = state.playerPos.x;
            player.position.y = state.playerPos.y;
          }
        } else {
          // Entered new region
          s.setCurrentRegion(regionCode);
          s.discoverRegion(regionCode);
        }
      }

      // Check encounters
      if (consumeEncounter()) {
        const biome = getBiomeAt(tileX, tileY);
        const equippedStats = store.getState().getEquippedStats();
        const lvl = store.getState().playerLevel;
        playSFX('battle_start');
        store.getState().startBattle(biome, lvl, equippedStats.attack, equippedStats.defense);
      }
    });

    gameLoop.start();

    return () => {
      gameLoop.stop();
    };
  }, []);

  // Pause loop during battle/dialog
  useEffect(() => {
    if (battleActive || dialog.active || paused) {
      gameLoop.setInputDirection(null);
    }
  }, [battleActive, dialog.active, paused]);

  // === WEATHER ===
  const playerTileX = Math.floor(playerPos.x / SCALED_TILE);
  const playerTileY = Math.floor(playerPos.y / SCALED_TILE);
  const currentBiome = getBiomeAt(playerTileX, playerTileY);
  const currentWeather = useWeather(currentBiome);

  // Sync weather to store
  useEffect(() => {
    store.getState().setWeather(currentWeather);
  }, [currentWeather]);

  // === NPC RENDER DATA ===
  const npcRenderData = useMemo(() => {
    const npcs = entityMgr.getNPCs();
    return npcs.map(e => ({
      id: e.id,
      name: WORLD_NPCS.find(n => n.id === e.id)?.name || '',
      px: e.position.x,
      py: e.position.y,
      dir: e.sprite.direction,
      animFrame: e.sprite.moving ? e.sprite.animFrame : 0,
    }));
    // Re-derive every render (NPCs are mutable in ECS)
  }, [playerPos]); // eslint-disable-line — re-derive when player moves

  // === LOCATION INFO ===
  const stateName = getStateName(playerTileX, playerTileY);
  const settlement = getNearestSettlement(playerTileX, playerTileY);

  // === HANDLERS ===
  const handleDirection = useCallback((dir: Direction | null) => {
    gameLoop.setInputDirection(dir);
  }, []);

  const handleInteract = useCallback(() => {
    const state = store.getState();
    if (state.dialog.active) {
      playSFX('npc_talk');
      state.advanceDialog();
      return;
    }

    // Find nearby NPC
    const pTileX = state.playerPos.x / SCALED_TILE;
    const pTileY = state.playerPos.y / SCALED_TILE;
    for (const npc of WORLD_NPCS) {
      const npcEntity = entityMgr.get(npc.id);
      if (!npcEntity) continue;
      const npcTileX = npcEntity.position.x / SCALED_TILE;
      const npcTileY = npcEntity.position.y / SCALED_TILE;
      const dx = npcTileX - pTileX;
      const dy = npcTileY - pTileY;
      if (Math.sqrt(dx * dx + dy * dy) < 1.5) {
        playSFX('npc_talk');
        state.setDialog({
          active: true,
          npcName: npc.name,
          lines: npc.dialog,
          currentLine: 0,
        });
        return;
      }
    }
  }, []);

  const handleBattleAction = useCallback((action: BattleAction, itemId?: string) => {
    const state = store.getState();
    if (state.battlePhase !== 'select' || !state.enemy) return;

    if (action === 'attack') playSFX('attack_hit');
    else if (action === 'defend') playSFX('defend');
    else if (action === 'run') playSFX('run_away');

    const enemy = state.enemy;
    const equippedStats = state.getEquippedStats();
    const atk = 5 + equippedStats.attack + Math.floor(state.playerLevel * 1.5);
    const def = 2 + equippedStats.defense + Math.floor(state.playerLevel * 0.5);

    if (action === 'run') {
      const escaped = Math.random() < 0.6;
      state.setBattleState({
        battlePhase: escaped ? 'result' : 'animate',
        battleMessage: escaped ? 'You escaped safely!' : "Couldn't escape!",
        battleResult: escaped ? 'run' : 'none',
        isDefending: false,
        lastAction: 'run',
      });
      if (!escaped) setTimeout(() => doEnemyTurn(), 800);
      return;
    }

    if (action === 'defend') {
      state.setBattleState({
        battlePhase: 'animate',
        battleMessage: 'You brace for impact!',
        isDefending: true,
        lastAction: 'defend',
      });
      setTimeout(() => doEnemyTurn(), 800);
      return;
    }

    if (action === 'item' && itemId) {
      const itemDef = ITEMS[itemId];
      if (!itemDef) return;
      state.removeItem(itemId, 1);
      let heal = 0;
      if (itemDef.effect === 'heal_small') heal = 15;
      else if (itemDef.effect === 'heal_medium') heal = 35;
      else if (itemDef.effect === 'heal_full') heal = 999;
      state.healPlayer(heal);
      state.setBattleState({
        battlePhase: 'animate',
        battleMessage: `Used ${itemDef.name}! Restored HP.`,
        isDefending: false,
        lastAction: 'item',
      });
      setTimeout(() => doEnemyTurn(), 1000);
      return;
    }

    // Attack
    const baseDmg = Math.max(1, atk - enemy.defense);
    const variance = Math.floor(baseDmg * 0.2);
    const damage = Math.max(1, baseDmg + Math.floor(Math.random() * variance * 2) - variance);
    const newEnemyHP = Math.max(0, state.enemyHP - damage);

    if (newEnemyHP <= 0) {
      const xpGain = enemy.xpReward;
      const goldGain = enemy.goldReward;
      const leveledUp = state.addXP(xpGain);
      state.addGold(goldGain);
      playSFX('victory');
      state.setBattleState({
        enemyHP: 0,
        battlePhase: 'result',
        battleMessage: leveledUp
          ? `${enemy.name} defeated! +${xpGain}XP +${goldGain}G\nLevel Up!`
          : `${enemy.name} defeated! +${xpGain}XP +${goldGain}G`,
        battleResult: 'win',
        lastAction: 'attack',
      });
    } else {
      state.setBattleState({
        enemyHP: newEnemyHP,
        battlePhase: 'animate',
        battleMessage: `You dealt ${damage} damage!`,
        isDefending: false,
        lastAction: 'attack',
      });
      setTimeout(() => doEnemyTurn(), 800);
    }
  }, []);

  const doEnemyTurn = useCallback(() => {
    const state = store.getState();
    if (!state.enemy || state.battleResult !== 'none') return;

    const enemy = state.enemy;
    const equippedStats = state.getEquippedStats();
    const def = 2 + equippedStats.defense + Math.floor(state.playerLevel * 0.5);
    const defMultiplier = state.isDefending ? 2 : 1;
    const baseDmg = Math.max(1, enemy.attack - def * defMultiplier);
    const variance = Math.floor(baseDmg * 0.2);
    const damage = Math.max(1, baseDmg + Math.floor(Math.random() * variance * 2) - variance);

    const actualDmg = state.damagePlayer(damage);
    const newHP = state.playerHP;

    if (newHP <= 0) {
      state.setBattleState({
        battlePhase: 'result',
        battleMessage: `${enemy.name} dealt ${damage} damage!\nYou have been defeated...`,
        battleResult: 'lose',
      });
    } else {
      state.setBattleState({
        battlePhase: 'select',
        battleTurn: 'player',
        battleMessage: `${enemy.name} dealt ${damage} damage!`,
        isDefending: false,
      });
    }
  }, []);

  const handleBattleClose = useCallback(() => {
    const state = store.getState();
    if (state.battleResult === 'win' && Math.random() < 0.3) {
      state.addItem('healing_herb', 1);
    }
    if (state.battleResult === 'lose') {
      state.healPlayer(Math.floor(state.playerMaxHP / 2) - state.playerHP);
      state.addGold(-Math.floor(state.playerGold * 0.1));
    }
    state.endBattle();
    resetEncounterState();
    playSFX('victory');
  }, []);

  const handleUseItem = useCallback((itemId: string) => {
    store.getState().removeItem(itemId, 1);
    playSFX('item_use');
  }, []);

  const handleBorderDismiss = useCallback(() => {
    store.getState().dismissBorderCrossing();
  }, []);

  const handleBorderEnter = useCallback(() => {
    const state = store.getState();
    if (!state.borderCrossing) return;
    const code = state.borderCrossing.regionCode;
    state.setCurrentRegion(code);
    state.discoverRegion(code);
    state.dismissBorderCrossing();
  }, []);

  // Auto-save every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!store.getState().battleActive) saveGame();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // === BUILD BATTLE STATE for BattleScreen compatibility ===
  const battleActive_ = useGameStore(s => s.battleActive);
  const enemy = useGameStore(s => s.enemy);
  const enemyHP = useGameStore(s => s.enemyHP);
  const battleTurn = useGameStore(s => s.battleTurn);
  const battlePhase = useGameStore(s => s.battlePhase);
  const battleMessage = useGameStore(s => s.battleMessage);
  const battleResult = useGameStore(s => s.battleResult);
  const isDefending = useGameStore(s => s.isDefending);
  const lastAction = useGameStore(s => s.lastAction);

  const equippedStats = useGameStore(useShallow(s => s.getEquippedStats()));
  const battleState = useMemo(() => ({
    active: battleActive,
    enemy,
    enemyHP,
    playerHP,
    playerMaxHP,
    playerATK: 5 + equippedStats.attack + Math.floor(playerLevel * 1.5),
    playerDEF: 2 + equippedStats.defense + Math.floor(playerLevel * 0.5),
    turn: battleTurn,
    phase: battlePhase,
    message: battleMessage,
    result: battleResult,
    isDefending,
    playerXP,
    playerLevel,
    playerGold,
    lastAction,
  }), [battleActive, enemy, enemyHP, playerHP, playerMaxHP, playerLevel, playerGold, playerXP,
       equippedStats, battleTurn, battlePhase, battleMessage, battleResult, isDefending, lastAction]);

  const inventoryState = useMemo(() => ({ slots, equipped }), [slots, equipped]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.gameArea}>
        <TileRenderer map={worldMap} cameraX={camX} cameraY={camY} />
        <EntityRenderer
          npcData={npcRenderData}
          playerPos={playerPos}
          playerDir={playerDir}
          playerMoving={playerMoving}
          animFrame={animFrame}
          cameraX={camX}
          cameraY={camY}
        />
        <WeatherEffect weather={currentWeather} />
        <DayNightCycle />
        <MiniMap map={worldMap} playerTileX={playerTileX} playerTileY={playerTileY} />
        <DialogBox dialog={dialog} onAdvance={handleInteract} />
      </View>

      <View style={styles.controlsArea}>
        <View style={styles.infoBar}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoText}>{settlement || stateName}</Text>
            {settlement && <Text style={styles.stateText}>{stateName}</Text>}
          </View>
          <View style={styles.infoRight}>
            <Text style={styles.levelText}>Lv.{playerLevel}</Text>
            <Text style={styles.goldText}>{playerGold}G</Text>
            <Text style={styles.coordText}>({playerTileX},{playerTileY})</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.dpadContainer}>
            <DPad onDirectionChange={handleDirection} />
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
                  onPress={() => { playSFX('menu_select'); store.getState().setShowInventory(true); }}
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
          inventory={inventoryState}
          onClose={() => { playSFX('menu_back'); store.getState().setShowInventory(false); }}
          onEquip={(id) => { playSFX('equip'); store.getState().equipItem(id); }}
          onUnequip={(slot) => { playSFX('equip'); store.getState().unequipItem(slot); }}
          onUse={handleUseItem}
        />
      )}

      {battleActive && (
        <BattleScreen
          battle={battleState}
          inventory={inventoryState}
          onAction={handleBattleAction}
          onClose={handleBattleClose}
        />
      )}

      {borderCrossing?.active && (
        <BorderCrossingUI
          regionName={borderCrossing.regionName}
          isLocked={!store.getState().unlockedRegions.has(borderCrossing.regionCode)}
          requiredItem={getRequiredSanad(borderCrossing.regionCode)}
          onDismiss={handleBorderDismiss}
          onEnter={handleBorderEnter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black },
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
  infoLeft: { flex: 1 },
  infoRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoText: {
    color: PALETTE.yellow, fontSize: 13, fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  stateText: { color: PALETTE.lightGray, fontSize: 10, fontFamily: 'monospace' },
  levelText: { color: PALETTE.green, fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' },
  goldText: { color: PALETTE.yellow, fontSize: 11, fontFamily: 'monospace' },
  coordText: { color: PALETTE.midGray, fontSize: 10, fontFamily: 'monospace' },
  controlsRow: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24,
  },
  dpadContainer: { justifyContent: 'center' },
  buttonsContainer: { alignItems: 'center', justifyContent: 'center' },
  buttonRow: { flexDirection: 'row', gap: 16 },
  buttonWithLabel: { alignItems: 'center' },
  buttonLabelText: {
    color: PALETTE.lightGray, fontSize: 10, fontFamily: 'monospace',
    letterSpacing: 2, marginTop: 6,
  },
  bagButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4060a0', borderWidth: 3, borderColor: '#6080c0',
    alignItems: 'center', justifyContent: 'center',
  },
  bagButtonText: {
    color: PALETTE.white, fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace',
  },
});

export default WorldScreen;

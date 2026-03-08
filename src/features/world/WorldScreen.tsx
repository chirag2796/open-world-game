import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../core/store/useGameStore';
import { GameLoop } from '../../core/systems/GameLoop';
import { EntityManager } from '../../core/ecs/EntityManager';
import { MovementSystem } from '../../core/systems/MovementSystem';
import { CameraSystem, cameraX, cameraY, initCamera } from '../../core/systems/CameraSystem';
import { EncounterSystem, consumeEncounter, resetEncounterState } from '../../core/systems/EncounterSystem';
import { NPCAISystem } from '../../core/systems/NPCAISystem';
import { saveGame } from '../../core/persistence/SaveManager';
import { generateIndiaMap, WORLD_NPCS, PLAYER_START, getStateName, getStateCode, getNearestSettlement, getBiomeAt } from '../../data/india-map';
import { ITEMS, rollLootTable } from '../../data/items';
import { PALETTE, GAME_AREA_HEIGHT, CONTROLS_HEIGHT, SCREEN_WIDTH, SCALED_TILE, DEV_MODE, setDevMode } from '../../engine/constants';
import { useSound } from '../../engine/useSound';
import TileRenderer from '../../components/TileRenderer';
import DecorationRenderer from '../../components/DecorationRenderer';
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
import { Direction, BattleAction } from '../../types';
import { getRequiredSanad, getRegionName } from '../../data/regions';
import { startDialog, advanceDialog, DialogSession } from '../../engine/dialogEngine';
import { pickEnemyMove } from '../../engine/combatEngine';
import BorderCrossingUI from '../../components/BorderCrossingUI';
import JournalScreen from '../../components/JournalScreen';

const WorldScreen: React.FC = () => {
  // === DEV MODE ===
  const [devModeOn, setDevModeOn] = useState(DEV_MODE);
  const toggleDevMode = useCallback(() => {
    const next = !DEV_MODE;
    setDevMode(next);
    setDevModeOn(next);
  }, []);

  // === MAP (generated once) ===
  const worldMap = useMemo(() => generateIndiaMap(), []);

  // === ECS ===
  const entityMgr = useRef(new EntityManager()).current;
  const gameLoop = useRef(new GameLoop()).current;
  const initialized = useRef(false);
  const dialogSessionRef = useRef<DialogSession | null>(null);

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
  const battleActive = useGameStore(s => s.battle.active);
  const slots = useGameStore(s => s.slots);
  const equipped = useGameStore(s => s.equipped);
  const weather = useGameStore(s => s.weather);
  const gameMinutes = useGameStore(s => s.gameMinutes);
  const borderCrossing = useGameStore(s => s.borderCrossing);
  const currentRegion = useGameStore(s => s.currentRegion);
  const objectiveText = useGameStore(s => s.getObjectiveText());
  const activeQuestId = useGameStore(s => s.activeQuestId);
  const activeStepIndex = useGameStore(s => s.activeStepIndex);
  const completedQuests = useGameStore(s => s.completedQuests);
  const questLog = useGameStore(s => s.questLog);
  const [showJournal, setShowJournal] = useState(false);

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
      if (state.paused || state.dialog.active || state.battle.active || state.borderCrossing?.active) return;

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

      // Check region crossing BEFORE updating store (so we don't save a locked position)
      const tileX = Math.floor(px / SCALED_TILE);
      const tileY = Math.floor(py / SCALED_TILE);
      const regionCode = getStateCode(tileX, tileY);
      if (regionCode && regionCode !== state.currentRegion) {
        const s = store.getState();
        if (!DEV_MODE && !s.unlockedRegions.has(regionCode)) {
          // Blocked — show border crossing UI and push player back
          const rName = getRegionName(regionCode);
          s.showBorderCrossing(regionCode, rName);
          const p = entityMgr.getPlayer();
          if (p) {
            p.position.x = state.playerPos.x;
            p.position.y = state.playerPos.y;
          }
          return; // Don't update store with the locked position
        } else {
          // Entered new region (or dev mode bypass)
          s.setCurrentRegion(regionCode);
          s.discoverRegion(regionCode);
        }
      }

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

      // Check encounters (skip in dev mode)
      if (!DEV_MODE && consumeEncounter()) {
        const biome = getBiomeAt(tileX, tileY);
        const s2 = store.getState();
        const equippedStats = s2.getEquippedStats();
        const lvl = s2.playerLevel;
        const atk = 5 + equippedStats.attack + Math.floor(lvl * 1.5);
        const def = 2 + equippedStats.defense + Math.floor(lvl * 0.5);
        const effectiveSpeed = Math.max(1, 10 + equippedStats.speed - equippedStats.weight);
        playSFX('battle_start');
        s2.startBattle(biome, lvl, atk, def, s2.playerHP, s2.playerMaxHP, s2.playerXP, s2.playerGold, effectiveSpeed, equippedStats.crit);
      }

      // Check quest triggers
      const qs = store.getState();
      const questResult = qs.checkQuestTriggers({
        playerTileX: tileX,
        playerTileY: tileY,
        storyFlags: qs.storyFlags,
        items: new Set(qs.slots.map(s => s.itemId)),
      });
      if (questResult.triggered) {
        const oc = questResult.onComplete;
        if (oc) {
          if (oc.setFlags) oc.setFlags.forEach(f => qs.setStoryFlag(f));
          if (oc.giveItems) oc.giveItems.forEach(i => qs.addItem(i.itemId, i.quantity));
          if (oc.giveGold) qs.addGold(oc.giveGold);
          if (oc.unlockRegions) oc.unlockRegions.forEach(r => qs.unlockRegion(r));
          if (oc.message) qs.addQuestLog(oc.message);
          if (oc.startBattleWithEnemy) {
            // Auto-start a scripted battle
            const s3 = store.getState();
            const equippedStats = s3.getEquippedStats();
            const lvl = s3.playerLevel;
            const atk = 5 + equippedStats.attack + Math.floor(lvl * 1.5);
            const def = 2 + equippedStats.defense + Math.floor(lvl * 0.5);
            playSFX('battle_start');
            s3.startBattleWith(oc.startBattleWithEnemy, lvl, atk, def, s3.playerHP, s3.playerMaxHP, s3.playerXP, s3.playerGold);
          } else if (oc.dialogTreeId) {
            // Auto-start a dialog tree
            const session = startDialog(
              oc.dialogTreeId,
              qs.playerKarma,
              new Set(qs.slots.map(s => s.itemId)),
              qs.storyFlags,
            );
            if (session) {
              dialogSessionRef.current = session;
              qs.setDialog({
                active: true,
                npcName: session.currentNode.speaker,
                lines: [session.currentNode.text],
                currentLine: 0,
                treeId: session.tree.id,
                currentNodeId: session.currentNode.id,
                choices: session.availableChoices.length > 0
                  ? session.availableChoices : undefined,
              });
            }
          }
        }
        qs.advanceQuestStep();
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

  // Sync game hour to game loop for NPC schedules
  useEffect(() => {
    gameLoop.setGameHour(Math.floor(gameMinutes / 60));
  }, [gameMinutes]);

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
      // If branching dialog session, advance it
      if (dialogSessionRef.current) {
        const result = advanceDialog(
          dialogSessionRef.current,
          null, // linear advance (no choice)
          state.playerKarma,
          new Set(state.slots.map(s => s.itemId)),
          state.storyFlags,
        );
        // Apply rewards from the node we're leaving
        if (result.karmaChange) state.adjustKarma(result.karmaChange);
        if (result.giveItem) state.addItem(result.giveItem, 1);
        if (result.giveGold) state.addGold(result.giveGold);
        if (result.setFlag) state.setStoryFlag(result.setFlag);

        if (result.session) {
          dialogSessionRef.current = result.session;
          state.setDialog({
            active: true,
            npcName: state.dialog.npcName,
            lines: [result.session.currentNode.text],
            currentLine: 0,
            treeId: result.session.tree.id,
            currentNodeId: result.session.currentNode.id,
            choices: result.session.availableChoices.length > 0
              ? result.session.availableChoices : undefined,
          });
        } else {
          // Dialog tree completed — set completion flag for quest triggers
          const treeId = state.dialog.treeId;
          if (treeId) state.setStoryFlag(`dialog_completed_${treeId}`);
          // Also set talwar_choice_made flag if relevant
          if (treeId === 'quest_talwar_choice') state.setStoryFlag('talwar_choice_made');
          dialogSessionRef.current = null;
          state.closeDialog();
        }
        return;
      }
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

        // Try branching dialogue first
        if (npc.dialogTreeId) {
          const session = startDialog(
            npc.dialogTreeId,
            state.playerKarma,
            new Set(state.slots.map(s => s.itemId)),
            state.storyFlags,
          );
          if (session) {
            dialogSessionRef.current = session;
            state.setDialog({
              active: true,
              npcName: npc.name,
              lines: [session.currentNode.text],
              currentLine: 0,
              treeId: session.tree.id,
              currentNodeId: session.currentNode.id,
              choices: session.availableChoices.length > 0
                ? session.availableChoices : undefined,
            });
            return;
          }
        }

        // Fallback to simple dialog
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

  const handleDialogChoice = useCallback((choiceIndex: number) => {
    const state = store.getState();
    if (!dialogSessionRef.current) return;

    playSFX('npc_talk');
    const result = advanceDialog(
      dialogSessionRef.current,
      choiceIndex,
      state.playerKarma,
      new Set(state.slots.map(s => s.itemId)),
      state.storyFlags,
    );

    if (result.karmaChange) state.adjustKarma(result.karmaChange);
    if (result.giveItem) state.addItem(result.giveItem, 1);
    if (result.giveGold) state.addGold(result.giveGold);
    if (result.setFlag) state.setStoryFlag(result.setFlag);

    if (result.session) {
      dialogSessionRef.current = result.session;
      state.setDialog({
        active: true,
        npcName: state.dialog.npcName,
        lines: [result.session.currentNode.text],
        currentLine: 0,
        treeId: result.session.tree.id,
        currentNodeId: result.session.currentNode.id,
        choices: result.session.availableChoices.length > 0
          ? result.session.availableChoices : undefined,
      });
    } else {
      // Dialog tree completed — set completion flag for quest triggers
      const treeId = state.dialog.treeId;
      if (treeId) state.setStoryFlag(`dialog_completed_${treeId}`);
      if (treeId === 'quest_talwar_choice') state.setStoryFlag('talwar_choice_made');
      dialogSessionRef.current = null;
      state.closeDialog();
    }
  }, []);

  const handleBattleAction = useCallback((action: BattleAction, payload?: string) => {
    const state = store.getState();
    if (state.battle.phase !== 'select' || !state.battle.enemy) return;

    if (action === 'move' && payload) {
      playSFX('attack_hit');
      state.executePlayerMove(payload);
      return;
    }

    if (action === 'defend') {
      playSFX('defend');
      state.executeDefend();
      return;
    }

    if (action === 'run') {
      playSFX('run_away');
      state.executeRun();
      return;
    }

    if (action === 'item' && payload) {
      const itemDef = ITEMS[payload];
      if (!itemDef) return;
      state.removeItem(payload, 1);
      let heal = 0;
      if (itemDef.effect === 'heal_small') heal = 15;
      else if (itemDef.effect === 'heal_medium') heal = 35;
      else if (itemDef.effect === 'heal_full') heal = 999;
      const newHP = Math.min(state.battle.playerMaxHP, state.battle.playerHP + heal);
      state.healPlayer(heal);
      state.setBattle({
        playerHP: newHP,
        phase: 'animate',
        message: `Used ${itemDef.name}! Restored HP.`,
        isDefending: false,
        lastAction: 'item',
      });
      // Enemy still gets a turn after item use
      const enemyMove = pickEnemyMove(state.battle.enemy!.moves);
      state.setBattle({
        combatStack: [
          { type: 'execute_move' as const, actorId: 'enemy', moveId: enemyMove.id, targetId: 'player' },
          { type: 'end_turn' as const },
        ],
      });
      setTimeout(() => store.getState().processCombatStack(), 800);
      return;
    }
  }, []);

  const handleBattleClose = useCallback(() => {
    const state = store.getState();
    const b = state.battle;
    if (b.result === 'win') {
      // Award XP and gold, roll loot table
      const enemy = b.enemy;
      if (enemy) {
        state.addXP(enemy.xpReward);
        state.addGold(enemy.goldReward);
        // Loot table drops
        if (enemy.lootTableId) {
          const loot = rollLootTable(enemy.lootTableId, state.playerLevel);
          if (loot.gold > 0) state.addGold(loot.gold);
          if ('itemId' in loot && loot.itemId) {
            state.addItem(loot.itemId, 1);
            state.addQuestLog(`Found: ${ITEMS[loot.itemId]?.name ?? loot.itemId}`);
          }
        }
      }
      playSFX('victory');

      // Quest: track battle wins
      state.incrementBattleWins(state.currentRegion);
      // Set first_combat_won flag (for stage 2)
      if (!state.storyFlags.has('first_combat_won')) {
        state.setStoryFlag('first_combat_won');
      }
      // Training wins tracking (stage 4)
      if (state.storyFlags.has('mentor_training_start') && !state.storyFlags.has('training_wins_3')) {
        if (state.battleWinCount >= 3) {
          state.setStoryFlag('training_wins_3');
        }
      }
      // Rajasthan wins tracking (stage 6)
      if (state.storyFlags.has('rajput_contact') && !state.storyFlags.has('rajasthan_wins_5')) {
        const rWins = (state.regionBattleWins['r'] || 0) + (state.regionBattleWins['g'] || 0);
        if (rWins >= 5) {
          state.setStoryFlag('rajasthan_wins_5');
        }
      }
      // Boss victory flags
      if (enemy) {
        if (enemy.id === 'corrupted_asura') state.setStoryFlag('asura_defeated');
        if (enemy.id === 'cosmic_asura') state.setStoryFlag('final_boss_defeated');
      }
    }
    if (b.result === 'lose') {
      state.healPlayer(Math.floor(state.playerMaxHP / 2) - state.playerHP);
      state.addGold(-Math.floor(state.playerGold * 0.1));
    }
    // Sync battle HP back to player store
    if (b.result !== 'lose') {
      const hpDiff = b.playerHP - state.playerHP;
      if (hpDiff < 0) state.damagePlayer(-hpDiff);
      else if (hpDiff > 0) state.healPlayer(hpDiff);
    }
    state.endBattle();
    resetEncounterState();
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
      if (!store.getState().battle.active) saveGame();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // === BATTLE STATE (directly from store) ===
  const battleState = useGameStore(s => s.battle);

  const inventoryState = useMemo(() => ({ slots, equipped }), [slots, equipped]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.gameArea}>
        <TileRenderer map={worldMap} cameraX={camX} cameraY={camY} />
        <DecorationRenderer map={worldMap} cameraX={camX} cameraY={camY} />
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
        {!dialog.active && !battleActive && objectiveText && (
          <View style={styles.questHud}>
            <Text style={styles.questHudLabel}>QUEST</Text>
            <Text style={styles.questHudText} numberOfLines={2}>{objectiveText}</Text>
          </View>
        )}
        <DialogBox dialog={dialog} onAdvance={handleInteract} onChoice={handleDialogChoice} />
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
            <TouchableOpacity onPress={toggleDevMode} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.coordText, devModeOn && styles.devModeActive]}>
                {devModeOn ? 'GOD' : 'DEV'}
              </Text>
            </TouchableOpacity>
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
              <View style={styles.buttonWithLabel}>
                <TouchableOpacity
                  style={styles.journalButton}
                  onPress={() => { playSFX('menu_select'); setShowJournal(true); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bagButtonText}>J</Text>
                </TouchableOpacity>
                <Text style={styles.buttonLabelText}>LOG</Text>
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

      {showJournal && (
        <JournalScreen
          activeQuestId={activeQuestId}
          activeStepIndex={activeStepIndex}
          completedQuests={completedQuests}
          questLog={questLog}
          onClose={() => { playSFX('menu_back'); setShowJournal(false); }}
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
  devModeActive: { color: PALETTE.hpRed, fontWeight: 'bold' },
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
  journalButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#705020', borderWidth: 3, borderColor: '#906830',
    alignItems: 'center', justifyContent: 'center',
  },
  bagButtonText: {
    color: PALETTE.white, fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace',
  },
  questHud: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 100,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  questHudLabel: {
    color: PALETTE.yellow,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  questHudText: {
    color: PALETTE.white,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default WorldScreen;

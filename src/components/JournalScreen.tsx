import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PALETTE, SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/constants';
import { MAIN_QUESTS, QUEST_ORDER, QuestDef } from '../data/quests';

type JournalTab = 'main' | 'log';

const ACT_COLORS = {
  departure: '#c0a040',
  initiation: '#c06040',
  return: '#40a0c0',
};

const ACT_LABELS = {
  departure: 'ACT I: DEPARTURE',
  initiation: 'ACT II: INITIATION',
  return: 'ACT III: RETURN',
};

interface JournalScreenProps {
  activeQuestId: string;
  activeStepIndex: number;
  completedQuests: Set<string>;
  questLog: string[];
  onClose: () => void;
}

const JournalScreen: React.FC<JournalScreenProps> = ({
  activeQuestId,
  activeStepIndex,
  completedQuests,
  questLog,
  onClose,
}) => {
  const [tab, setTab] = useState<JournalTab>('main');
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(activeQuestId);

  const activeQuest = MAIN_QUESTS[activeQuestId] || null;

  const getQuestStatus = (questId: string): 'completed' | 'active' | 'locked' => {
    if (completedQuests.has(questId)) return 'completed';
    if (questId === activeQuestId) return 'active';
    return 'locked';
  };

  const renderQuestEntry = (questId: string) => {
    const quest = MAIN_QUESTS[questId];
    if (!quest) return null;
    const status = getQuestStatus(questId);
    const isExpanded = expandedQuestId === questId;
    const actColor = ACT_COLORS[quest.act];

    return (
      <View key={questId}>
        <TouchableOpacity
          style={[
            styles.questRow,
            status === 'active' && styles.questRowActive,
            status === 'locked' && styles.questRowLocked,
          ]}
          onPress={() => setExpandedQuestId(isExpanded ? null : questId)}
        >
          <View style={[styles.stageBadge, { backgroundColor: actColor }]}>
            <Text style={styles.stageBadgeText}>{quest.stage}</Text>
          </View>
          <View style={styles.questInfo}>
            <Text style={[
              styles.questTitle,
              status === 'completed' && styles.questTitleCompleted,
              status === 'locked' && styles.questTitleLocked,
            ]}>
              {status === 'locked' ? '???' : quest.title}
            </Text>
            <Text style={styles.questLocation}>
              {status === 'locked' ? '---' : quest.location}
            </Text>
          </View>
          <Text style={[
            styles.statusIcon,
            status === 'completed' && { color: '#40c040' },
            status === 'active' && { color: PALETTE.yellow },
            status === 'locked' && { color: PALETTE.midGray },
          ]}>
            {status === 'completed' ? 'DONE' : status === 'active' ? 'NOW' : '--'}
          </Text>
        </TouchableOpacity>

        {isExpanded && status !== 'locked' && (
          <View style={styles.questDetail}>
            <Text style={styles.questDesc}>{quest.description}</Text>
            {quest.steps.map((step, idx) => {
              const isStepDone = status === 'completed' || (status === 'active' && idx < activeStepIndex);
              const isStepCurrent = status === 'active' && idx === activeStepIndex;
              return (
                <View key={step.id} style={styles.stepRow}>
                  <Text style={[
                    styles.stepMarker,
                    isStepDone && { color: '#40c040' },
                    isStepCurrent && { color: PALETTE.yellow },
                  ]}>
                    {isStepDone ? '[x]' : isStepCurrent ? '[>]' : '[ ]'}
                  </Text>
                  <Text style={[
                    styles.stepText,
                    isStepDone && styles.stepTextDone,
                    isStepCurrent && styles.stepTextCurrent,
                  ]}>
                    {step.description}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // Group quests by act
  const actGroups: { act: QuestDef['act']; quests: string[] }[] = [
    { act: 'departure', quests: QUEST_ORDER.filter(id => MAIN_QUESTS[id]?.act === 'departure') },
    { act: 'initiation', quests: QUEST_ORDER.filter(id => MAIN_QUESTS[id]?.act === 'initiation') },
    { act: 'return', quests: QUEST_ORDER.filter(id => MAIN_QUESTS[id]?.act === 'return') },
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>JOURNAL</Text>
          {activeQuest && (
            <Text style={styles.headerQuest} numberOfLines={1}>{activeQuest.title}</Text>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>X</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'main' && styles.tabActive]}
            onPress={() => setTab('main')}
          >
            <Text style={[styles.tabText, tab === 'main' && styles.tabTextActive]}>
              MAIN QUEST
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'log' && styles.tabActive]}
            onPress={() => setTab('log')}
          >
            <Text style={[styles.tabText, tab === 'log' && styles.tabTextActive]}>
              QUEST LOG
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {tab === 'main' ? (
            <>
              {actGroups.map(group => {
                // Only show act header if at least one quest in the act is not locked
                const hasVisible = group.quests.some(id => getQuestStatus(id) !== 'locked');
                if (!hasVisible && group.act !== 'departure') return null;
                return (
                  <View key={group.act}>
                    <View style={[styles.actHeader, { borderLeftColor: ACT_COLORS[group.act] }]}>
                      <Text style={[styles.actLabel, { color: ACT_COLORS[group.act] }]}>
                        {ACT_LABELS[group.act]}
                      </Text>
                    </View>
                    {group.quests.map(renderQuestEntry)}
                  </View>
                );
              })}
            </>
          ) : (
            <>
              {questLog.length === 0 ? (
                <Text style={styles.emptyText}>No quest log entries yet.</Text>
              ) : (
                [...questLog].reverse().map((msg, idx) => (
                  <View key={idx} style={styles.logEntry}>
                    <Text style={styles.logBullet}>{'>'}</Text>
                    <Text style={styles.logText}>{msg}</Text>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 12,
    backgroundColor: PALETTE.uiBg,
    borderWidth: 3,
    borderColor: '#906830',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#3a2a18',
    borderBottomWidth: 2,
    borderBottomColor: '#906830',
  },
  title: {
    color: '#e0c080',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  headerQuest: {
    color: PALETTE.yellow,
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#803030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#3a2a18',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#906830',
    borderBottomColor: '#e0c080',
  },
  tabText: {
    color: PALETTE.lightGray,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#e0c080',
  },
  content: {
    flex: 1,
  },
  actHeader: {
    borderLeftWidth: 4,
    paddingLeft: 10,
    paddingVertical: 8,
    backgroundColor: '#2a1a10',
    marginTop: 2,
  },
  actLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a18',
  },
  questRowActive: {
    backgroundColor: '#3a3020',
  },
  questRowLocked: {
    opacity: 0.5,
  },
  stageBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stageBadgeText: {
    color: PALETTE.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    color: PALETTE.uiText,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  questTitleCompleted: {
    color: '#80a080',
  },
  questTitleLocked: {
    color: PALETTE.midGray,
  },
  questLocation: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusIcon: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  questDetail: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a1a10',
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a18',
  },
  questDesc: {
    color: PALETTE.lightGray,
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stepMarker: {
    color: PALETTE.midGray,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginRight: 6,
    width: 24,
  },
  stepText: {
    color: PALETTE.lightGray,
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 16,
  },
  stepTextDone: {
    color: '#80a080',
    textDecorationLine: 'line-through',
  },
  stepTextCurrent: {
    color: PALETTE.yellow,
  },
  emptyText: {
    color: PALETTE.midGray,
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 30,
  },
  logEntry: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3a2a18',
  },
  logBullet: {
    color: '#906830',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginRight: 8,
  },
  logText: {
    color: PALETTE.uiText,
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 16,
  },
});

export default memo(JournalScreen);

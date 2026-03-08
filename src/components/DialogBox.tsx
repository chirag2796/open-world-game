import React, { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DialogState, DialogChoice } from '../types';
import { PALETTE, SCREEN_WIDTH } from '../engine/constants';

interface DialogBoxProps {
  dialog: DialogState;
  onAdvance: () => void;
  onChoice?: (index: number) => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ dialog, onAdvance, onChoice }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isBranching = !!dialog.treeId && !!dialog.currentNodeId;
  const fullText = isBranching
    ? (dialog.lines[0] || '')
    : (dialog.lines[dialog.currentLine] || '');
  const choices = dialog.choices;
  const hasChoices = choices && choices.length > 0;

  // Typewriter effect
  useEffect(() => {
    if (!dialog.active) return;

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const interval = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [dialog.currentLine, dialog.currentNodeId, dialog.active, fullText]);

  if (!dialog.active) return null;

  const isLastLine = !isBranching && dialog.currentLine >= dialog.lines.length - 1;

  // If branching with choices, show choice buttons instead of tap-to-advance
  if (hasChoices && !isTyping) {
    return (
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.container}>
          <View style={styles.namePlate}>
            <Text style={styles.nameText}>{dialog.npcName}</Text>
          </View>
          <View style={styles.outerBorder}>
            <View style={styles.innerBorder}>
              <View style={styles.textArea}>
                <Text style={styles.dialogText}>{displayedText}</Text>
              </View>
              <View style={styles.choicesContainer}>
                {choices!.map((choice, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.choiceButton}
                    onPress={() => onChoice?.(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.choiceText}>{choice.text}</Text>
                    {choice.karmaEffect > 0 && (
                      <Text style={styles.karmaGood}>+dharma</Text>
                    )}
                    {choice.karmaEffect < 0 && (
                      <Text style={styles.karmaBad}>-dharma</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={onAdvance}
      activeOpacity={1}
    >
      <View style={styles.container}>
        <View style={styles.namePlate}>
          <Text style={styles.nameText}>{dialog.npcName}</Text>
        </View>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.textArea}>
              <Text style={styles.dialogText}>{displayedText}</Text>
            </View>
            <View style={styles.indicator}>
              {!isTyping && (
                <Text style={styles.indicatorText}>
                  {isLastLine || isBranching ? '[ END ]' : '[ >> ]'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  container: {
    width: SCREEN_WIDTH - 16,
  },
  namePlate: {
    backgroundColor: PALETTE.uiBg,
    borderWidth: 2,
    borderColor: PALETTE.uiBorder,
    borderBottomWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginLeft: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  nameText: {
    color: PALETTE.yellow,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  outerBorder: {
    borderWidth: 3,
    borderColor: PALETTE.uiBorder,
    borderRadius: 4,
    backgroundColor: PALETTE.uiBg,
  },
  innerBorder: {
    borderWidth: 2,
    borderColor: PALETTE.uiDark,
    borderRadius: 2,
    margin: 2,
    padding: 12,
    minHeight: 80,
  },
  textArea: {
    flex: 1,
  },
  dialogText: {
    color: PALETTE.uiText,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  indicator: {
    alignItems: 'flex-end',
    marginTop: 8,
    height: 16,
  },
  indicatorText: {
    color: PALETTE.lightGray,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  choicesContainer: {
    marginTop: 10,
    gap: 6,
  },
  choiceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PALETTE.uiDark,
    borderWidth: 1,
    borderColor: PALETTE.uiBorder,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  choiceText: {
    color: PALETTE.uiText,
    fontSize: 14,
    fontFamily: 'monospace',
    flex: 1,
  },
  karmaGood: {
    color: PALETTE.green,
    fontSize: 10,
    fontFamily: 'monospace',
    marginLeft: 8,
  },
  karmaBad: {
    color: PALETTE.red,
    fontSize: 10,
    fontFamily: 'monospace',
    marginLeft: 8,
  },
});

export default memo(DialogBox);

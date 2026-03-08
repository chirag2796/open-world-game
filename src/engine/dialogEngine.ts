import { DialogTree, DialogNode, DialogChoice } from '../types';
import { DIALOG_TREES } from '../data/dialogTrees';

// Dialogue engine: resolves branching dialog trees with karma/item checks

export interface DialogSession {
  tree: DialogTree;
  currentNode: DialogNode;
  availableChoices: DialogChoice[];
}

export function startDialog(
  treeId: string,
  playerKarma: number,
  playerItems: Set<string>,
  storyFlags: Set<string>,
): DialogSession | null {
  const tree = DIALOG_TREES[treeId];
  if (!tree) return null;

  const node = tree.nodes[tree.startNodeId];
  if (!node) return null;

  // Check requireFlag
  if (node.requireFlag && !storyFlags.has(node.requireFlag)) return null;

  return {
    tree,
    currentNode: node,
    availableChoices: filterChoices(node.choices, playerKarma, playerItems),
  };
}

export function advanceDialog(
  session: DialogSession,
  choiceIndex: number | null, // null for linear nodes
  playerKarma: number,
  playerItems: Set<string>,
  storyFlags: Set<string>,
): { session: DialogSession | null; karmaChange: number; giveItem?: string; giveGold?: number; setFlag?: string } {
  const { tree, currentNode } = session;
  let nextNodeId: string | undefined;
  let karmaChange = 0;

  if (choiceIndex !== null && currentNode.choices && currentNode.choices[choiceIndex]) {
    const choice = currentNode.choices[choiceIndex];
    nextNodeId = choice.nextNodeId;
    karmaChange = choice.karmaEffect;
  } else {
    nextNodeId = currentNode.nextNodeId;
  }

  // Collect rewards from current node
  const giveItem = currentNode.giveItem;
  const giveGold = currentNode.giveGold;
  const setFlag = currentNode.setFlag;

  if (!nextNodeId) {
    // End of conversation
    return { session: null, karmaChange, giveItem, giveGold, setFlag };
  }

  const nextNode = tree.nodes[nextNodeId];
  if (!nextNode) {
    return { session: null, karmaChange, giveItem, giveGold, setFlag };
  }

  // Check requireFlag on next node
  if (nextNode.requireFlag && !storyFlags.has(nextNode.requireFlag)) {
    return { session: null, karmaChange, giveItem, giveGold, setFlag };
  }

  return {
    session: {
      tree,
      currentNode: nextNode,
      availableChoices: filterChoices(nextNode.choices, playerKarma + karmaChange, playerItems),
    },
    karmaChange,
    giveItem,
    giveGold,
    setFlag,
  };
}

function filterChoices(
  choices: DialogChoice[] | undefined,
  karma: number,
  items: Set<string>,
): DialogChoice[] {
  if (!choices) return [];
  return choices.filter(c => {
    if (c.requiredKarma !== undefined && karma < c.requiredKarma) return false;
    if (c.requiredItem && !items.has(c.requiredItem)) return false;
    return true;
  });
}

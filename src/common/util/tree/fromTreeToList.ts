import { Nullish } from '@table-library/react-table-library/types/common';
import { Data, TableNode, ExtendedNode } from '@table-library/react-table-library/types/table';

import { hasLeaves } from './hasLeaves';

export const fromTreeToList = <T extends TableNode>(nodes: T[] | Nullish): T[] =>
  (nodes || []).reduce((acc: T[], value: T) => {
    acc = acc.concat(value); // eslint-disable-line no-param-reassign

    if (value.nodes) {
      acc = acc.concat(fromTreeToList(value.nodes as T[])); // eslint-disable-line no-param-reassign
    }

    return acc;
  }, []);

export const fromTreeToListExtended = (
  data: Data,
  nodes: TableNode[],
  treeIds: string[],
  treeXLevel = 0,
  treeYLevel = 0,
  parentNode: ExtendedNode<TableNode> | Nullish,
): ExtendedNode<TableNode>[] =>
  (nodes || []).reduce((acc: ExtendedNode<TableNode>[], value: TableNode) => {
    let listNode;

    if (value.nodes) {
      listNode = { ...value, nodes: value.nodes.map((node: TableNode) => node.id) };
    } else {
      listNode = value;
    }

    const extendedNode = {
      treeXLevel,
      treeYLevel,
      // TODO: data needs to be explicitly typed here for this edge case of root
      parentNode: (parentNode || data) as ExtendedNode<TableNode>,
      ancestors: (parentNode
        ? [parentNode, ...(parentNode?.ancestors ?? [])]
        : [parentNode || data]) as ExtendedNode<TableNode>[],
    };

    listNode = {
      ...listNode,
      ...extendedNode,
    } as ExtendedNode<TableNode>;

    acc = acc.concat(listNode); // eslint-disable-line no-param-reassign

    if (hasLeaves(value) && treeIds.includes(value.id)) {
      // eslint-disable-next-line no-param-reassign
      acc = acc.concat(
        fromTreeToListExtended(data, value.nodes!, treeIds, treeXLevel + 1, treeYLevel, {
          ...value,
          ...extendedNode,
        }),
      );
    }

    return acc;
  }, []);

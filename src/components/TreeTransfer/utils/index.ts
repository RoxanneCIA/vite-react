import type { Key, ReactNode } from 'react';

export interface TreeNode {
  key: Key;
  title?: ReactNode;
  children?: TreeNode[];
}

export const filterTreeData = <T extends TreeNode>(treeData: T[] = [], value?: string, separator = ','): T[] => {
  return treeData
    .map(item => ({ ...item, children: filterTreeData(item.children, value, separator) }))
    .filter(
      item =>
        item.children.length > 0 || (`${item.title}`.indexOf(value ?? '') !== -1 && `${item.key}`.includes(separator))
    );
};

export const flattenTree = <T extends TreeNode>(treeData: T[] = [], result: Omit<TreeNode, 'children'>[] = []) => {
  treeData.forEach(item => {
    const { children, ...rest } = item;
    result.push(rest);
    flattenTree(children, result);
  });
  return result;
};

export const flattenTreeKeys = <T extends TreeNode>(data: T[] = [], result: Key[] = []) => {
  data.forEach(item => {
    const { children, key } = item;
    result.push(key);
    if (children?.length) flattenTreeKeys(children, result);
  });
  return result;
};

export const splitKey = (key: Key, separator = ',') => `${key}`.split(separator)[1] || key;

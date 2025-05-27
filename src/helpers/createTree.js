let count = 0;

const createTree = (arr, parentId = "") => {
  const tree = [];
  arr.forEach(item => {
    if (item.parent_id === parentId) {
      count++;
      const newItem = { ...item }; // clone object
      newItem.index = count;
      const children = createTree(arr, item.id);
      if (children.length > 0) {
        newItem.children = children;
      }
      tree.push(newItem);
    }
  });
  return tree;
};

// Hàm khởi tạo reset count và gọi createTree
const generateTree = (arr, parentId = "") => {
  count = 0;
  return createTree(arr, parentId);
};

export default generateTree;

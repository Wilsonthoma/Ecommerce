// Create this file - for search autocomplete
export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
    this.productIds = [];
  }
}

export class SearchTrie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, productId) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
      node.productIds.push(productId);
    }
    node.isEnd = true;
  }

  searchPrefix(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char);
    }
    return node.productIds;
  }

  autoComplete(prefix, limit = 5) {
    return this.searchPrefix(prefix).slice(0, limit);
  }

  buildFromProducts(products) {
    products.forEach(product => {
      const words = product.name.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 1) this.insert(word, product.id);
      });
    });
  }
}
// Create this file - for caching API responses
export class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  createNode(key, value) {
    return { key, value, prev: null, next: null };
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const node = this.cache.get(key);
    this.moveToFront(node);
    return node.value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this.moveToFront(node);
    } else {
      if (this.cache.size >= this.capacity) {
        this.removeLRU();
      }
      const newNode = this.createNode(key, value);
      this.cache.set(key, newNode);
      this.addToFront(newNode);
    }
  }

  moveToFront(node) {
    if (node === this.head) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  addToFront(node) {
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  removeLRU() {
    if (!this.tail) return;
    this.cache.delete(this.tail.key);
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
  }

  clear() {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }
}

export const productCache = new LRUCache(50);
export const categoryCache = new LRUCache(20);
export const searchCache = new LRUCache(30);
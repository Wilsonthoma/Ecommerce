// Create this file - for fast price range searches
export class SortedProductArray {
  constructor(products = [], sortKey = 'price') {
    this.products = [...products].sort((a, b) => a[sortKey] - b[sortKey]);
    this.sortKey = sortKey;
  }

  findInPriceRange(minPrice, maxPrice) {
    let left = 0;
    let right = this.products.length - 1;
    let startIndex = -1;
    
    // Find start index
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.products[mid][this.sortKey] >= minPrice) {
        startIndex = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    
    if (startIndex === -1) return [];
    
    // Find end index
    left = startIndex;
    right = this.products.length - 1;
    let endIndex = startIndex;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.products[mid][this.sortKey] <= maxPrice) {
        endIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return this.products.slice(startIndex, endIndex + 1);
  }
}
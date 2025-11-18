/**
 * Generic Object Pool for efficient object reuse
 * Avoids frequent allocations/deallocations
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset?: (obj: T) => void;

  constructor(
    factory: () => T,
    reset?: (obj: T) => void,
    initialSize: number = 10
  ) {
    this.factory = factory;
    this.reset = reset;

    // Pre-allocate initial objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      // Pool exhausted, create new object
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      if (this.reset) {
        this.reset(obj);
      }
      this.available.push(obj);
    }
  }

  releaseAll(): void {
    this.inUse.forEach(obj => {
      if (this.reset) {
        this.reset(obj);
      }
      this.available.push(obj);
    });
    this.inUse.clear();
  }

  getActiveCount(): number {
    return this.inUse.size;
  }

  getTotalCount(): number {
    return this.available.length + this.inUse.size;
  }
}

// Modified from https://stackoverflow.com/a/74649125

class Item<T> {
    value: T
    priority: number
    constructor(value: T, priority: number) {
        this.value = value;
        this.priority = priority
    }
}

const swap = (arr: unknown[], i: number, j: number) => {
  [arr[i], arr[j]] = [arr[j], arr[i]];
};

export class PriorityQueue<T> {
  #heap: Item<T>[];
  #isGreater;

  constructor(init: T[] = []) {
    this.#heap = init.map((value) => new Item<T>(value, 0));
    this.#isGreater = (a: number, b: number) =>
        this.#heap[a].priority - this.#heap[b].priority > 0;
  }

  get size(): number {
    return this.#heap.length;
  }

  peek(): T | undefined {
    return this.#heap[0].value;
  }

  addWithPriority(value: T, priority: number): void {
    this.#heap.push(new Item<T>(value,priority));
    this.#siftUp();
  }

  poll(): T | undefined;
  poll(
    heap = this.#heap,
    value = heap[0],
    length = heap.length
  ): T | undefined {
    if (length) {
      swap(heap, 0, length - 1);
    }

    heap.pop();
    this.#siftDown();

    return value.value;
  }

  #siftUp(): void;
  #siftUp(node = this.size - 1, parent = ((node + 1) >>> 1) - 1): void {
    for (
      ;
      node && this.#isGreater(node, parent);
      node = parent, parent = ((node + 1) >>> 1) - 1
    ) {
      swap(this.#heap, node, parent);
    }
  }

  #siftDown(): void;
  #siftDown(size = this.size, node = 0, isGreater = this.#isGreater): void {
    while (true) {
      const leftNode = (node << 1) + 1;
      const rightNode = leftNode + 1;

      if (
        (leftNode >= size || isGreater(node, leftNode)) &&
        (rightNode >= size || isGreater(node, rightNode))
      ) {
        break;
      }

      const maxChild =
        rightNode < size && isGreater(rightNode, leftNode)
          ? rightNode
          : leftNode;

      swap(this.#heap, node, maxChild);

      node = maxChild;
    }
  }
}

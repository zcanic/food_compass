import type { EmbeddingStore } from "../types/ingredient";
import type { ModelName } from "../types/model";
import { topK } from "./embedding-store";

type TopKResult = { index: number; score: number };

type WorkerResponse =
  | { type: "ready" }
  | { type: "topk_result"; id: number; results: TopKResult[] }
  | { type: "error"; id?: number; message: string };

let client: SearchWorkerClient | null = null;
let initPromise: Promise<boolean> | null = null;

export async function initSearchWorker(store: EmbeddingStore): Promise<boolean> {
  if (typeof Worker === "undefined") return false;
  if (client?.isReady()) return true;
  if (initPromise) return initPromise;

  initPromise = SearchWorkerClient.create(store)
    .then((created) => {
      client = created;
      return true;
    })
    .catch(() => {
      client = null;
      return false;
    })
    .finally(() => {
      initPromise = null;
    });

  return initPromise;
}

export async function topKWorkerOrLocal(
  store: EmbeddingStore,
  model: ModelName,
  queryVec: Float32Array,
  k: number,
  excludeIndices: Set<number> = new Set()
): Promise<TopKResult[]> {
  if (client?.isReady()) {
    return client.topK(model, queryVec, k, excludeIndices);
  }

  return topK(store, model, queryVec, k, excludeIndices);
}

export function getSearchBackend(): "worker" | "local" {
  return client?.isReady() ? "worker" : "local";
}

class SearchWorkerClient {
  private nextId = 1;
  private ready = false;
  private readonly worker: Worker;
  private readonly pending = new Map<number, {
    resolve: (results: TopKResult[]) => void;
    reject: (error: Error) => void;
  }>();

  private constructor(worker: Worker) {
    this.worker = worker;
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      this.handleMessage(event.data);
    };
    this.worker.onerror = (event) => {
      const error = new Error(event.message || "Search worker failed");
      for (const { reject } of this.pending.values()) reject(error);
      this.pending.clear();
      this.ready = false;
    };
  }

  static create(store: EmbeddingStore): Promise<SearchWorkerClient> {
    const worker = new Worker(new URL("../worker/search.worker.ts", import.meta.url), {
      type: "module",
    });
    const client = new SearchWorkerClient(worker);

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Search worker init timed out")), 5000);
      const originalHandler = worker.onmessage;
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === "ready") {
          window.clearTimeout(timeout);
          client.ready = true;
          worker.onmessage = originalHandler;
          resolve(client);
          return;
        }
        if (event.data.type === "error") {
          window.clearTimeout(timeout);
          reject(new Error(event.data.message));
        }
      };

      const cooc = copyBuffer(store.cooc);
      const core = copyBuffer(store.core);
      const chem = copyBuffer(store.chem);
      worker.postMessage(
        {
          type: "init",
          cooc,
          core,
          chem,
          dim: store.dim,
          count: store.count,
        },
        [cooc, core, chem]
      );
    });
  }

  isReady(): boolean {
    return this.ready;
  }

  topK(
    model: ModelName,
    queryVec: Float32Array,
    k: number,
    excludeIndices: Set<number>
  ): Promise<TopKResult[]> {
    const id = this.nextId++;
    const queryCopy = queryVec.slice();

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage(
        {
          type: "topk",
          id,
          model,
          queryVec: queryCopy,
          k,
          exclude: Array.from(excludeIndices),
        },
        [queryCopy.buffer]
      );
    });
  }

  private handleMessage(message: WorkerResponse): void {
    if (message.type === "ready") {
      this.ready = true;
      return;
    }

    if (message.type === "error") {
      if (message.id === undefined) {
        for (const { reject } of this.pending.values()) reject(new Error(message.message));
        this.pending.clear();
        return;
      }

      const pending = this.pending.get(message.id);
      if (pending) {
        pending.reject(new Error(message.message));
        this.pending.delete(message.id);
      }
      return;
    }

    const pending = this.pending.get(message.id);
    if (!pending) return;

    pending.resolve(message.results);
    this.pending.delete(message.id);
  }
}

function copyBuffer(view: Float32Array): ArrayBuffer {
  return view.slice().buffer;
}

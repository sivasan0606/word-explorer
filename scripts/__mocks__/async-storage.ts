const store = new Map<string, string>();
export default {
  getItem: async (key: string) => store.get(key) ?? null,
  setItem: async (key: string, value: string) => { store.set(key, value); },
  removeItem: async (key: string) => { store.delete(key); },
  clear: async () => { store.clear(); },
  getAllKeys: async () => [...store.keys()],
  multiGet: async (keys: string[]) => keys.map(k => [k, store.get(k) ?? null] as [string, string | null]),
  multiSet: async (pairs: [string, string][]) => { pairs.forEach(([k,v]) => store.set(k,v)); },
  multiRemove: async (keys: string[]) => { keys.forEach(k => store.delete(k)); },
};

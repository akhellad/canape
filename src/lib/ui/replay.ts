export interface ReplayParams {
  key: unknown;
  className: string;
}

export function replay(node: HTMLElement, params: ReplayParams) {
  let last = params.key;
  return {
    update(next: ReplayParams) {
      if (next.key === last) return;
      last = next.key;
      node.classList.remove(next.className);
      void node.offsetWidth;
      node.classList.add(next.className);
    },
  };
}

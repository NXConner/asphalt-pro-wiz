import { getRouterBaseName, subscribeToLovableConfig } from '@/lib/routing/basePath';

type HarnessSnapshot = {
  baseName: string;
  timestamp: number;
};

declare global {
  interface Window {
    __PPS_PREVIEW_SNAPSHOT__?: HarnessSnapshot;
  }
}

const resultNode = document.getElementById('result');

const renderSnapshot = (baseName: string) => {
  if (resultNode) {
    resultNode.textContent = `router base: ${baseName}`;
    resultNode.setAttribute('data-base-name', baseName);
  }
  document.body.dataset.routerBase = baseName;
  document.documentElement.dataset.routerBase = baseName;
  window.__PPS_PREVIEW_SNAPSHOT__ = {
    baseName,
    timestamp: Date.now(),
  };
};

renderSnapshot(getRouterBaseName());

subscribeToLovableConfig((next) => {
  console.info('[preview-smoke] base updated', next);
  renderSnapshot(next);
});

console.info('[preview-smoke] harness initialised');

let requestedPanel = null;

export function requestHeaderPanel(panel) {
  requestedPanel = panel;
}

export function consumeHeaderPanel() {
  const panel = requestedPanel;
  requestedPanel = null;
  return panel;
}

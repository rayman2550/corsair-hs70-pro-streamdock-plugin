'use strict';

let socket;
let inspectorContext;
let actionContext;
let settings = { displayMode: 'text', fontSize: 28, statusFontSize: 18, fontFamily: 'Segoe UI', fontColor: '#FFFFFF', statusFontColor: '#FFFFFF', fontBold: false, fontItalic: false, fontUnderline: false };

const modeControl = document.getElementById('displayMode');
const sizeControl = document.getElementById('fontSize');
const sizeLabel = document.getElementById('fontSizeLabel');
const sizeSection = document.getElementById('textSizeSection');
const statusSizeControl = document.getElementById('statusFontSize');
const statusSizeLabel = document.getElementById('statusFontSizeLabel');
const fontFamilyControl = document.getElementById('fontFamily');
const fontFamilySection = document.getElementById('fontFamilySection');
const fontColorControl = document.getElementById('fontColor');
const statusFontColorControl = document.getElementById('statusFontColor');
const fontBoldControl = document.getElementById('fontBold');
const fontItalicControl = document.getElementById('fontItalic');
const fontUnderlineControl = document.getElementById('fontUnderline');

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value || {};
  try { return JSON.parse(value); } catch (_) { return {}; }
}

function applySettings(value) {
  settings = {
    displayMode: ['text', 'battery', 'icons'].includes(value && value.displayMode) ? value.displayMode : 'text',
    fontSize: Math.max(12, Math.min(44, Math.round(Number(value && value.fontSize) || 28))),
    statusFontSize: Math.max(10, Math.min(32, Math.round(Number(value && value.statusFontSize) || 18))),
    fontFamily: typeof (value && value.fontFamily) === 'string' && value.fontFamily ? value.fontFamily : 'Segoe UI',
    fontColor: typeof (value && value.fontColor) === 'string' && /^#[0-9a-f]{6}$/i.test(value.fontColor) ? value.fontColor : '#FFFFFF',
    statusFontColor: typeof (value && value.statusFontColor) === 'string' && /^#[0-9a-f]{6}$/i.test(value.statusFontColor) ? value.statusFontColor : '#FFFFFF',
    fontBold: value && value.fontBold === true,
    fontItalic: value && value.fontItalic === true,
    fontUnderline: value && value.fontUnderline === true
  };
  modeControl.value = settings.displayMode;
  sizeControl.value = String(settings.fontSize);
  statusSizeControl.value = String(settings.statusFontSize);
  ensureFontOption(settings.fontFamily);
  fontFamilyControl.value = settings.fontFamily;
  fontColorControl.value = settings.fontColor;
  statusFontColorControl.value = settings.statusFontColor;
  fontBoldControl.checked = settings.fontBold;
  fontItalicControl.checked = settings.fontItalic;
  fontUnderlineControl.checked = settings.fontUnderline;
  sizeLabel.textContent = `${settings.fontSize} px`;
  statusSizeLabel.textContent = `${settings.statusFontSize} px`;
  sizeSection.classList.toggle('hidden', settings.displayMode === 'icons');
  fontFamilySection.classList.toggle('hidden', settings.displayMode === 'icons');
}

function ensureFontOption(family) {
  if (!Array.from(fontFamilyControl.options).some((option) => option.value === family)) {
    fontFamilyControl.add(new Option(family, family));
  }
}

function applyFontList(fonts) {
  if (!Array.isArray(fonts)) return;
  const selected = settings.fontFamily;
  fontFamilyControl.replaceChildren();
  for (const family of fonts) fontFamilyControl.add(new Option(family, family));
  ensureFontOption(selected);
  fontFamilyControl.value = selected;
}

function saveSettings() {
  settings.displayMode = modeControl.value;
  settings.fontSize = Number(sizeControl.value);
  settings.statusFontSize = Number(statusSizeControl.value);
  settings.fontFamily = fontFamilyControl.value;
  settings.fontColor = fontColorControl.value.toUpperCase();
  settings.statusFontColor = statusFontColorControl.value.toUpperCase();
  settings.fontBold = fontBoldControl.checked;
  settings.fontItalic = fontItalicControl.checked;
  settings.fontUnderline = fontUnderlineControl.checked;
  sizeLabel.textContent = `${settings.fontSize} px`;
  statusSizeLabel.textContent = `${settings.statusFontSize} px`;
  sizeSection.classList.toggle('hidden', settings.displayMode === 'icons');
  fontFamilySection.classList.toggle('hidden', settings.displayMode === 'icons');
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      event: 'setSettings',
      context: inspectorContext,
      payload: settings
    }));
    socket.send(JSON.stringify({
      event: 'sendToPlugin',
      action: 'com.codex.streamdock.corsairbattery.level',
      context: inspectorContext,
      payload: {
        command: 'applyDisplaySettings',
        actionContext,
        settings
      }
    }));
  }
}

modeControl.addEventListener('change', saveSettings);
sizeControl.addEventListener('input', saveSettings);
statusSizeControl.addEventListener('input', saveSettings);
fontFamilyControl.addEventListener('change', saveSettings);
fontColorControl.addEventListener('input', saveSettings);
statusFontColorControl.addEventListener('input', saveSettings);
fontBoldControl.addEventListener('change', saveSettings);
fontItalicControl.addEventListener('change', saveSettings);
fontUnderlineControl.addEventListener('change', saveSettings);

function connectElgatoStreamDeckSocket(port, inspectorUUID, registerEvent, info, actionInfo) {
  if (socket) return;
  inspectorContext = inspectorUUID;
  const action = parseMaybeJson(actionInfo);
  actionContext = action.context || inspectorUUID;
  const initialSettings = action.payload && action.payload.settings;
  if (initialSettings) applySettings(initialSettings);

  socket = new WebSocket(`ws://127.0.0.1:${port}`);
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ event: registerEvent, uuid: inspectorUUID }));
    socket.send(JSON.stringify({ event: 'getSettings', context: inspectorContext }));
    socket.send(JSON.stringify({
      event: 'sendToPlugin',
      action: 'com.codex.streamdock.corsairbattery.level',
      context: inspectorContext,
      payload: { command: 'requestFontFamilies', actionContext }
    }));
  });
  socket.addEventListener('message', (event) => {
    let message;
    try { message = JSON.parse(event.data); } catch (_) { return; }
    if (message.event === 'didReceiveSettings' && message.payload && message.payload.settings) {
      applySettings(message.payload.settings);
    } else if (message.event === 'sendToPropertyInspector' && message.payload && message.payload.command === 'fontFamilies') {
      applyFontList(message.payload.fonts);
    }
  });
}

window.connectElgatoStreamDeckSocket = connectElgatoStreamDeckSocket;
window.connectElgatoStreamDeckSocket.applySettings = applySettings;

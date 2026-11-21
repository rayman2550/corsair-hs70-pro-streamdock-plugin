'use strict';

const HID = require('node-hid');
const WebSocket = require('ws');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

const ACTION_UUID = 'com.codex.streamdock.corsairbattery.level';
const CORSAIR_VID = 0x1b1c;
const HS70_PRO_PID = 0x0a4f;
const DATA_REQUEST = [0xc9, 0x64];
const RETRY_MS = 5000;

function readArgs(argv) {
  const result = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i].startsWith('-') && argv[i + 1]) {
      result[argv[i].slice(1)] = argv[i + 1];
      i += 1;
    }
  }
  return result;
}

const args = readArgs(process.argv);
if (!args.port || !args.pluginUUID || !args.registerEvent) {
  console.error('StreamDock startup arguments are missing.');
  process.exit(1);
}

const socket = new WebSocket(`ws://127.0.0.1:${args.port}`);
const contexts = new Map();
let hidDevice = null;
let retryTimer = null;
let candidateTimer = null;
let candidateList = [];
let candidateIndex = -1;
const lastImages = new Map();
let batteryPercent = null;
let connectionState = 'missing';
let stopped = false;

function send(event, context, payload = {}) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ event, context, payload }));
}

function loadWindowsFonts() {
  const windowsFolder = process.env.WINDIR || 'C:\\Windows';
  const fontFolders = [
    path.join(windowsFolder, 'Fonts'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Windows', 'Fonts')
  ].filter(Boolean);
  for (const folder of fontFolders) {
    try { GlobalFonts.loadFontsFromDir(folder); } catch (error) {
      console.warn(`Could not read Windows fonts from ${folder}:`, error.message);
    }
  }
  return [...new Set(GlobalFonts.families.map((font) => font.family))]
    .filter((family) => family && !['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(family.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

const systemFonts = loadWindowsFonts();

function normalizeSettings(settings = {}) {
  const modes = ['text', 'battery', 'icons'];
  const fontColor = typeof settings.fontColor === 'string' && /^#[0-9a-f]{6}$/i.test(settings.fontColor)
    ? settings.fontColor.toUpperCase()
    : '#FFFFFF';
  const statusFontColor = typeof settings.statusFontColor === 'string' && /^#[0-9a-f]{6}$/i.test(settings.statusFontColor)
    ? settings.statusFontColor.toUpperCase()
    : '#FFFFFF';
  return {
    displayMode: modes.includes(settings.displayMode) ? settings.displayMode : 'text',
    fontSize: Math.max(12, Math.min(44, Math.round(Number(settings.fontSize) || 28))),
    statusFontSize: Math.max(10, Math.min(32, Math.round(Number(settings.statusFontSize) || 18))),
    fontFamily: typeof settings.fontFamily === 'string' && settings.fontFamily.trim() ? settings.fontFamily.trim() : 'Segoe UI',
    fontColor,
    statusFontColor,
    fontBold: settings.fontBold === true,
    fontItalic: settings.fontItalic === true,
    fontUnderline: settings.fontUnderline === true
  };
}

function renderBatteryImage(percent, rawSettings, currentConnectionState) {
  const width = 128;
  const height = 128;
  const settings = normalizeSettings(rawSettings);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const bg = [18, 26, 38, 255];
  const cssColor = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
  const textColor = [1, 3, 5].map((offset) => parseInt(settings.fontColor.slice(offset, offset + 2), 16));
  const statusTextColor = [1, 3, 5].map((offset) => parseInt(settings.statusFontColor.slice(offset, offset + 2), 16));
  const drawText = (label, fontSize, color, centerX, centerY, maxWidth) => {
    const safeFamily = settings.fontFamily.replace(/["\\]/g, '');
    const fontStyle = settings.fontItalic ? 'italic ' : '';
    const fontWeight = settings.fontBold ? 'bold ' : '';
    ctx.font = `${fontStyle}${fontWeight}${fontSize}px "${safeFamily}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cssColor(color);
    ctx.fillText(label, centerX, centerY, maxWidth);
    if (settings.fontUnderline) {
      const underlineWidth = Math.min(ctx.measureText(label).width, maxWidth);
      const underlineThickness = Math.max(1, Math.round(fontSize * 0.045));
      ctx.fillRect(centerX - underlineWidth / 2, centerY + fontSize * 0.36, underlineWidth, underlineThickness);
    }
  };

  const statusLabel = currentConnectionState === 'connected' ? 'ON' : currentConnectionState === 'missing' ? 'NO' : currentConnectionState === 'checking' ? '--' : 'OFF';
  ctx.fillStyle = cssColor(bg);
  ctx.fillRect(0, 0, width, height);
  drawText(statusLabel, settings.statusFontSize, statusTextColor, width / 2, 18, 110);

  const level = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const color = level <= 20 ? [255, 76, 76, 255] : level <= 50 ? [255, 184, 76, 255] : [80, 210, 150, 255];
  if (settings.displayMode !== 'text') {
    ctx.fillStyle = cssColor(color);
    ctx.fillRect(14, 39, 91, 58);
    ctx.fillRect(104, 53, 10, 26);
    ctx.fillStyle = cssColor(bg);
    ctx.fillRect(21, 46, 77, 44);
    if (settings.displayMode === 'icons') {
      const filled = percent === null ? 0 : Math.max(0, Math.round(level / 20));
      ctx.fillStyle = cssColor(color);
      for (let i = 0; i < filled; i += 1) ctx.fillRect(25 + i * 14, 50, 9, 36);
    } else {
      ctx.fillStyle = cssColor(color);
      ctx.fillRect(25, 50, Math.round(69 * level / 100), 36);
    }
  }

  if (settings.displayMode !== 'icons') {
    const label = percent === null ? '--' : `${level}%`;
    const centerX = settings.displayMode === 'battery' ? 59.5 : 64;
    const centerY = settings.displayMode === 'battery' ? 68 : 80;
    const maxWidth = settings.displayMode === 'battery' ? 70 : 116;
    drawText(label, settings.fontSize, textColor, centerX, centerY, maxWidth);
  }

  return `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`;
}

function sendFontsToInspector(context) {
  if (!context || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({
    event: 'sendToPropertyInspector',
    action: ACTION_UUID,
    context,
    payload: { command: 'fontFamilies', fonts: systemFonts }
  }));
}

function refresh(context, settings) {
  const image = renderBatteryImage(batteryPercent, settings, connectionState);
  if (image !== lastImages.get(context)) {
    send('setImage', context, { image, target: 0 });
    lastImages.set(context, image);
  }
}

function show(status, percent = null) {
  connectionState = ['connected', 'disconnected', 'missing', 'checking'].includes(status) ? status : 'disconnected';
  batteryPercent = percent;
  for (const [context, settings] of contexts) refresh(context, settings);
}

function closeHid() {
  if (candidateTimer) clearTimeout(candidateTimer);
  candidateTimer = null;
  if (!hidDevice) return;
  const old = hidDevice;
  hidDevice = null;
  old.removeAllListeners();
  try { old.close(); } catch (_) { /* Device may already be disconnected. */ }
}

function findDevice() {
  if (stopped || hidDevice) return;
  try {
    const candidates = HID.devices()
      .filter((device) => device.vendorId === CORSAIR_VID && device.productId === HS70_PRO_PID && device.path)
      .sort((a, b) => {
        const priority = (device) => device.usagePage === 0xffc5 ? 0 : device.usagePage === 0xff00 ? 1 : 2;
        return priority(a) - priority(b);
      });
    if (candidates.length === 0) {
      show('missing');
      return;
    }

    openCandidate(candidates, 0);
  } catch (error) {
    console.error('Could not open Corsair headset receiver:', error.message);
    show('missing');
  }
}

function openCandidate(candidates, index) {
  if (stopped) return;
  candidateList = candidates;
  candidateIndex = index;
  if (index >= candidates.length) {
    console.error('No Corsair HID interface returned a headset status report.');
    show('missing');
    return;
  }

  const candidate = candidates[index];
  try {
    const opened = new HID.HID(candidate.path);
    opened.write(DATA_REQUEST);
    opened.pause();
    opened.setNonBlocking(1);
    opened.on('data', onReport);
    opened.on('error', onHidError);
    hidDevice = opened;
    opened.resume();
    show('checking');
    candidateTimer = setTimeout(() => {
      if (hidDevice !== opened) return;
      console.error(`Corsair HID interface ${candidate.usagePage}:${candidate.usage} returned no status; trying the next interface.`);
      closeHid();
      openCandidate(candidates, index + 1);
    }, 2000);
  } catch (error) {
    console.error(`Could not use Corsair HID interface ${candidate.usagePage}:${candidate.usage}:`, error.message);
    openCandidate(candidates, index + 1);
  }
}

function onReport(report) {
  if (!report || report.length < 5) return;
  if (![0, 1, 2, 4, 5].includes(report[4])) return;
  if (candidateTimer) clearTimeout(candidateTimer);
  candidateTimer = null;
  let battery = report[2];
  if (battery > 128) battery -= 128;
  battery = Math.max(0, Math.min(100, battery));
  if (![1, 2, 4, 5].includes(report[4])) {
    show('disconnected');
    return;
  }
  show('connected', battery);
}

function onHidError(error) {
  console.error('Corsair headset receiver disconnected:', error.message);
  const tryNext = candidateTimer !== null && candidateIndex + 1 < candidateList.length;
  const nextIndex = candidateIndex + 1;
  const candidates = candidateList;
  closeHid();
  if (tryNext) openCandidate(candidates, nextIndex);
  else show('missing');
}

function startRetry() {
  if (retryTimer) return;
  retryTimer = setInterval(findDevice, RETRY_MS);
  findDevice();
}

function stopRetryIfIdle() {
  if (contexts.size !== 0) return;
  if (retryTimer) clearInterval(retryTimer);
  retryTimer = null;
  closeHid();
}

socket.on('open', () => {
  socket.send(JSON.stringify({ event: args.registerEvent, uuid: args.pluginUUID }));
});

socket.on('message', (buffer) => {
  let message;
  try { message = JSON.parse(buffer.toString()); } catch (_) { return; }
  if (message.event === 'willAppear') {
    contexts.set(message.context, normalizeSettings(message.payload && message.payload.settings));
    refresh(message.context, contexts.get(message.context));
    startRetry();
  } else if (message.event === 'willDisappear') {
    contexts.delete(message.context);
    lastImages.delete(message.context);
    stopRetryIfIdle();
  } else if (message.event === 'didReceiveSettings' && contexts.has(message.context)) {
    const settings = normalizeSettings(message.payload && message.payload.settings);
    contexts.set(message.context, settings);
    lastImages.delete(message.context);
    refresh(message.context, settings);
  } else if (message.event === 'sendToPlugin' && message.payload) {
    if (message.payload.command === 'requestFontFamilies') {
      sendFontsToInspector(message.payload.actionContext);
    } else if (message.payload.command === 'applyDisplaySettings') {
      const context = message.payload.actionContext || message.context;
      if (!contexts.has(context)) return;
      const settings = normalizeSettings(message.payload.settings);
      contexts.set(context, settings);
      lastImages.delete(context);
      refresh(context, settings);
    }
  }
});

socket.on('error', (error) => console.error('StreamDock connection error:', error.message));
socket.on('close', shutdown);

function shutdown() {
  if (stopped) return;
  stopped = true;
  if (retryTimer) clearInterval(retryTimer);
  closeHid();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const SNAP = require('../../assets/sounds/pack_lineup_snap.wav');
const PICK = require('../../assets/sounds/pack_lineup_pick.wav');

let audioModeReady = false;
let snapSound: Audio.Sound | null = null;
let pickSound: Audio.Sound | null = null;
let lastSnapAt = 0;

async function ensureAudioMode() {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeReady = true;
}

async function loadSounds() {
  if (Platform.OS === 'web') return;
  await ensureAudioMode();
  if (!snapSound) {
    const { sound } = await Audio.Sound.createAsync(SNAP, { volume: 0.52, shouldPlay: false });
    snapSound = sound;
  }
  if (!pickSound) {
    const { sound } = await Audio.Sound.createAsync(PICK, { volume: 0.58, shouldPlay: false });
    pickSound = sound;
  }
}

/** Warm assets when the lineup mounts so the first flick doesn’t pop. */
export function preloadPackLineupSfx() {
  void loadSounds().catch(() => {});
}

/**
 * Slot changed while scrolling (throttled so fast flicks don’t machine-gun).
 */
export function playPackLineupSnap() {
  if (Platform.OS === 'web') return;
  const now = Date.now();
  if (now - lastSnapAt < 82) return;
  lastSnapAt = now;
  void (async () => {
    try {
      await loadSounds();
      if (!snapSound) return;
      await snapSound.replayAsync();
    } catch {
      /* ignore */
    }
  })();
}

/** User tapped to lock a pack in the lineup. */
export function playPackLineupPick() {
  if (Platform.OS === 'web') return;
  void (async () => {
    try {
      await loadSounds();
      if (!pickSound) return;
      await pickSound.replayAsync();
    } catch {
      /* ignore */
    }
  })();
}

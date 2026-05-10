'use client';

import * as Tone from 'tone';

// ─── Audio Engine (Tone.js + Salamander Grand Piano) ─────────────────

let sampler: Tone.Sampler | null = null;
let reverb: Tone.Reverb | null = null;
let isInitialized = false;
let isLoading = false;

// Salamander Grand Piano samples (free CDN)
const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

// We only need a subset of samples — Tone.js interpolates the rest
const SAMPLE_NOTES: Record<string, string> = {
  'A0': 'A0.mp3',
  'C1': 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  'A1': 'A1.mp3',
  'C2': 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  'A2': 'A2.mp3',
  'C3': 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  'A3': 'A3.mp3',
  'C4': 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  'A4': 'A4.mp3',
  'C5': 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  'A5': 'A5.mp3',
  'C6': 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  'A6': 'A6.mp3',
  'C7': 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  'A7': 'A7.mp3',
  'C8': 'C8.mp3',
};

export function getIsInitialized(): boolean {
  return isInitialized;
}

export function getIsLoading(): boolean {
  return isLoading;
}

export async function initAudio(onLoaded?: () => void): Promise<void> {
  if (isInitialized || isLoading) return;

  isLoading = true;

  try {
    // Must be called inside a user gesture (click/keydown)
    await Tone.start();

    // Create reverb effect
    reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.2,
    }).toDestination();
    await reverb.generate();

    // Create sampler with Salamander samples
    sampler = new Tone.Sampler({
      urls: SAMPLE_NOTES,
      baseUrl: SAMPLE_BASE_URL,
      release: 1,
      onload: () => {
        isInitialized = true;
        isLoading = false;
        onLoaded?.();
      },
      onerror: (err) => {
        console.error('Failed to load piano samples:', err);
        isLoading = false;
      },
    }).connect(reverb);

    // Set initial volume
    sampler.volume.value = -6; // dB
  } catch (err) {
    console.error('Failed to initialize audio:', err);
    isLoading = false;
  }
}

export function playNote(note: string, velocity: number = 0.8): void {
  if (!sampler || !isInitialized) return;
  try {
    sampler.triggerAttack(note, Tone.now(), velocity);
  } catch (err) {
    console.error(`Failed to play note ${note}:`, err);
  }
}

export function releaseNote(note: string): void {
  if (!sampler || !isInitialized) return;
  try {
    sampler.triggerRelease(note, Tone.now());
  } catch (err) {
    console.error(`Failed to release note ${note}:`, err);
  }
}

export function setVolume(volumePercent: number): void {
  if (!sampler) return;
  // Convert 0–100 to dB range (-60 to 0)
  const db = volumePercent <= 0 ? -Infinity : -60 + (volumePercent / 100) * 60;
  sampler.volume.value = db;
}

export function setReverbAmount(amount: number): void {
  if (!reverb) return;
  // Convert 0–100 to 0–1 wet mix
  reverb.wet.value = amount / 100;
}

export function disposeAudio(): void {
  sampler?.dispose();
  reverb?.dispose();
  sampler = null;
  reverb = null;
  isInitialized = false;
  isLoading = false;
}

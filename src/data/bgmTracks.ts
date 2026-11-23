import type { BgmTrack } from '../types/quiz';

const BASE = import.meta.env.BASE_URL;

export const bgmTracks: BgmTrack[] = [
  {
    id: 'seconds_behind_the_storm',
    title: 'Seconds Behind the Storm',
    subtitle: '雨窓と大時計の書斎',
    audioUrl: `${BASE}assets/aistudio/Seconds_Behind_the_Storm_a31f3e86.mp4`,
    coverUrl: `${BASE}assets/bgm/seconds_behind_the_storm.jpg`,
  },
  {
    id: 'hours_in_the_stacks',
    title: 'Hours in the Stacks',
    subtitle: '書架に刻む振子時計',
    audioUrl: `${BASE}assets/aistudio/Hours_in_the_Stacks_7f9ed327.mp4`,
    coverUrl: `${BASE}assets/bgm/hours_in_the_stacks.jpg`,
  },
  {
    id: 'parchment_and_pendulum',
    title: 'Parchment and Pendulum',
    subtitle: '羊皮紙を照らす月光と振子',
    audioUrl: `${BASE}assets/aistudio/Parchment_and_Pendulum_9bc61265.mp4`,
    coverUrl: `${BASE}assets/bgm/parchment_and_pendulum.jpg`,
  },
];

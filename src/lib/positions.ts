import { PositionSlot } from '../types';

export interface FormationPreset {
  id: string;
  name: string;
  description: string;
  slots: PositionSlot[];
}

export const FORMATION_PRESETS: FormationPreset[] = [
  {
    id: '2-3-2',
    name: '2 - 3 - 2',
    description: 'Kompakt & Ausgeglichen (Standard)',
    slots: [
      { id: 'TW', label: 'TW', x: 50, y: 88 },
      { id: 'LV', label: 'LV', x: 25, y: 70 },
      { id: 'RV', label: 'RV', x: 75, y: 70 },
      { id: 'LM', label: 'LM', x: 15, y: 46 },
      { id: 'ZM', label: 'ZM', x: 50, y: 46 },
      { id: 'RM', label: 'RM', x: 85, y: 46 },
      { id: 'LS', label: 'LS', x: 32, y: 20 },
      { id: 'RS', label: 'RS', x: 68, y: 20 },
    ],
  },
  {
    id: '3-3-1',
    name: '3 - 3 - 1',
    description: 'Defensiv stabil mit 3er-Kette',
    slots: [
      { id: 'TW', label: 'TW', x: 50, y: 88 },
      { id: 'LIV', label: 'LIV', x: 22, y: 72 },
      { id: 'ZIV', label: 'ZIV', x: 50, y: 74 },
      { id: 'RIV', label: 'RIV', x: 78, y: 72 },
      { id: 'LM', label: 'LM', x: 18, y: 45 },
      { id: 'ZM', label: 'ZM', x: 50, y: 45 },
      { id: 'RM', label: 'RM', x: 82, y: 45 },
      { id: 'MS', label: 'MS', x: 50, y: 20 },
    ],
  },
  {
    id: '3-2-2',
    name: '3 - 2 - 2',
    description: 'Starke Defensive & Doppelspitze',
    slots: [
      { id: 'TW', label: 'TW', x: 50, y: 88 },
      { id: 'LIV', label: 'LIV', x: 22, y: 72 },
      { id: 'ZIV', label: 'ZIV', x: 50, y: 74 },
      { id: 'RIV', label: 'RIV', x: 78, y: 72 },
      { id: 'ZM1', label: 'ZM1', x: 35, y: 48 },
      { id: 'ZM2', label: 'ZM2', x: 65, y: 48 },
      { id: 'LS', label: 'LS', x: 32, y: 20 },
      { id: 'RS', label: 'RS', x: 68, y: 20 },
    ],
  },
  {
    id: '2-4-1',
    name: '2 - 4 - 1',
    description: 'Mittelfeld-Dominanz',
    slots: [
      { id: 'TW', label: 'TW', x: 50, y: 88 },
      { id: 'LV', label: 'LV', x: 25, y: 72 },
      { id: 'RV', label: 'RV', x: 75, y: 72 },
      { id: 'LM', label: 'LM', x: 14, y: 46 },
      { id: 'DM', label: 'DM', x: 50, y: 55 },
      { id: 'OM', label: 'OM', x: 50, y: 36 },
      { id: 'RM', label: 'RM', x: 86, y: 46 },
      { id: 'MS', label: 'MS', x: 50, y: 18 },
    ],
  },
  {
    id: '3-1-3',
    name: '3 - 1 - 3',
    description: 'Breite Offensive & 3 Stürmer',
    slots: [
      { id: 'TW', label: 'TW', x: 50, y: 88 },
      { id: 'LIV', label: 'LIV', x: 22, y: 72 },
      { id: 'ZIV', label: 'ZIV', x: 50, y: 74 },
      { id: 'RIV', label: 'RIV', x: 78, y: 72 },
      { id: 'ZM', label: 'ZM', x: 50, y: 48 },
      { id: 'LA', label: 'LA', x: 18, y: 22 },
      { id: 'MS', label: 'MS', x: 50, y: 18 },
      { id: 'RA', label: 'RA', x: 82, y: 22 },
    ],
  },
  {
    id: '2-2-3',
    name: '2 - 2 - 3',
    description: 'Offensivpower mit 3 Stürmern',
    slots: [
      { id: 'TW', label: 'TW', x: 50, y: 88 },
      { id: 'LV', label: 'LV', x: 25, y: 72 },
      { id: 'RV', label: 'RV', x: 75, y: 72 },
      { id: 'ZM1', label: 'ZM1', x: 35, y: 48 },
      { id: 'ZM2', label: 'ZM2', x: 65, y: 48 },
      { id: 'LA', label: 'LA', x: 18, y: 22 },
      { id: 'MS', label: 'MS', x: 50, y: 18 },
      { id: 'RA', label: 'RA', x: 82, y: 22 },
    ],
  },
];

export const POSITIONS: PositionSlot[] = FORMATION_PRESETS[0].slots;

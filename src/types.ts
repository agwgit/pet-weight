/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeightUnit = "lbs" | "kg";

export interface SliderPosition {
  index: number; // 0 to 8
  isMajor: boolean; // circles (true) vs vertical ticks (false)
  lbs: number;
}

export interface DogStateInfo {
  label: string;
  statusText: string;
  expression: string;
  color: string;
  scaleX: number; // custom scale width for the dachshund body
  scaleY: number; // custom scale length
  earsScale: number;
}

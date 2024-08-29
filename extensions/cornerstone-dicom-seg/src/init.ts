import { addTool, BrushTool } from 'midas-tools';

export default function init({ configuration = {} }): void {
  addTool(BrushTool);
}

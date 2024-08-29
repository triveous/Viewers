import { addTool } from 'midas-tools';

export default function addToolInstance(name: string, toolClass, configuration?): void {
  class InstanceClass extends toolClass {
    static toolName = name;
  }
  addTool(InstanceClass);
}

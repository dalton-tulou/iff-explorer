import type { FormatPlugin } from "./FormatPlugin";

export class FormatRegistry {
  private plugins = new Map<string, FormatPlugin>();

  register(plugin: FormatPlugin) {
    for (const type of plugin.supportedTypes) {
      if (this.plugins.has(type)) {
        throw new Error(`Plugin for type ${type} is already registered.`);
      }
      this.plugins.set(type, plugin);
    }
  }

  getPluginForType(type: string): FormatPlugin | undefined {
    return this.plugins.get(type);
  }
}

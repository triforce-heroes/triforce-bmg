import { extract, getEntries, getStrings } from "./Extract.js";
import { Rebuilder } from "./Rebuilder.js";

export class Patcher {
  private readonly rebuilder;

  public constructor(source: Buffer) {
    const sections = new Map<string, Buffer>(extract(source));
    const entries = getEntries(sections.get("INF1")!);
    const strings = new Map(getStrings(entries, sections.get("DAT1")!));

    this.rebuilder = new Rebuilder(entries[0]?.[2].length ?? 0);

    for (const [, index, attributes] of entries) {
      if (index === 0) {
        this.rebuilder.addNull();

        continue;
      }

      this.rebuilder.addString(index, strings.get(index)![0]!, attributes);
    }

    for (const [name, data] of sections) {
      if (name !== "INF1" && name !== "DAT1") {
        this.rebuilder.addSection(name, data);
      }
    }
  }

  public patchString(index: number, value: string) {
    this.rebuilder.updateString(index, value);
  }

  public build() {
    return this.rebuilder.build();
  }
}

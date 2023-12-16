import {
  BufferBuilder,
  ByteOrder,
  nextMultiple,
} from "@triforce-heroes/triforce-core";

import { DataSection } from "./types/DataSection.js";

type StringMapped = [value: string | null | undefined, attributes: Buffer];

export class Rebuilder {
  private readonly stringsMap = new Map<number, StringMapped>();

  private readonly infoEntries: Array<number | null> = [];

  private readonly infoEntryNull;

  private readonly extraSections: DataSection[] = [];

  public constructor(private readonly attributesLength: number) {
    this.infoEntryNull = Buffer.alloc(this.attributesLength + 6);
    this.stringsMap.set(-1, ["", Buffer.alloc(this.attributesLength)]);
  }

  public addString(
    index: number,
    value: string | null | undefined,
    attributes: Buffer,
  ): void {
    this.stringsMap.set(index, [value, attributes]);
    this.infoEntries.push(index);
  }

  public updateString(index: number, value: string | null | undefined) {
    const string = this.stringsMap.get(index);

    if (string) {
      string[0] = value;
    }
  }

  public addNull(): void {
    this.infoEntries.push(null);
  }

  public addSection(name: string, data: Buffer): void {
    this.extraSections.push([name, data]);
  }

  public build(): Buffer {
    const stringsBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);
    const stringsOffsets = new Map<number, number>();

    for (const [index, [value]] of this.stringsMap) {
      stringsOffsets.set(index, stringsBuilder.length);
      stringsBuilder.writeNullTerminatedString(value);
    }

    const stringsBuilderData = stringsBuilder.build();
    const stringsBuilderLength = nextMultiple(
      stringsBuilderData.length + 8,
      32,
    );

    const stringsHeaderBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);

    stringsHeaderBuilder.writeString("DAT1");
    stringsHeaderBuilder.writeUnsignedInt32(stringsBuilderLength);
    stringsHeaderBuilder.push(stringsBuilderData);
    stringsHeaderBuilder.write(
      stringsBuilderLength - (stringsBuilderData.length + 8),
    );

    const infoBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);

    for (const index of this.infoEntries) {
      if (index === null) {
        infoBuilder.push(this.infoEntryNull);

        continue;
      }

      const stringOffset = stringsOffsets.get(index)!;
      const [, stringAttributes] = this.stringsMap.get(index)!;

      infoBuilder.writeUnsignedInt32(stringOffset);
      infoBuilder.writeUnsignedInt16(index);
      infoBuilder.push(stringAttributes);
    }

    const infoBuilderData = infoBuilder.build();
    const infoBuilderLength = nextMultiple(infoBuilderData.length + 16, 32);

    const infoHeaderBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);

    infoHeaderBuilder.writeString("INF1");
    infoHeaderBuilder.writeUnsignedInt32(infoBuilderLength);
    infoHeaderBuilder.writeUnsignedInt16(
      infoBuilderData.length / (this.attributesLength + 6),
    );
    infoHeaderBuilder.writeUnsignedInt16(this.attributesLength + 6);
    infoHeaderBuilder.write(4);
    infoHeaderBuilder.push(infoBuilderData);
    infoHeaderBuilder.write(infoBuilderLength - (infoBuilderData.length + 16));

    const extraBuffers: Buffer[] = [];
    const extraSectionLast = this.extraSections.at(-1)?.[0];

    if (extraSectionLast !== undefined) {
      for (const [name, data] of this.extraSections) {
        const isSectionLast = extraSectionLast === name;

        const section = new BufferBuilder(ByteOrder.BIG_ENDIAN);
        const sectionLength = nextMultiple(data.length + 8, 32);

        section.writeString(name);
        section.writeUnsignedInt32(sectionLength);
        section.push(data);

        if (!isSectionLast) {
          section.write(sectionLength - (data.length + 8));
        }

        extraBuffers.push(section.build());
      }
    }

    const extraData = Buffer.concat(extraBuffers);

    const header = new BufferBuilder(ByteOrder.BIG_ENDIAN);

    header.writeString("MESG");
    header.writeString("bmg1");
    header.writeUnsignedInt32(
      32 + infoBuilderLength + stringsBuilderLength + extraData.length,
    );
    header.writeUnsignedInt32(this.extraSections.length + 2);
    header.writeByte(1);
    header.write(15);

    return Buffer.concat([
      header.build(),
      infoHeaderBuilder.build(),
      stringsHeaderBuilder.build(),
      extraData,
    ]);
  }
}

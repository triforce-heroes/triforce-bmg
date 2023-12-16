import { BufferConsumer, ByteOrder } from "@triforce-heroes/triforce-core";

import { parseHeader } from "./parsers/parseHeader.js";
import { InfoEntry, parseInfo } from "./parsers/parseInfo.js";
import { DataSection } from "./types/DataSection.js";

type StringEntry = [index: number, text: string];

export function extract(buffer: Buffer) {
  const consumer = new BufferConsumer(buffer, undefined, ByteOrder.BIG_ENDIAN);

  const header = parseHeader(consumer);
  const sections: DataSection[] = [];

  for (let i = 0; i < header.sectionsCount; i++) {
    const sectionKind = consumer.readString(4);
    const sectionLength = consumer.readUnsignedInt32();
    const sectionConsumer = consumer.consumer(sectionLength - 8);

    sections.push([sectionKind, sectionConsumer.buffer]);
  }

  return sections;
}

export function getEntries(data: Buffer) {
  return parseInfo(new BufferConsumer(data, undefined, ByteOrder.BIG_ENDIAN));
}

export function getStrings(entries: InfoEntry[], data: Buffer) {
  const strings: StringEntry[] = [];

  const offsets: number[] = [];
  const offsetsIndexed = new Map<number, number>();
  let offsetLast = -1;

  for (const entry of entries) {
    const [currentOffset, index] = entry;

    if (currentOffset > offsetLast) {
      offsetsIndexed.set(offsets.length, index);
      offsets.push(currentOffset);
      offsetLast = currentOffset;
    }
  }

  for (let i = 0; i < offsets.length; i++) {
    const offsetFrom = offsets[i]!;
    const offsetTo = (offsets[i + 1] ?? data.length) - 1;

    const offsetText = data.toString("binary", offsetFrom, offsetTo).trim();

    if (offsetText !== "") {
      strings.push([offsetsIndexed.get(i)!, offsetText]);
    }
  }

  return strings;
}

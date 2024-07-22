import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { Entry } from "../types/Entry.js";

const bufferEmpty = Buffer.allocUnsafe(0);

export function parseEntries(buffer: Buffer, hasStrings: boolean) {
  const consumer = new BufferConsumer(buffer, undefined, ByteOrder.BIG_ENDIAN);

  const entries: Entry[] = [];
  const count = consumer.readUnsignedInt16();
  const attributesLength = consumer.readUnsignedInt16();

  consumer.skip(4); // Padding.

  if (hasStrings) {
    for (let i = 0; i < count; i++) {
      const messageIndex = consumer.readUnsignedInt32();

      entries.push(
        [consumer.readUnsignedInt16(), messageIndex * 2, bufferEmpty],
        [consumer.readUnsignedInt16(), messageIndex * 2 + 1, bufferEmpty],
      );
    }

    return {
      count,
      attributesLength: attributesLength - 8,
      attributesBaseLength: 8,
      entries,
    };
  }

  for (let i = 0; i < count; i++) {
    entries.push([
      consumer.readUnsignedInt32(), // Message Offset.
      consumer.readUnsignedInt16(), // Message Index.
      consumer.read(attributesLength - 6), // Message Attributes.
    ]);
  }

  return {
    count,
    attributesLength: attributesLength - 6,
    attributesBaseLength: 6,
    entries,
  };
}

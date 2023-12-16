import { BufferConsumer } from "@triforce-heroes/triforce-core";

export type InfoEntry = [dataOffset: number, index: number, attributes: Buffer];

export function parseInfo(consumer: BufferConsumer) {
  const entries: InfoEntry[] = [];
  const entriesCount = consumer.readUnsignedInt16();
  const entriesLength = consumer.readUnsignedInt16();

  consumer.skip(4); // Unknown.

  for (let i = 0; i < entriesCount; i++) {
    entries.push([
      consumer.readUnsignedInt32(),
      consumer.readUnsignedInt16(),
      consumer.read(entriesLength - 6),
    ]);
  }

  return entries;
}

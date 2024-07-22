import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";

import { Section } from "../types/Section.js";

export function parseSections(consumer: BufferConsumer) {
  const sections: Section[] = [];

  while (!consumer.isConsumed()) {
    const sectionKind = consumer.readString(4);
    const sectionLength = consumer.readUnsignedInt32();

    sections.push([sectionKind, consumer.read(sectionLength - 8)]);
  }

  return sections;
}

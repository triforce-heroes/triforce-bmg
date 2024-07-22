import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { parseEntries } from "./parsers/parseEntries.js";
import { parseMessages } from "./parsers/parseMessages.js";
import { parseSections } from "./parsers/parseSections.js";
import { MessageEntry } from "./types/Message.js";

export function extract(source: Buffer) {
  const consumer = new BufferConsumer(source, 32, ByteOrder.BIG_ENDIAN);
  const sections = new Map<string, Buffer>(parseSections(consumer));
  const sectionsWithStrings = sections.has("STR1");
  const sectionEntries = parseEntries(
    sections.get("INF1")!,
    sectionsWithStrings,
  );

  const sectionMessages = new Map(
    parseMessages(sections.get(sectionsWithStrings ? "STR1" : "DAT1")!),
  );

  const messagesEntries: MessageEntry[] = [];

  for (const [messageOffset, messageIndex] of sectionEntries.entries) {
    const sectionEntryMessage = sectionMessages.get(messageOffset)!;

    messagesEntries.push([messageIndex, sectionEntryMessage]);
  }

  return messagesEntries;
}

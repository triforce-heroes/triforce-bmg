import { BufferBuilder } from "@triforce-heroes/triforce-core/BufferBuilder";
import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { nextMultiple } from "@triforce-heroes/triforce-core/Number";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { parseEntries } from "./parsers/parseEntries.js";
import { parseHeader } from "./parsers/parseHeader.js";
import { parseMessages } from "./parsers/parseMessages.js";
import { parseSections } from "./parsers/parseSections.js";
import { MessageEntry } from "./types/Message.js";

function writeMessage(
  messagesBuilder: BufferBuilder,
  sectionMessages: Map<number, string>,
  messagesPatchesMap: Map<number, string>,
  messageIndex: number,
  messageOffset: number,
) {
  const { length } = messagesBuilder;

  messagesBuilder.push(
    Buffer.from(
      messagesPatchesMap.get(messageIndex) ??
        sectionMessages.get(messageOffset)!,
      "latin1",
    ),
  );
  messagesBuilder.writeByte(0);

  return length - 8;
}

export function rebuild(source: Buffer, messagesPatches: MessageEntry[]) {
  const consumer = new BufferConsumer(source, undefined, ByteOrder.BIG_ENDIAN);

  const sourceHeader = parseHeader(consumer);
  const sections = new Map<string, Buffer>(parseSections(consumer));
  const sectionsWithStrings = sections.has("STR1");
  const {
    entries: sectionEntries,
    count: sectionEntriesCount,
    attributesLength: sectionAttributesLength,
    attributesBaseLength: sectionAttributesBaseLength,
  } = parseEntries(sections.get("INF1")!, sectionsWithStrings);
  const sectionMessagesKey = sectionsWithStrings ? "STR1" : "DAT1";
  const sectionMessages = new Map(
    parseMessages(sections.get(sectionMessagesKey)!),
  );

  const extraSectionsLength = [...sections.entries()]
    .filter(
      ([sectionKey]) => !["INF1", sectionMessagesKey].includes(sectionKey),
    )
    .reduce((length, [, buffer]) => length + buffer.length + 8, 0);

  const infoBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);

  infoBuilder.writeString("INF1");
  infoBuilder.writeUnsignedInt32(0);
  infoBuilder.writeUnsignedInt16(sectionEntriesCount);
  infoBuilder.writeUnsignedInt16(
    sectionAttributesLength + sectionAttributesBaseLength,
  );
  infoBuilder.write(4);

  const messagesBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);

  messagesBuilder.writeString(sectionMessagesKey);
  messagesBuilder.writeUnsignedInt32(0);
  messagesBuilder.writeByte(0); // Null message.

  const messagesPatchesMap = new Map(messagesPatches);

  if (sectionsWithStrings) {
    for (let i = 0; i < sectionEntries.length; i += 2) {
      const [messageOffset1, messageIndex] = sectionEntries[i]!;
      const [messageOffset2] = sectionEntries[i + 1]!;

      infoBuilder.writeUnsignedInt32(messageIndex / 2);
      infoBuilder.writeUnsignedInt16(
        writeMessage(
          messagesBuilder,
          sectionMessages,
          messagesPatchesMap,
          messageIndex,
          messageOffset1,
        ),
      );
      infoBuilder.writeUnsignedInt16(
        writeMessage(
          messagesBuilder,
          sectionMessages,
          messagesPatchesMap,
          messageIndex + 1,
          messageOffset2,
        ),
      );
    }
  } else {
    for (const [
      messageOffset,
      messageIndex,
      messageAttributes,
    ] of sectionEntries) {
      infoBuilder.writeUnsignedInt32(
        messageOffset === 0
          ? 0
          : writeMessage(
              messagesBuilder,
              sectionMessages,
              messagesPatchesMap,
              messageIndex,
              messageOffset,
            ),
      );
      infoBuilder.writeUnsignedInt16(messageIndex);
      infoBuilder.push(messageAttributes);
    }
  }

  infoBuilder.pad(32);
  messagesBuilder.pad(32);

  const headerBuilder = new BufferBuilder(ByteOrder.BIG_ENDIAN);

  headerBuilder.writeString("MESG");
  headerBuilder.writeString("bmg1");
  headerBuilder.writeUnsignedInt32(
    32 + // Header length.
      infoBuilder.length + // Info section data length.
      messagesBuilder.length + // Messages section data length.
      extraSectionsLength, // Extra sections data length.
  );
  headerBuilder.writeUnsignedInt32(sourceHeader.sectionsCount);
  headerBuilder.writeByte(sourceHeader.encoding);
  headerBuilder.write(15);

  for (const [sectionKey, sectionBuffer] of sections) {
    if (sectionKey === "INF1") {
      const infoBuilded = infoBuilder.build();

      infoBuilded.writeUInt32BE(infoBuilded.length, 4);

      headerBuilder.push(infoBuilded);
    } else if (sectionKey === sectionMessagesKey) {
      const messagesBuilded = messagesBuilder.build();

      messagesBuilded.writeUInt32BE(messagesBuilded.length, 4);

      headerBuilder.push(messagesBuilded);
    } else {
      headerBuilder.writeString(sectionKey);
      headerBuilder.writeUnsignedInt32(
        nextMultiple(sectionBuffer.length + 8, 32),
      );
      headerBuilder.push(sectionBuffer);
    }
  }

  return headerBuilder.build();
}

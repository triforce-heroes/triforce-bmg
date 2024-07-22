import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";
import { ByteOrder } from "@triforce-heroes/triforce-core/types/ByteOrder";

import { Message } from "../types/Message.js";

export function parseMessages(buffer: Buffer) {
  const consumer = new BufferConsumer(buffer, undefined, ByteOrder.BIG_ENDIAN);
  const messages: Message[] = [];

  while (!consumer.isConsumed()) {
    const messageOffset = consumer.byteOffset;
    const message: number[] = [];

    while (consumer.at() !== 0) {
      const messageLetter = consumer.readUnsignedInt8();

      if (messageLetter === 0x1a) {
        const commandLength = consumer.readUnsignedInt8();

        message.push(...consumer.back(2).read(commandLength));
      } else {
        message.push(messageLetter);
      }
    }

    consumer.skip();

    messages.push([messageOffset, Buffer.from(message).toString("latin1")]);
  }

  return messages;
}

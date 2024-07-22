import { BufferConsumer } from "@triforce-heroes/triforce-core/BufferConsumer";

import { Encoding } from "../types/Encoding.js";
import { Header } from "../types/Header.js";

export function parseHeader(consumer: BufferConsumer): Header {
  consumer.skip(
    4 + // Magic "MESG".
      4 + // Magic "bmg1".
      4, // File length.
  );

  const sectionsCount = consumer.readUnsignedInt32();
  const encoding: Encoding = consumer.readByte();

  consumer.skip(15); // Padding.

  return {
    sectionsCount,
    encoding,
  };
}

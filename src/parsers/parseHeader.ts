import { BufferConsumer, fatal } from "@triforce-heroes/triforce-core";

import { Encoding } from "../types/Encoding.js";

export function parseHeader(consumer: BufferConsumer) {
  if (consumer.readString(4) !== "MESG" || consumer.readString(4) !== "bmg1") {
    fatal("Invalid BMG header");
  }

  consumer.skip(
    4, // File length.
  );

  const sectionsCount = consumer.readUnsignedInt32();
  const encoding: Encoding = consumer.readByte();

  consumer.skip(15);

  return {
    sectionsCount,
    encoding,
  };
}

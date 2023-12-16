import { BufferConsumer } from "@triforce-heroes/triforce-core";
import { Encoding } from "../types/Encoding.js";
export declare function parseHeader(consumer: BufferConsumer): {
    sectionsCount: number;
    encoding: Encoding;
};

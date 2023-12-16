/// <reference types="node" resolution-mode="require"/>
import { BufferConsumer } from "@triforce-heroes/triforce-core";
export type InfoEntry = [dataOffset: number, index: number, attributes: Buffer];
export declare function parseInfo(consumer: BufferConsumer): InfoEntry[];

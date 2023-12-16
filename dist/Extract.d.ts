/// <reference types="node" resolution-mode="require"/>
import { InfoEntry } from "./parsers/parseInfo.js";
import { DataSection } from "./types/DataSection.js";
type StringEntry = [index: number, text: string];
export declare function extract(buffer: Buffer): DataSection[];
export declare function getEntries(data: Buffer): InfoEntry[];
export declare function getStrings(entries: InfoEntry[], data: Buffer): StringEntry[];
export {};

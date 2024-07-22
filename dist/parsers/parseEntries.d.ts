import { Entry } from "../types/Entry.js";
export declare function parseEntries(buffer: Buffer, hasStrings: boolean): {
    count: number;
    attributesLength: number;
    attributesBaseLength: number;
    entries: Entry[];
};

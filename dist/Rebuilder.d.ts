/// <reference types="node" resolution-mode="require"/>
export declare class Rebuilder {
    private readonly attributesLength;
    private readonly stringsMap;
    private readonly infoEntries;
    private readonly infoEntryNull;
    private readonly extraSections;
    constructor(attributesLength: number);
    addString(index: number, value: string | null | undefined, attributes: Buffer): void;
    updateString(index: number, value: string | null | undefined): void;
    addNull(): void;
    addSection(name: string, data: Buffer): void;
    build(): Buffer;
}

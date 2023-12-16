/// <reference types="node" resolution-mode="require"/>
export declare class Patcher {
    private readonly rebuilder;
    constructor(source: Buffer);
    patchString(index: number, value: string | null | undefined): void;
    build(): Buffer;
}

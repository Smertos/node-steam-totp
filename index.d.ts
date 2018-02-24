/// <reference types="node" />
export declare function time(timeOffset?: number): number;
export declare function generateAuthCode(secret: Buffer | string, timeOffset?: number): Promise<string>;
export declare const getAuthCode: typeof generateAuthCode;
export declare function generateConfirmationKey(identitySecret: Buffer | string, time: number, tag: string): string;
export declare const getConfirmationKey: typeof generateConfirmationKey;
export declare function getTimeOffset(): Promise<[number, number]>;
export declare function getDeviceID(steamID: string | {
    toString: () => string;
}): string;

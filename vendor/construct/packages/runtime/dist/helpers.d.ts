export type ConstructClassValue = string | false | null | undefined | readonly ConstructClassValue[] | {
    readonly [className: string]: unknown;
};
export declare function constructClassNames(...values: ConstructClassValue[]): string;
export declare function constructRange(length: number): number[];
//# sourceMappingURL=helpers.d.ts.map
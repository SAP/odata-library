export = aggregate;
declare function aggregate(BaseClass: any, ...additionalClasses: any[]): {
    new (...args: any[]): {
        [x: string]: any;
    };
    [x: string]: any;
};
declare namespace aggregate {
    namespace _ {
        export { copyNonSpecialProperties };
    }
}
declare function copyNonSpecialProperties(target: any, source: any): void;
//# sourceMappingURL=aggregate.d.ts.map
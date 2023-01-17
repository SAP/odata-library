export namespace AUTHENTICATORS {
    const basic: typeof import("./authentication/basic");
    const none: typeof import("./authentication/none");
    const samlSap: typeof import("./authentication/samlSap");
    const cookie: typeof import("./authentication/cookie");
    const cert: typeof import("./authentication/cert");
    const headers: typeof import("./authentication/headers");
}
export const AUTHENTICATORS_AUTO_ORDER: typeof import("./authentication/none")[];
export function authenticate(agent: Agent, endpointUrl: string): Promise<any>;
export function authenticateAuto(agent: Agent, endpointUrl: string): Promise<any>;
export function tryAuthenticator(index: number, endpointUrl: string, init: any): void;
export function fatalAuthenticateError(resError: Error, previousAuthenticator: any): Error;
//# sourceMappingURL=authentication.d.ts.map
export namespace AUTHENTICATORS {
    let basic: typeof import("./authentication/basic");
    let none: typeof import("./authentication/none");
    let samlSap: typeof import("./authentication/samlSap");
    let cookie: typeof import("./authentication/cookie");
    let cert: typeof import("./authentication/cert");
    let headers: typeof import("./authentication/headers");
}
export const AUTHENTICATORS_AUTO_ORDER: typeof import("./authentication/none")[];
export function authenticate(agent: Agent, endpointUrl: string): Promise<any>;
export function authenticateAuto(agent: Agent, endpointUrl: string): Promise<any>;
export function tryAuthenticator(index: number, endpointUrl: string, init: Object): void;
export function fatalAuthenticateError(resError: Error, previousAuthenticator: Object): Error;
//# sourceMappingURL=authentication.d.ts.map
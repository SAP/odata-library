/**
 * Add addtional search part to the url
 *
 * @example
 *
 * let updatedUrl = appendSearch("https://localhost/", "foo=2");
 * updatedUrl === "https://localhost/?foo=2";
 *
 * @param {String} inputUrl url for adding new search parameters
 * @param {String} additionalSearch string which contains search parameters for adding
 *
 * @return {String} updated url
 */
export function appendSearch(inputUrl: string, additionalSearch: string): string;
/**
 * Append "/" to the beginning of the  path (could be
 * use out of url handling also)
 *
 * @example
 *
 * absolutizePath("foo");  //=> "/foo"
 * absolutizePath("/foo/bar");  //=> "/foo/bar"
 * absolutizePath("//foo/bar");  //=> "/foo/bar"
 *
 * @param {String} path content
 *
 * @return {String} absolutized path
 */
export function absolutizePath(path: string): string;
export declare function base(inputUrl: any): string;
export declare function normalize(input: any, base: any): string;
export declare function username(inputUrl: any): string;
export declare function password(inputUrl: any): string;
//# sourceMappingURL=url.d.ts.map
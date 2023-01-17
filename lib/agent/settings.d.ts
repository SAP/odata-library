export = parseSettings;
/**
 * Parse connection settings passed to the client object
 *
 * @param {String|Object} connectionSettings - url or object with url and auth settings
 *
 * @return {Object} structure used by the client to connect the server
 */
declare function parseSettings(connectionSettings?: string | any): any;
declare namespace parseSettings {
    namespace _ {
        /**
         * Try to get authentication headers from constructor settings and environment variable
         *
         * @param {Object} connectionSettings - object which could contains corrently defined url
         * @param {Object} environmentVariables - map of environment variables
         * @param {Object} parameters - reference to parameter structure which is updated by method
         *
         * @return {Object} returns structure defining OData endpoint
         */
        function parseHeadersDefinitions(connectionSettings: any, environmentVariables: any, parameters: any): any;
        /**
         * Check if authentication headers settings is correct
         *
         * @param {Object} connectionSettings - object which could contains corrently defined url
         * @param {Object} environmentVariables - map of environment variables
         *
         * @return {Object} returns structure defining OData endpoint
         */
        function checkHeadersSettings(connectionSettings: any, environmentVariables: any): any;
        /**
         * Try to get cookies from environment variable
         *
         * @param {Object} connectionSettings - object which could contains corrently defined url
         * @param {Object} parameters - reference to parameter structure which is updated by method
         *
         * @return {Object} returns structure defining OData endpoint
         */
        function parseConnectionCookie(connectionSettings: any, parameters: any): any;
        /**
         * Check if cookie settings is correct
         *
         * @param {Object} connectionSettings - object which could contains corrently defined url
         *
         * @return {Object} returns structure defining OData endpoint
         */
        function checkCookieSettings(connectionSettings: any): any;
        /**
         * Determine type of template from AUTH.CERT for
         * checking and parsing TLS definitions
         *
         * @param {Array} templateDefinitions - list of templates for TLS definitionis (coming from AUTH.CERT)
         * @param {Object} connectionSettings - object which could contains corrently defined url
         * @param {Object} processEnv - map of environment variables
         *
         * @return {Object} template TLS settings
         */
        function determineTLSDefinition(templateDefinitions: any[], connectionSettings: any, processEnv: any): any;
        /**
         * Check current TLS settings by template
         *
         * @param {Array} definition - list of templates for TLS definitionis (coming from AUTH.CERT)
         * @param {Object} connectionSettings - object which could contains corrently defined url
         * @param {Object} processEnv - map of environment variables
         * @param {Object} parameters - parsed settings
         *
         * @return {Error} error description
         */
        function checkTLSDefinition(definition: any[], connectionSettings: any, processEnv: any, parameters: any): Error;
        /**
         * Parse TLS settings
         *
         * @param {Array} templateDefinitions - list of templates for TLS definitionis (coming from AUTH.CERT)
         * @param {Object} connectionSettings - object which could contains corrently defined url
         * @param {Object} processEnv - map of environment variables
         * @param {Object} parameters - parsed settings
         *
         * @return {Object} parameters with TLS settings
         */
        function parseTLSDefinitions(templateDefinitions: any[], connectionSettings: any, processEnv: any, parameters: any): any;
    }
    namespace AUTH {
        namespace CERT {
            namespace PEM_OBJECT_KEYS {
                const ORDER: number;
                const SOURCE: string;
                const MANDATORY_KEYS: string[];
                const OPTIONAL_KEYS: string[];
                const ADDITIONAL_KEYS: {
                    "auth.type": string;
                };
            }
            namespace PFX_OBJECT_KEYS {
                const ORDER_1: number;
                export { ORDER_1 as ORDER };
                const SOURCE_1: string;
                export { SOURCE_1 as SOURCE };
                const MANDATORY_KEYS_1: string[];
                export { MANDATORY_KEYS_1 as MANDATORY_KEYS };
                const OPTIONAL_KEYS_1: string[];
                export { OPTIONAL_KEYS_1 as OPTIONAL_KEYS };
                const ADDITIONAL_KEYS_1: {
                    "auth.type": string;
                };
                export { ADDITIONAL_KEYS_1 as ADDITIONAL_KEYS };
            }
            namespace PEM_ENVIRONMENT_KEYS {
                const ORDER_2: number;
                export { ORDER_2 as ORDER };
                const SOURCE_2: string;
                export { SOURCE_2 as SOURCE };
                const MANDATORY_KEYS_2: string[];
                export { MANDATORY_KEYS_2 as MANDATORY_KEYS };
                const OPTIONAL_KEYS_2: string[];
                export { OPTIONAL_KEYS_2 as OPTIONAL_KEYS };
                export namespace CONVERSION {
                    const ODATA_CLIENT_CERT: string;
                    const ODATA_CLIENT_KEY: string;
                    const ODATA_EXTRA_CA: string;
                }
                const ADDITIONAL_KEYS_2: {
                    "auth.type": string;
                };
                export { ADDITIONAL_KEYS_2 as ADDITIONAL_KEYS };
            }
            namespace CA_OBJECT_KEYS {
                const ORDER_3: number;
                export { ORDER_3 as ORDER };
                const SOURCE_3: string;
                export { SOURCE_3 as SOURCE };
                const MANDATORY_KEYS_3: string[];
                export { MANDATORY_KEYS_3 as MANDATORY_KEYS };
                const OPTIONAL_KEYS_3: any[];
                export { OPTIONAL_KEYS_3 as OPTIONAL_KEYS };
            }
            namespace CA_ENVIRONMENT_KEYS {
                const ORDER_4: number;
                export { ORDER_4 as ORDER };
                const SOURCE_4: string;
                export { SOURCE_4 as SOURCE };
                const MANDATORY_KEYS_4: string[];
                export { MANDATORY_KEYS_4 as MANDATORY_KEYS };
                const OPTIONAL_KEYS_4: any[];
                export { OPTIONAL_KEYS_4 as OPTIONAL_KEYS };
                export namespace CONVERSION_1 {
                    const ODATA_EXTRA_CA_1: string;
                    export { ODATA_EXTRA_CA_1 as ODATA_EXTRA_CA };
                }
                export { CONVERSION_1 as CONVERSION };
            }
        }
    }
}
//# sourceMappingURL=settings.d.ts.map
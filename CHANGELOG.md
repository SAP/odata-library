# Changelog

# 2.5.0

- [FEATURE] Add support for functions - Norbert Volf
- [FEATURE] Share schema for Action and Function - Norbert Volf
- [INTERNAL] Move documentation to github pages - Norbert Volf
- [INTERNAL] Bump serialize-javascript and mocha - dependabot[bot]

# 2.4.0

- [FEATURE] Use post to upload files by odata endpoint - Norbert Volf

# 2.3.5

- [FIX] Enable action's payload for collection parameter - Sreelal Soman
- [FIX] Provide compatibility capabilities on v4 entity set model - Jakub Vaclavik

# 2.3.4

- [FEATURE] Bound actions for collection typed resources - Jakub Vaclavik

# 2.3.3

- [FIX] Binding parameter determination for Actions - Jakub Vaclavik

# 2.3.2

- [FIX] Reset entity after bound action call - Jakub Vaclavik
- [FIX] Correct action payload formatting in batch call - Jakub Vaclavik

# 2.3.1

- [FIX] Allow avoid v4 "Missing Content-ID header in request within a change set" error - Jakub Vaclavik
- [FIX] V2 service inicialization - Jakub Vaclavik

# 2.3.0

- [FIX] Object naming and path determination for action imports - Jakub Vaclavik
- [FEATURE] Unbound actions and action parameters - Jakub Vaclavik
- [FIX] Update ACTIVE_OPERATIONS.md - Benjamin Warth

# 2.2.4

- [INTERNAL] Add definition for job - Norbert Volf
- [FIX] Namespace with dots - Jakub Vaclavik

# 2.2.3

- [FEATURE] Add If-Match header to MERGE request - Michal Kopulety
- [INTERNAL] Add response object usage to doc - Norbert Volf

# 2.2.2

- [FIX] Update type definitions for TypeScript - Norbert Volf

# 2.2.1

- [INTERNAL] Use engine with implement getSetCookie in Fetch API

# 2.2.0

- [INTERNAL] Use internal Node fetch implementation - Norbert Volf

# 2.1.2

- [FIX] Security vulnerabilities in xml2js - Benjamin Warth
- [FEATURE] Parameters for v4 actions - Jakub Vaclavik
- [FIX] Fixed package.json type reference - Akos Szalay

# 2.1.1

- [FIX] No strict mode for SideEffect annotation - Jakub Vaclavik
- [FIX] Use default entityTypePath in Action definition - Norbert Volf

# 2.1.0

- [FEATURE] Added typescript types to project - Akos Szalay
- [FIX] Fixed typo in documentation - Michael Scharf
- [INTERNAL] Add documentation to replace raw value - Norbert Volf

# 2.0.0

- [FEATURE] Add support for explicit operator - Norbert Volf
  API has changed. Use value() for reading STREAM
  from entity instead of automatically read STREAM
  from entity set with hasStream attribute.

# 1.0.8

- [FEATURE] Use HTTP headers for authentication - Norbert Volf

# 1.0.7

- [FEATURE] Add authentication by client certificate - Norbert Volf
- [FIX] Emulate Fetch API response in batch processing - Norbert Volf

# 1.0.6

- [FIX] Fallback navigation target type resolution - Jakub Vaclavik

# 1.0.5

- [FEATURE] Force to use specific authenticator - Norbert Volf

# 1.0.4

- [FEATURE] Send navigation properties for v4 - Norbert Volf

# 1.0.3

- [FEATURE] Use "In" as default parameter mode - Norbert Volf
- [FEATURE] Use cookie to authorize requests - Norbert Volf
- [FIX] Correctly process invalid response in batch - Norbert Volf

# 1.0.2

- [FIX] Correctly process 1:1 navigation property - Norbert Volf

# 1.0.1

- [FEATURE] Resolve deep property - Norbert Volf
- [FEATURE] Add $filter to entity set count request - Norbert Volf

# 1.0.0

- [FIX] Raise error for error status codes - Norbert Volf
- [FEATURE] Use fetch api as HTTP agent - Norbert Volf

# 0.10.5

- [FIX] Correctly create entity with complex type - Norbert Volf

# 0.10.4

- [FIX] Correctly reject Unauthorized on SAML request - Norbert Volf

# 0.10.3

- [FIX] Set header for correct requests - Norbert Volf

# 0.10.2

- [FIX] Use local request object for FunctionImport - Norbert Volf

# 0.10.1

- [FIX] Remove additional question mark from post requests - Michal Kopulety
- [FEATURE] Log also failed requests - Michal Kopulety
- [FIX] Keep request instance after reset - Norbert Volf

# 0.10.0

- [FIX] Finish request definition inside tick - Norbert Volf

# 0.9.14

- [FIX] Remove additional slash from base url - Norbert Volf

# 0.9.13

- [FEATURE] Resolves batch responses with errors - Norbert Volf
- [FIX] Buffer count request - Norbert Volf

# 0.9.12

- [FEATURE] PATCH method for OData 3.0 and newer - Norbert Volf
- [FIX] Parse PropertyPath with Navigation Property - Norbert Volf

# 0.9.11

- [FIX] Set headers before request definition - Norbert Volf

# 0.9.10

- [FIX] Fix regression with NavigationProperty handling - Norbert Volf
- [FEATURE] Batch support for FunctionImport - Norbert Volf
- [FIX] Key has to return request instance - Norbert Volf

# 0.9.9

- [FIX] Resolve OData types for procedure imports - Norbert Volf
- [FEATURE] Use base type to define EntityType key - Norbert Volf
- [FIX] NavProp resets EntitySet request too - Norbert Volf
- [FIX] Return correct context for chaining - Michal Kozubik
- [FEATURE] Read stream by single entity - Norbert Volf
- [FEATURE] Support services without CSRF token implementation - Norbert Volf
- [FIX] Corretly determine 1:1 navigation property - Norbert Volf

# 0.9.8

- [FEATURE] Bound action implementation - Norbert Volf

# 0.9.7

- [FIX] Change request type recognition - Norbert Volf

# 0.9.4

- [FEATURE] Allow to modify (merge) key properties - Michal Nežerka
- [FEATURE] Go thru navigation properties recursively - Norbert Volf

# 0.9.3

- [FIX] Setup batch content for request with body - Norbert Volf
- [FIX] Add requests to batch synchronously - Norbert Volf
- [INTERNAL] Upgrade development dependencies - Norbert Volf

# 0.9.2

- [FIX] Do not use content length header - Norbert Volf

# 0.9.1

- [FIX] Prevent double encode for key predicate values

# 0.9.0

- [FEATURE] Create entities by the deep objects

# 0.8.1

- [INTERNAL] Nexus NPM repository package support

# 0.8.0

- [FEATURE] Initial [changesets](https://github.wdf.sap.corp/ServiceTesting/ODataTestClient/blob/develop/doc/BATCH.md#use-changeset-to-call-post) implementation - Norbert Volf
- [FEATURE] Initial support for OData v4

# 0.7.0

- [FEATURE] Parse and validate annotation value - Jakub Vaclavik
- [FEATURE] Make authenticator aware of possible errors - Jakub Filak
- [FEATURE] Enable "strict" mode toggle - Jakub Vaclavik
- [FEATURE] Collection types - basic support - Jakub Vaclavik
- [FEATURE] Implement initial version of Batch processing - Norbert Volf
- [FEATURE] Implement initial version of Batch processing - Norbert Volf
- [FEATURE] Function imports in metadata model - Jakub Vaclavik
- [FEATURE] Use modular metadata for all schema-level elements - Jakub Vaclavik
- [FEATURE] Modular metamodel - Jakub Vaclavik
- [FIX] Search AssociationSet by Association property - Michal Kozubik

# 0.6.1

- [FIX] Search AssociationSet by Association property - Michal Kozubik

# 0.6.0

- [FEATURE] Add SAML authentication - Norbert Volf
- [FEATURE] Encode orderby clause - Michal Kozubik
- [FEATURE] Add NavigationProperty support - Michal Kozubik
- [FEATURE] Annotations for complex types, navigation properties and parameters

# 0.5.1

- [FIX] Determine array response from function import - Norbert Volf
- [FIX] Show correct invalid key property name - Norbert Volf

# 0.5.0

- [FEATURE] Automatically encode filter defined by string - Norbert Volf
- [FEATURE] Append parameters to the annotations url - Norbert Volf

# 0.4.4

- [FEATURE] Annotations for complex types, navigation properties and parameters - Jakub Vaclavik

# 0.4.3

- [FIX] Ignore some annotations malformations

# 0.4.2

- [FEATURE] Optional loading of additional annotations - Jakub Vaclavik

# 0.4.1

- [FIX] Use attribute to determine HTTP method without prefix and correct set Accept header

# 0.4.0

Added correct conversion of the Javascript variables to the of the OData primitives
used in the URL's and in the method bodies.

- [FEATURE] Use OData primitives in put method - Norbert Volf
- [FEATURE] Use OData primitive delete entity - Norbert Volf
- [FEATURE] Use OData primitives to create entity - Norbert Volf
- [FEATURE] Use OData primitives to read entity - Norbert Volf
- [FEATURE] Add Edm.DateTime conversion - Norbert Volf

OData-test-client uses build-in Promise object instead of superagent library object.
You can use promise chaining now.

- [FEATURE] Envelope get method - Norbert Volf
- [FEATURE] Envelope delete method - Norbert Volf
- [FEATURE] Envelope merge method - Norbert Volf
- [FEATURE] Envelope put method - Norbert Volf
- [FEATURE] Envelope post method - Norbert Volf

New methods `merge` and `select` has added to the EntitySet object. Method
`merge` updates entity by sending MERGE HTTP method and method `select` adds
_\$select_ query parameter.

- [FEATURE] Add helper for select clause - Norbert Volf
- [FEATURE] Added MERGE method - Michal Danko
- [FEATURE] Add second parameter to merge method - Norbert Volf

New properties `filter` and `label` has added to EntitySet.entityTypeProperties.

- [FEATURE] Add filter and label property to EntityType metadata - Michal Kopulety

Othe minor changes.

- [FEATURE] Show fully parsed error message - Norbert Volf
- [FIX] Define default query params per method - Norbert Volf
- [FIX] Process errors without response text - Norbert Volf
- [FIX] Not encode values by queryParameter - Norbert Volf
- [FIX] Accept zero as valid skip parameter - Norbert Volf

# 0.3.0

- [FEATURE] Add convenience wrapper for \$filter - Jakub Filak
- [FEATURE] Add support for logging - Norbert Volf
- [FIX] Rename class which represents service to "Service" - Norbert Volf
- [FEATURE] Added PUT method - Michal Danko
- [FIX] Reject errors from the library not from superagent - Norbert Volf

# 0.2.4

- [FEATURE] Add function import support - Norbert Volf
- [FEATURE] Add backend error processing - Norbert Volf
- [FEATURE] Added DELETE method - Michal Danko
- [FEATURE] Add skip clause - Norbert Volf
- [FIX] Encode URL parts that need to be encoded - Jakub Filak
- [FEATURE] Pass TLS root certificate by env variable or by object - Norbert Volf

# 0.2.3

- [FEATURE] Return responses as plain object or array instead of full response by default - Norbert Volf
- [FEATURE] Access EntitySet byt shorthand - Norbert Volf

# 0.2.2

- [FEATURE] Process key to read entity by key on client side - Norbert Volf
- [FIX] Correctly convert boolean attribute to javascript Boolean variable - Norbert Volf
- [FEATURE] Enhance network errors by URL, headers and cookies - Norbert Volf

# 0.2.1

- [FEATURE] Add search clause to EntitySet - Norbert Volf
- [FEATURE] Enhance query parameters usage - Norbert Volf
- [FIX] Remove superagnt prefix dependency - Norbert Volf

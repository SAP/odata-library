# Changelog

# 0.9.8

  * 3147731 - [FEATURE] Bound action implementation - Norbert Volf

# 0.9.7

  * 74a2306 - [FIX] Change request type recognition - Norbert Volf

# 0.9.4

  * da4b8fd - [FEATURE] Allow to modify (merge) key properties - Michal Nežerka
  * c38acdc - [FEATURE] Go thru navigation properties recursively - Norbert Volf

# 0.9.3

  * e44c2c2 - [FIX] Setup batch content for request with body - Norbert Volf
  * b1a10c6 - [FIX] Add requests to batch synchronously - Norbert Volf
  * d58c56b - [INTERNAL] Upgrade development dependencies - Norbert Volf

# 0.9.2

  * 4e4c188 - [FIX] Do not use content length header - Norbert Volf

# 0.9.1

  * b69569a - [FIX] Prevent double encode for key predicate values

# 0.9.0

  * 49e3af6 - [FEATURE] Create entities by the deep objects

# 0.8.1

  * bd5cea0 - [INTERNAL] Nexus NPM repository package support

# 0.8.0

  * 49e3af6 - [FEATURE] Initial [changesets](https://github.wdf.sap.corp/ServiceTesting/ODataTestClient/blob/develop/doc/BATCH.md#use-changeset-to-call-post) implementation - Norbert Volf
  * 3a0decb - [FEATURE] Initial support for OData v4

# 0.7.0

  * 648c626 - [FEATURE] Parse and validate annotation value - Jakub Vaclavik
  * 97fcb80 - [FEATURE] Make authenticator aware of possible errors - Jakub Filak
  * a7169fd - [FEATURE] Enable "strict" mode toggle - Jakub Vaclavik
  * 1e296a8 - [FEATURE] Collection types - basic support - Jakub Vaclavik
  * eb15e4d - [FEATURE] Implement initial version of Batch processing - Norbert Volf
  * cdbf120 - [FEATURE] Implement initial version of Batch processing - Norbert Volf
  * c885a7b - [FEATURE] Function imports in  metadata model - Jakub Vaclavik
  * 7d0f435 - [FEATURE] Use modular metadata for all schema-level elements - Jakub Vaclavik
  * 56bac45 - [FEATURE] Modular metamodel - Jakub Vaclavik
  * b83b885 - [FIX] Search AssociationSet by Association property - Michal Kozubik

# 0.6.1

  * 154b311 - [FIX] Search AssociationSet by Association property - Michal Kozubik

# 0.6.0

  * e7e1cf3 - [FEATURE] Add SAML authentication - Norbert Volf
  * db3675e - [FEATURE] Encode orderby clause - Michal Kozubik
  * 6567906 - [FEATURE] Add NavigationProperty support - Michal Kozubik
  * 75464c0 - [FEATURE] Annotations for complex types, navigation properties and parameters

# 0.5.1

  * 84efa07 - [FIX] Determine array response from function import - Norbert Volf
  * 6d97150 - [FIX] Show correct invalid key property name - Norbert Volf

# 0.5.0

  * 8eb5222 - [FEATURE] Automatically encode filter defined by string - Norbert Volf
  * a517ac9 - [FEATURE] Append parameters to the annotations url - Norbert Volf

# 0.4.4

  * 75464c0 - [FEATURE] Annotations for complex types, navigation properties and parameters - Jakub Vaclavik

# 0.4.3

  * 775d095 - [FIX] Ignore some annotations malformations

# 0.4.2

  * edfd1d4 - [FEATURE] Optional loading of additional annotations - Jakub Vaclavik

# 0.4.1

  * 3a3a011 - [FIX] Use attribute to determine HTTP method without prefix and correct set Accept header

# 0.4.0

  Added correct conversion of the Javascript variables to the  of the OData primitives
  used in the URL's and in the method bodies.

  * 40480ff - [FEATURE] Use OData primitives in put method - Norbert Volf
  * 1a8f022 - [FEATURE] Use OData primitive  delete entity - Norbert Volf
  * 357f5ae - [FEATURE] Use OData primitives to create entity - Norbert Volf
  * 02ab747 - [FEATURE] Use OData primitives to read entity - Norbert Volf
  * 044d24f - [FEATURE] Add Edm.DateTime conversion - Norbert Volf

  OData-test-client uses build-in Promise object instead of superagent library object.
  You can use promise chaining now.

  * 8b0975f - [FEATURE] Envelope get method - Norbert Volf
  * 1891321 - [FEATURE] Envelope delete method - Norbert Volf
  * 6b72987 - [FEATURE] Envelope merge method - Norbert Volf
  * 2e41ea3 - [FEATURE] Envelope put method - Norbert Volf
  * 8efb5e5 - [FEATURE] Envelope post method - Norbert Volf

  New methods `merge` and `select` has added to the EntitySet object. Method
  `merge` updates entity by sending MERGE HTTP method and method `select` adds
  *$select* query parameter.

  * 0a7d256 - [FEATURE] Add helper for select clause - Norbert Volf
  * 7cf0401 - [FEATURE] Added MERGE method - Michal Danko
  * 1d1573d - [FEATURE] Add second parameter to merge method - Norbert Volf

  New properties `filter` and `label` has added to EntitySet.entityTypeProperties.

  * e0bd6b6 - [FEATURE] Add filter and label property to EntityType metadata - Michal Kopulety


  Othe minor changes.

  * 7bc4789 - [FEATURE] Show fully parsed error message - Norbert Volf
  * 2ad3faa - [FIX] Define default query params per method - Norbert Volf
  * 19ea0d9 - [FIX] Process errors without response text - Norbert Volf
  * ecb7304 - [FIX] Not encode values by queryParameter - Norbert Volf
  * 15a096d - [FIX] Accept zero as valid skip parameter - Norbert Volf

# 0.3.0

  * e7baa4e - [FEATURE] Add convenience wrapper for $filter - Jakub Filak
  * 293f0c8 - [FEATURE] Add support for logging - Norbert Volf
  * 2650499 - [FIX] Rename class which represents service to "Service" - Norbert Volf
  * 13b0645 - [FEATURE] Added PUT method - Michal Danko
  * 2f5d51d - [FIX] Reject errors from the library not from superagent - Norbert Volf

# 0.2.4

  * 549c72f - [FEATURE] Add function import support - Norbert Volf
  * c90a04d - [FEATURE] Add backend error processing - Norbert Volf
  * b85f735 - [FEATURE] Added DELETE method - Michal Danko
  * afbe386 - [FEATURE] Add skip clause - Norbert Volf
  * ae4e89f - [FIX] Encode URL parts that need to be encoded - Jakub Filak
  * f912475 - [FEATURE] Pass TLS root certificate by env variable or by object - Norbert Volf

# 0.2.3

  * 00f081b - [FEATURE] Return responses as plain object or array instead of full response by default - Norbert Volf
  * 39cbec5 - [FEATURE] Access EntitySet byt shorthand - Norbert Volf

# 0.2.2

  * 70a5792 - [FEATURE] Process key to read entity by key on client side - Norbert Volf
  * 0bde4e2 - [FIX] Correctly convert boolean attribute to javascript Boolean variable - Norbert Volf
  * 98dbf89 - [FEATURE] Enhance network errors by URL, headers and cookies - Norbert Volf

# 0.2.1

  * 053f98f - [FEATURE] Add search clause to EntitySet - Norbert Volf
  * 0624f7a - [FEATURE] Enhance query parameters usage - Norbert Volf
  * acc8710 - [FIX] Remove superagnt prefix dependency - Norbert Volf

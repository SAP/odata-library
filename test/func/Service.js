"use strict";

const assert = require("assert");
const fs = require("fs");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const superagentModule = require("superagent");
const parseXml = require("xml2js").parseString;

let Service;

const responses = {
  "https://url1/$metadata?": `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="1.0"
	xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"
	xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"
	xmlns:sap="http://www.sap.com/Protocols/SAPData">
	<edmx:DataServices m:DataServiceVersion="2.0">
		<Schema
			Namespace="ns1"
			xml:lang="en"
			sap:schema-version="1"
			xmlns="http://schemas.microsoft.com/ado/2008/09/edm">
			<EntityType Name="EntityType1" sap:label="Entity type1" sap:content-version="1">
				<Key>
					<PropertyRef Name="Property1"/>
				</Key>
				<Property
					Name="Property1"
					Type="Edm.String"
					Nullable="false"
					MaxLength="8"
					sap:display-format="UpperCase"
					sap:label="Property 1"/>
				<Property
					Name="Property2"
					Type="Edm.Decimal"
					Precision="9"
					Scale="5"
					sap:label="Property 2"
					sap:quickinfo="Absolute Exchange Rate"/>
			</EntityType>
			<EntityContainer
				Name="ns1_Entities"
				m:IsDefaultEntityContainer="true"
				sap:supported-formats="atom json xlsx">
				<EntitySet
					Name="EntitySet1"
					EntityType="ns1.EntityType1"
					sap:creatable="false"
					sap:updatable="false"
					sap:deletable="false"
					sap:addressable="false"
					sap:content-version="1"/>
			</EntityContainer>
			<Annotations
				Target="ns1.ns1_Entities/EntitySet1"
				xmlns="http://docs.oasis-open.org/odata/ns/edm">
				<Annotation Term="Capabilities.FilterRestrictions">
					<Record>
						<PropertyValue Property="NonFilterableProperties">
							<Collection>
								<PropertyPath>Property2</PropertyPath>
							</Collection>
						</PropertyValue>
					</Record>
				</Annotation>
			</Annotations>
		</Schema>
	</edmx:DataServices>
</edmx:Edmx>`,

  "https://url2/": `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx
	Version="4.0"
	xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
    <edmx:DataServices>
        <Schema Namespace="ns1.a" xmlns="http://docs.oasis-open.org/odata/ns/edm">
            <Annotations Target="ns1.EntityType1/Property1">
                <Annotation Term="UI.Hidden"/>
			</Annotations>
			<Annotations Target="ns1.EntityType1/Property2">
				<Annotation Term="Common.ValueList">
					<Record>
						<PropertyValue Property="Label" String="VH1" />
						<PropertyValue Property="CollectionPath" String="EntitySet1" />
						<PropertyValue Property="SearchSupported" Bool="true" />
						<PropertyValue Property="Parameters">
							<Collection>
								<Record Type="Common.ValueListParameterInOut">
									<PropertyValue Property="LocalDataProperty" PropertyPath="Property2" />
									<PropertyValue Property="ValueListProperty" String="Property2" />
								</Record>
							</Collection>
						</PropertyValue>
					</Record>
				</Annotation>
				<Annotation Term="Common.ValueList">
					<Record>
						<PropertyValue Property="Label" String="VH2" Qualifier="xy"/>
						<PropertyValue Property="CollectionPath" String="EntitySet1" />
						<PropertyValue Property="SearchSupported" Bool="true" />
						<PropertyValue Property="Parameters">
							<Collection>
								<Record Type="Common.ValueListParameterInOut">
									<PropertyValue Property="LocalDataProperty" PropertyPath="Property2" />
									<PropertyValue Property="ValueListProperty" String="Property2" />
								</Record>
							</Collection>
						</PropertyValue>
					</Record>
				</Annotation>
            </Annotations>
        </Schema>
    </edmx:DataServices>
</edmx:Edmx>`,
};

function getResponseData(url) {
  let data = responses[url];
  if (!data && url.startsWith("file://")) {
    let fileName = `./test/func/samples/${url
      .substring(7)
      .replace("/$metadata?", "")}`;
    data = fs.readFileSync(fileName, "utf8");
  }

  return data;
}

function superGet(url) {
  let promise = new Promise((resolve, reject) => {
    parseXml(getResponseData(url), function (err, output) {
      if (err) {
        reject(err);
      }

      resolve({
        statusCode: 200,
        headers: {
          "content-type": "application/xml",
        },
        body: output,
      });
    });
  });

  promise.buffer = () => promise;
  return promise;
}

function basicMetadataCheck(service) {
  assert.ok(service);
  assert.ok(service.metadata);
  assert.ok(service.metadata.model);

  let schema = service.metadata.model.getSchema();
  let entitySet1 = schema.getEntityContainer().getEntitySet("EntitySet1");
  assert.ok(entitySet1);
  assert.equal(entitySet1.annotations.length, 1);

  assert.ok(service.EntitySet1);
  assert.ok(service.entitySets.EntitySet1);
}

function annotationMetadataCheck(service) {
  let entityType1 = service.metadata.model
    .getSchema()
    .getEntityType("EntityType1");
  assert.ok(entityType1);
  assert.ok(entityType1.getProperty("Property1").hasTerm("UI.Hidden"));

  let property = entityType1.getProperty("Property2");
  assert.ok(property.sap.valueLists);
  assert.equal(property.sap.valueLists.length, 2);
}

describe("Service", function () {
  beforeEach(function () {
    let createAgent = superagentModule.agent;
    sinon.stub(superagentModule, "agent").value(() => {
      let agent = createAgent();
      sinon.stub(agent, "get").value(superGet);
      return agent;
    });

    Service = proxyquire("../../lib/Service", {
      superagent: superagentModule,
    });
  });

  it("loads metadata from single URL", function (done) {
    let service = new Service({
      url: "https://url1",
    });

    service.init.then(() => {
      basicMetadataCheck(service);
      done();
    });
  });

  it("loads metadata with annotations from 2 URLs", function (done) {
    let service = new Service({
      url: "https://url1",
      annotationsUrl: "https://url2",
    });

    service.init.then(() => {
      basicMetadataCheck(service);
      annotationMetadataCheck(service);
      done();
    });
  });

  it.skip("loads sample FCO_MANAGE_ACTIVITY_TYPE_SRV (segw) metadata and annotations", async function () {
    let service = new Service({
      url: "file://FCO_MANAGE_ACTIVITY_TYPE_SRV.metadata.xml",
      annotationsUrl: "file://FCO_MANAGE_ACTIVITY_TYP_ANNO_MDL.xml",
    });

    await service.init;

    assert.ok(service);
    assert.ok(service.metadata);
    assert.ok(service.metadata.model);

    let schema = service.metadata.model.getSchema();
    let entityType1 = schema.getEntityType("C_CostCenterActivityTypeTPType");
    assert.ok(entityType1);
    assert.ok(entityType1.hasTerm("Common.SideEffects"));
    assert.ok(entityType1.hasTerm("UI.Facets"));
  });

  it("loads simple v2 metadata", async function () {
    let service = new Service({
      url: "file://simple.v2.xml",
    });

    await service.init;

    assert.ok(service);
    assert.ok(service.metadata);
    assert.ok(service.metadata.model);

    let schema = service.metadata.model.getSchema();
    let entityType1 = schema.getEntityType("C_CurrencyExchangeRateType");
    assert.ok(entityType1);
    assert.ok(entityType1.hasTerm("Common.SemanticKey"));
  });

  // it("loads simple v4 metadata", async function() {
  // 	let service = new Service({
  // 		"url": "file://simple.v4.xml"
  // 	});

  // 	await service.init;

  // 	assert.ok(service);
  // 	assert.ok(service.metadata);
  // 	assert.ok(service.metadata.model);

  // 	let schema = service.metadata.model.getSchema();
  // 	let entityType1 = schema.getEntityType("C_CurrencyExchangeRateType");
  // 	assert.ok(entityType1);
  // 	assert.ok(entityType1.hasTerm("Common.SemanticKey"));
  // });
});

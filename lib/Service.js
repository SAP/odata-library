"use strict";

const _ = require("lodash");
const Metadata = require("./model/Metadata");
const EntitySet = require("./engine/EntitySet");
const FunctionImport = require("./engine/FunctionImport");
const Action = require("./engine/BoundableAction");
const ActionImport = require("./engine/ActionImport");
const BoundableFunction = require("./engine/BoundableFunction");
const Agent = require("./agent/Agent");
const normalizeSettings = require("./agent/settings");
const Batch = require("./agent/batch/Batch");
const ChangeSet = require("./agent/batch/ChangeSet");

/**
 * OData service client implementation.
 *
 * See https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-odata/2b686a1a-9e1f-456f-80ff-072a010fc278 for detailed info on OData.
 *
 * <h3>Properties</h3>
 *
 * <ul>
 *   <li>agent - wrapped fetch API which contains current authorization</li>
 *   <li>init - promise which is resolved when Metadata are loaded and processed</li>
 *   <li>metadata - instance of the Metadata object, which contains metadata infromations and methods for finding out them</li>
 *   <li>entitySets - object which contains instance EntitySets objects for work with them</li>
 *   <li>functionImports - object which contains instance FunctionImport objects for work with them</li>
 * </ul>
 *
 * @class Service
 */
class Service {
  /**
   * Creates an instance of <code>Service</code>.
   * @param {String|Object} [args] Settings which defines URL, authrization and additional parameters of the OData service
   * @memberof Service
   */
  constructor(args) {
    this.initializeProperties(normalizeSettings(args));
  }

  /**
   * Creates OData client properties
   *
   * @param {Object} settings - structure which contains service endpoint definition
   *                              @see {@link parseConnection}
   *
   * @memberof Service
   */
  initializeProperties(settings) {
    let entitySets;
    let metadata;
    let functionImports;
    let actionImports;

    Object.defineProperty(this, "agent", {
      value: new Agent(settings),
      writable: false,
    });

    Object.defineProperty(this, "init", {
      value: new Promise((resolve, reject) => {
        this.agent
          .metadata()
          .then((responses) => {
            metadata = new Metadata(responses, {
              strict: settings.strict,
              logger: this.agent.logger,
            });
            this.agent.setServiceVersion(metadata.model.version);
            entitySets = this.buildEntitySets(this.agent, metadata);
            functionImports =
              metadata.model.version === "4.0"
                ? this.buildFunctionObjects(this.agent, metadata, entitySets)
                : this.buildFunctionImports(this.agent, metadata);
            actionImports = this.buildActionObjects(
              this.agent,
              metadata,
              entitySets
            );
            resolve();
          })
          .catch(reject);
      }),
      writable: false,
    });

    Object.defineProperty(this, "metadata", {
      get: () => metadata,
    });

    Object.defineProperty(this, "entitySets", {
      get: () => entitySets,
    });

    Object.defineProperty(this, "functionImports", {
      get: () => functionImports,
    });

    Object.defineProperty(this, "actionImports", {
      get: () => actionImports,
    });

    Object.defineProperty(this, "defaultSchema", {
      get: () => metadata.model.getSchema(),
    });
  }

  /**
   * Creates Object with OData EntitySet wrappers
   *
   * @param {Agent} agent - instance of the agent which handler HTTP requests
   * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
   *
   * @return {Object}  returns map which contains EntitySets instances
   *
   * @memberof Service
   */
  buildEntitySets(agent, metadata) {
    return metadata.model
      .getSchema()
      .getEntityContainer()
      .entitySets.reduce((acc, entitySet) => {
        let name = entitySet.name;

        acc[name] = new EntitySet(agent, metadata, entitySet);
        if (!this[name]) {
          this[name] = acc[name];
        } else {
          agent.logger.warn(
            `EntitySet ${name} is not accessible as shorthand.`
          );
        }

        return acc;
      }, {});
  }

  /**
   * Build endpoints for Functions of OData service (version 4.0)
   *
   * @param {Agent} agent - instance of the agent which handler HTTP requests
   * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
   * @param {Object} entitySets - object which contains EntitySets instances for bound functions
   *
   * @return {Object}  empty object, because unbound functions are not supported
   *  @memberof Service
   */
  buildFunctionObjects(agent, metadata, entitySets) {
    return metadata.model.getSchema().functions.reduce((acc, metaFunction) => {
      if (metaFunction.isBound) {
        let functionObject = new BoundableFunction(agent, metaFunction);
        Object.values(entitySets)
          .filter((entitySet) =>
            [
              metaFunction.boundType,
              metaFunction.boundType.elementType,
            ].includes(entitySet.entityTypeModel)
          )
          .forEach((s) => s.addBoundObject(functionObject, agent));
      } else {
        agent.logger.warn(
          `Unbound functions are not currently supported. The function \
${metaFunction.name} will not be accessible.`
        );
      }
      return acc;
    }, {});
  }

  /**
   * Build endpoints for Actions of OData service (version 4.0)
   *
   * @param {Agent} agent - instance of the agent which handler HTTP requests
   * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
   * @param {Object} entitySets - object which contains EntitySets instances for bound actions
   *
   * @return {Object}  returns map which contains ActionImport instances
   *  @memberof Service
   */
  buildActionObjects(agent, metadata, entitySets) {
    return metadata.model.getSchema().actions.reduce((acc, metaAction) => {
      let action = new Action(agent, metaAction);

      if (metaAction.isBound) {
        Object.values(entitySets)
          .filter((s) =>
            [metaAction.boundType, metaAction.boundType.elementType].includes(
              s.entityTypeModel
            )
          )
          .forEach((s) => s.addBoundObject(action, agent));
      } else {
        const actionImport = ActionImport.fromSchemaAndAction(
          metadata.model.getSchema(),
          action
        );
        if (!actionImport) {
          agent.logger.warn(
            `Unbound Action ${metaAction.name} desn't have Action Import and will not be accessible.`
          );
        } else {
          acc[metaAction.name] = actionImport;
          if (!this[metaAction.name]) {
            this[metaAction.name] = actionImport.createDirectCaller();
          } else {
            agent.logger.warn(
              `Unbound Action ${metaAction.name} is not accessible as shorthand.`
            );
          }
        }
      }

      return acc;
    }, {});
  }

  /**
   * Creates Object with OData FunctionImport wrappers
   *
   * @param {Agent} agent - instance of the agent which handler HTTP requests
   * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
   *
   * @return {Object}  returns map which contains EntitySets instances
   *
   * @memberof Service
   */
  buildFunctionImports(agent, metadata) {
    return metadata.model
      .getSchema()
      .getEntityContainer()
      .functionImports.reduce((acc, metaFunction) => {
        let functionImport = new FunctionImport(agent, metaFunction);

        acc[metaFunction.name] = functionImport;
        if (!this[metaFunction.name]) {
          this[metaFunction.name] = functionImport.createDirectCaller();
        } else {
          agent.logger.warn(
            `FunctionImport ${metaFunction.name} is not accessible as shorthand.`
          );
        }

        return acc;
      }, {});
  }

  /**
   * Create batch and register it to the agent's batch manager
   *
   * @returns {Object} batch object which represents batch request
   *
   * @memberof Service
   */
  createBatch() {
    return this.agent.batchManager.add();
  }

  /**
   * Sends batch passed as parameter or default batch from agents batch manager
   *
   * @param {Object} batch object which represents batch request
   * @param {Boolean} raw if the parameter is true just return batch response object
   *
   * @returns {Promise}  returns promise which is resolved when batch requests is received
   *
   * @memberof Service
   */
  sendBatch(...args) {
    return this.agent.batch(...args);
  }

  /**
   * Create batch for default or explicit batch
   *
   * @param {Batch} batch object which represents explicit batch
   *
   * @returns {ChangeSet}  returns new changeset object
   *
   * @public
   * @memberof Service
   */
  createChangeSet(batch) {
    let batchNormalized =
      batch || _.get(this.agent, "batchManager.defaultBatch");

    if (!batchNormalized) {
      throw new Error("Batch not found in the managed batches.");
    }
    return batchNormalized.createChangeSet();
  }

  /**
   * Commit requests to changesets (close changeset for adding new changesets)
   * The changeset could by commited explicitly or by default changeset of the
   * passed chatch or by default changes of default batch (without passed parameters)
   *
   * @param {Batch|ChangeSet} [batchItem] changeset to be commited or batch which
   *        default changeset to be commited
   *
   * @public
   * @memberof Service
   */
  commitChangeSet(batchItem) {
    _.each(
      [
        [
          () => {
            return batchItem instanceof Batch && !batchItem.defaultChangeSet;
          },
          "ChangeSet not found in the batch",
        ],
        [
          () => {
            return (
              arguments.length === 0 &&
              !_.get(this.agent, "batchManager.defaultBatch")
            );
          },
          "Batch not found in the managed batches.",
        ],
        [
          () => {
            return (
              arguments.length === 0 &&
              !_.get(this.agent, "batchManager.defaultBatch.defaultChangeSet")
            );
          },
          "ChangeSet not found in the managed batches.",
        ],
        [
          () => {
            return (
              arguments.length > 0 &&
              !(batchItem instanceof Batch) &&
              !(batchItem instanceof ChangeSet)
            );
          },
          "Invalid object passed to commit changeset.",
        ],
      ],
      (check) => {
        if (check[0]()) {
          throw new Error(check[1]);
        }
      }
    );

    if (batchItem instanceof ChangeSet) {
      batchItem.commit();
    } else if (batchItem instanceof Batch) {
      batchItem.defaultChangeSet.commit();
    } else if (arguments.length === 0) {
      this.agent.batchManager.defaultBatch.defaultChangeSet.commit();
    }
  }
}

module.exports = Service;

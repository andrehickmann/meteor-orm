/* global _, Orm */
Model = (function(){
  
  /**
  * A abstract class for handling Models and mapping the results of a Table
  * to the Model.
  * 
  * @param {Array} data the data which gets mapped to the object
  * @param {Orm.Db.Table} table the table which serves the model
  */
  var Model = function(data, table) {
    if (data && !(data.prototype === Array || data instanceof Object)) {
      throw new Error('You have to pass the data as array or object.');
    }
    if (!table || !(table instanceof Orm.Db.Table)) {
      throw new Error('You have to pass the table instance which serves the model.');
    }
    /**
     * @property {Orm.Db.Table} table the table-instance which serves the model
     */
    this.table = table;
    this._mapData(data);
  };
  
  /**
   * maps the data to the current model object.
   * 
   * @param {Object} data
   * @returns {Orm.Model}
   */
  Model.prototype._mapData = function(data) {
    var modelData = this.getTable().prepareDataForModel(data),
        modelName = this.getTable().getName();

    if (modelData[modelName] === false) {
      throw new Error('No data for mapping on the model "' + modelName + " found.");
    }
    _.extend(this, modelData[modelName]); //copying all data to own object
    return this;
  };
  
  /**
   * returns the table instance which serves the data for the model.
   * 
   * @returns {Orm.Db.Table}
   */
  Model.prototype.getTable = function() {
    return this.table;
  };
  
  return Model;
})();
Orm.Model = Model;


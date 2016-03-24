/* global Orm */

/*
* the "abstract" class for a table object.
*/
Table = (function(){
  /**
   * constructor of the table-object.
   * 
   * @param {String} nameOfTable  name of the table
   * @param {String} nameOfAdapter optional name of the adapter using to query the
   *                               database
   * @returns {Orm.Db.Table}
   */
  function Table(nameOfTable, nameOfAdapter) {
    if (typeof nameOfTable === 'undefined') {
       throw new Error('You have to define a name for your table.');
    }
    this.tablename = nameOfTable;
    this.adaptername = nameOfAdapter || Orm.Db.getStandardAdapterName();
    this.columns = [];
    this.columnSeperator = '.';
  }
  
  /**
  * returns the name of the table.
  * 
  * @returns {String}
  */
  Table.prototype.getName = function(){
    return this.tablename;
  };

 /**
  * returns the name of the adapter.
  * 
  * @returns {String}
  */
  Table.prototype.getAdaptername = function() {
    return this.adaptername;
  };

 /**
  * returns the columns of the table.
  * 
  * @returns {Orm.Db.Table}
  */
  Table.prototype.getColumns = function() {   
    if (this.columns.length === 0) {
     this.columns = this.getAdapter().getColumnsOfTable(this);
    } 
    return this.columns;
  };
  
  /**
   * returns the seperator which is used in the select for seperate the tablename
   * form the columnname (distinct column names), which is later importent when
   * the select has to return the data in an array. 
   * 
   * because the result is served in a key -> value array and the
   * key is formed out of "nameoftable"+"columnseperator"+"nameofcolumn".
   * 
   * @returns {String}
   */
  Table.prototype.getColumnSeperator = function() {
    return this.columnSeperator;
  };

  /**
  * returns the adapter of the current table.
  *
  * @returns Orm.Db.Adapter
  */
  Table.prototype.getAdapter = function() {
    if (Orm.Db.hasAdapter(this.getAdaptername()) === false) {
      throw new Error('No adapter "' + this.getAdaptername() + '" for table "' + this.getName() + '" found.');
    }
    return Orm.Db.getAdapter(this.getAdaptername());
  };

  /**
  * returns the cache for the current table.
  *
  * @return Cache
  */
  Table.prototype.getCache = function() {
    return Orm.getStorage().getInstance(
      'table_' + this.getAdapter().getName() + '_' + this.getName()
    );
  };
  
  /**
   * Returns a select-object for the current table.
   * 
   * @param {Array} columns [optiona] columns to select as array
   * 
   * @returns Orm.Db.Adapter.Select
   */
  Table.prototype.select = function(columns) {
    return this.getAdapter().select(this, columns);
  };
  
  /**
   * prepares the returned data from the query for mapping in model.
   * 
   * @param {Object} data
   * @returns {Array}
   */
  Table.prototype.prepareDataForModel = function(data) {
    var modelData = [];
    Object.keys(data).forEach(function(key) {
      var keyArray = key.split(this.getColumnSeperator()),
          column,
          table;
      if (keyArray.length < 2) {
        throw new Error('The key of the model data is malformed, please use the format: tablename + table_seperator + columnname');
      }
      column = keyArray[(keyArray.length - 1)];
      table = keyArray[(keyArray.length - 2)];
      if (!modelData[table]) {
        modelData[table] = [];
      }
      modelData[table][column] = data[key];
    }, this);
    return modelData;
  };
  
  return Table;
})();

Orm.Db.Table = Table;
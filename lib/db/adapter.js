/* closure fpr encapsulate the data of the Adapter
(hiding private vars and keeping namespace clear) */
/* global Meteor, Orm */

Adapter = (function() {
  /* Constructor for the adapter. */
  function Adapter(name, connSettings) {
    if (Orm.Db.hasAdapter(name) === true) {
      throw new Error('There is allready an adapter with the name "' + name + '" in the storage.');
    }
    if (!connSettings) {
      throw new Error('You have to pass the connection settings.');
    }
    this._dbSettings = connSettings;
    this._doneInit  = false;
    this._connection;
    this._adapterName = name;

    /* adding new adapter to the global dbStorage */
    Orm.Db.addAdapter(name, this);
  };
  
  /**
  * return the settings of the database.
  *
  * @return Object
  */
  Adapter.prototype.getSettings = function() {
    return this._dbSettings;
  };

  /**
  * returns a boolean flag if the initializiation was done.
  *
  * @return boolean
  */
  Adapter.prototype.initDone = function() {
    return this._doneInit;
  };

  /**
  * sets the initialization flag.
  *
  * @param {boolean} param flag if initialization is done
  * @throws Error if param is not a boolean
  * @return Adapter
  */
  Adapter.prototype.setInitDone = function(param) {
    if (param !== true && param !== false) {
      throw new TypeError('Param has to be true or false.');
    }
    this._doneInit = param;
    return this;
  };

  /**
  * returns the name of the current adapter.
  *
  * @return String
  */
  Adapter.prototype.getName = function () {
    return this._adapterName;
  };

  /**
  * returns the connection of the current adapter.
  *
  * @return Connection
  */
  Adapter.prototype.getConnection = function() {
    if (typeof this._connection  === 'undefined') {
      this.open();
    }
    return this._connection;
  };


  /* defining some private methods for setting private members of the object.*/

  /**
  * sets the conncetion of the current adapter.
  *
  * @param {object} conn connection-object to database
  * @throws Error if no valid connection was given
  * @return Adapter
  */
  Adapter.prototype._setConnection = function(conn) {
    if (typeof conn === 'undefined') {
      throw new Error('No valid connection given.');
    }
    this._connection = conn;
    return this;
  };

  /**
  * You have to implement a function for opening a connection to the database
  * adapter. The function has to return the established connection.
  */
  Adapter.prototype._open = function() {
    throw new Error('You have to implement a _open() function in your concrete adapter.');
  };

  /**
  * You can implement a function for initialize your adapter after _open was
  * called. The function has to return the instance of the adapter.
  */
  Adapter.prototype._initAdapter = function() {
    throw new Error('You have to implement a _initAdapter() function in your concrete adapter.');
  };

  /**
  * You have to implement a function for closing the connection of the database
  * adapter. The function has to return the instance of the adapter.
  */
  Adapter.prototype._close = function() {
    throw new Error('You have to implement a _close() function in your concrete adapter.');
  };

  /**
  * You have to implement a function for querying the adapter.
  * The function has to return the result as an object.
  */
  Adapter.prototype._query = function() {
    throw new Error('You have to implement a _query() function in your concrete adapter.');
  };

  /**
  * You have to implement a function for escaping values for quoting into querys.
  * The function has to return the escaped value as a string.
  */
  Adapter.prototype._escape = function() {
    throw new Error('You have to implement a _escape() function in your concrete adapter.');
  };
  
  /**
  * You have to implement a function for escaping values for quoting into querys.
  * The function has to return the escaped value as a string.
  */
  Adapter.prototype._select = function() {
    throw new Error('You have to implement a _select() function in your concrete adapter.');
  };

  /**
  * Handles an error during connection of the database and try's to reconnect after
  * a timeout of 2000ms.
  *
  * @param {object} error which has to be handled
  * @return Orm.Db.Adapter
  */
  Adapter.prototype.handleError = function (error) {
    if (error) {
      console.log('Error during DB-Connection on adapter "' + this.getName() + '".');
      console.log(error);
      setTimeout(this.open(), 2000);
    }
    return this;
  };

  /**
  * Closes the connection to the database.
  *
  * @return Orm.Db.Adapter
  */
  Adapter.prototype.close = function() {
    this._close();
    this.setInitDone(false);
    return this;
  };

  /**
  * Opens the connection to the database.
  *
  * @return Orm.Db.Adapter
  */
  Adapter.prototype.open = function () {
    this._setConnection(this._open());
    if (this.initDone() === false) {
      this._initAdapter();
      this.setInitDone(true);
    }
    return this;
  };

  /**
  * Performs an query on the database and returns the result.
  * 
  * The query is wrapped in Meteor.wrapAsync to synchronous return the
  * result, instead of using a callback.
  * 
  * @param {string} query the query for the database
  * @param {Array} params the parameters which should be replaced in the query
  * 
  * return Array
  */
  Adapter.prototype.query = function(query, params) {
    var syncQuery;
    
    syncQuery = Meteor.wrapAsync(this._query, this);
    return syncQuery(query, params);
  };

  /**
   * Escapte the value of an query.
   * 
   * @param {mixed} value
   * @returns {String}
   */
  Adapter.prototype.escape = function(value) {
    return this._escape(value);
  };
  
  /**
   * return an escapted identifier
   * 
   * @param {String} value
   * @returns {String}
   */
  Adapter.prototype.escapeItentifier = function(value) {
    return this._escapeIdetifier(value);
  };

  /**
   * returns information about the columns of the given table.
   * 
   * @param {Orm.Db.Table} table
   * @returns {Array}
   */
  Adapter.prototype.getColumnsOfTable = function(table) {
    if (!table || !(table instanceof Orm.Db.Table)) {
      throw new Error('You have to pass the table as parameter.');
    }
    return this._getColumnsOfTable(table);
  };
  
  /**
   * returning an select-object for building querys.
   * 
   * @param {Orm.Db.Table} table the table on which the select should be 
   *                            executed      
   * @param {Array} columns [optional}
   * @returns {Orm.Db.Adapter.Select}
   */
  Adapter.prototype.select = function (table, columns) {
    return this._select(table, columns);
  };
  
  return Adapter;
})();
Orm.Db.Adapter = Adapter;

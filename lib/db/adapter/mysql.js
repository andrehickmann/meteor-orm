/* global Orm, mysql */

/**
* The adapter can connect to any mysql-database and perform querys on it.
* It is a mapper for the meteors pcel:mysql package,
* see: https://atmospherejs.com/pcel/mysql. This package is also "just" a mapper
* for felixge's node-mysql package, which can be found 
* here: https://github.com/felixge/node-mysql
*/
Mysql = ( function() {
  
  /**
   * constructor for mysql-adapter
   * 
   * @param {String} name distinct name of the adapter
   * @param {object} dbSettings for conntection to the db
   * 
   * @returns {Orm.Db.Adapter.Mysql}
   */
  function Mysql(name, dbSettings) {
    Orm.Db.Adapter.call(this, name, dbSettings);
  }

  /**
  * inherit all functionality of prototype Orm.Db.Adapter
  */
  Mysql.prototype = Object.create(Orm.Db.Adapter.prototype);
  Mysql.prototype.constructor = Mysql;

  /* defining public methods in prototype*/

  /*implementing the private "interface" of Orm.Db.Adapter */
  Mysql.prototype._open = function() {
    var connection = mysql.createConnection(this.getSettings());
    connection.connect(this.handleError.bind(this));
    return connection;
  };

  /* no need for initializing the adapter. 
   * 
   * @return  Orm.Db.Adapter.Mysql
   */
  Mysql.prototype._initAdapter = function() {
    return this;
  };

  /**
  * closing the connection of the mysql-adapter.
  *
  * @return Orm.Db.Adapter.Mysql
  */
  Mysql.prototype._close = function() {
      this.getConnection().end(this.handleError().bind(this));
      process.exit();
      return this;
  };
  
  /**
   * performs a query on the mysql-adapter and returns the result via the
   * callback-function
   * 
   * @param {String} query  the query for the database
   * @param {Array} params  the params which get replaced in the query
   * @param {function} callback the callback-function which gets invoked if the 
   *                            result is ready
   * @returns {Orm.Db.Adapter.Mysql}
   */
  Mysql.prototype._query = function(query, params, callback) {
    return this.getConnection().query(query, params, callback);
  };
  
  /**
   * returning an escaped value for the query.
   * 
   * @param {int|float|string} value  the value to escape
   * @returns {String}
   */
  Mysql.prototype._escape = function(value) {
    return this.getConnection().escape(value);
  };
  
  /**
   * returning an escaped identifier for the query.
   * 
   * @param {String} value  the identifier to escape
   * @returns {String}
   */
  Mysql.prototype._escape = function(value) {
    return this.getConnection().escapeId(value);
  };

  Mysql.prototype.getColumnsOfTable = function(table) {
    return this.query('SHOW COLUMNS FROM ' + this._escape(table.getName()));   
  };
  
  Mysql.prototype._select = function(table, columns) {
    return new Orm.Db.Adapter.Mysql.Select(table, columns);
  };
  
  return Mysql;
})();

Orm.Db.Adapter.Mysql = Mysql;

/* global Orm */
/**
* The adapter for meteor:mysql life-select was just implementet for testing
* purpos. On querying the adapter the function will not return an usual result.
*
* The result has to be used in Meteors Meteor.publish() function because of the
* life-results. The Adapter is a mapper for numtel/meteor-mysql, for more details
* see: https://github.com/numtel/meteor-mysql
*/
Livemysql = (function(){

  function Livemysql(name, dbSettings) {
    if (!(this instanceof Livemysql)) {
      return new Livemysql(name, dbSettings);
    }
    Orm.Db.Adapter.call(this, name, dbSettings);
  }

  /**
  * inherit all functionality of prototype Orm.Db.Adapter
  */
  Livemysql.prototype = Object.create(Orm.Db.Adapter.prototype);
  Livemysql.prototype.constructor = Livemysql;
  
  Livemysql.prototype._open = function() {
    return new LiveMysql(dbSettings, this.handleError);
  };

  Livemysql.prototype._initAdapter = function() {
    // Close connections on hot code push
    process.on('SIGTERM', this._close);
    // Close connections on exit (ctrl + c)
    process.on('SIGINT', this._close);
    return this;
  };

  Livemysql.prototype._close = function() {
      console.log('Close Database connection...');
      this.getConnection().end();
      process.exit();
      return this;
  };

  Livemysql.prototype._query = function(query, params) {
    return this.getConnection().select(query, params);
  };

  Livemysql.prototype._escape = function(value) {
    return "'" + value + "'";
  };

  return Livemysql;
})();

Orm.Db.Adapter.Livemysql = Livemysql;

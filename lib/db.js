/* global Orm, Cache */
// Module: orm.db
// Storage for all used db-adapters.

Db = (function() {
  
  /**
   * @constructor
   * @returns {Orm.Db}
   */
  function Db() {
    
  }

  // static var
  Db.STANDARD_ADAPTERNAME = 'mysql';
  
  /**
   * adds a adapter to the storage.
   *
   * @param adapter {Orm.Db.Adapter}  the adapter to set
   * @returns {Orm.Db}
   */
  Db.prototype.addAdapter = function(adapter) {
    if (this.hasAdapter(adapter.getName())) {
      throw new Error('There is already an adapter with the name "' + name + '" in the db-storage.');
    }
    this.getCache().addItem(adapter.getName(), adapter);
    return this;
  };
  
  /**
   * returns the adapter by its name.
   * 
   * @throws {Error} if the adapter could not be found
   * @param {String} name the name of the adapter
   * @returns Orm.Db.Adapter
   */
  Db.prototype.getAdapter = function(name) {
    if (this.hasAdapter(name) === false) {
      throw new Error('No adapter with the name "' + name + '" was found in the storage.');
    }
    return this.getCache().getItem(name);
  };

  /**
   * checks if the adapter with the given name exists in the storage.
   * returns true if the adapter exists, otherwise false
   * 
   * @param {String} name the name of the adapter
   * @returns {boolean}
   */
  Db.prototype.hasAdapter = function(name) {
    return this.getCache().hasItem(name);
  };
  
  /**
   * returns the standard-name of the adapter.
   * 
   * @returns {String}
   */
  Db.prototype.getStandardAdapterName = function() {
    return this.STANDARD_ADAPTERNAME;
  };
  
  /**
   * returns the cache for the object.
   * 
   * @returns {Cache}
   */
  Db.prototype.getCache = function() {
    return Orm.getStorage().getInstance('db');
  };

  return Db;
})();
Orm.Db = new Db();

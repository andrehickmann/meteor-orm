/* global _, Orm */
let Select = (function(){
  "use strict";

  let Select = function(table, columns) {
    if (!table || !(table instanceof Orm.Db.Table)) {
      throw new Error('You have to pass the table where the select is executed.');
    }
    if (columns && columns.constructor !== Array) {
      throw new Error('The columns must be passed as Array');
    }
    this.table = table;
    this.columns = [];
    if (columns) {
      this.setColumns(columns);
    } else {
      this._initColumns();
    }
    this.joins = [];
    this.whereParts = [];
    this.order = [];
    this.limit = [];
    
    this.consts = {
      SELECT: 'SELECT',
      WS: ' ',
      AS: 'AS',
      FROM: 'FROM',
      ON: 'ON',
      JOINLEFT: 'JOIN LEFT',
      ESCAPE_COL: '`'
    };
    
    this.joinTypes = ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'INNER JOIN'];
  };
  
  /**
   * returns all columns for the select as objects in an array.
   * Format: {table, column}
   * 
   * @returns {Object[]}
   */
  Select.prototype.getColumns = function() {
    return this.columns;
  };
  
  Select.prototype._initColumns = function() {
    // adding all columns of current table
    if (this.columns.length === 0) {
      this.columns = this.getTable().getColumns().map(function(column) {
          return {table: this.getTable().getName(), column: column.Field};
      }, this);
    }
    return this;
  };
  
  /**
   * setting the columns to select. if you pass an array of strings with column
   * names, the function will postfix the name of the current table to the columns.
   * If you want to add a column of a specific table you have to pass an array
   * of objects with keys "table" and "column". The table could also be a real
   * Orm.Db.Table instance.
   * 
   * @param {Array|Object[]} columns the columns you want to select
   * 
   * @returns {Orm.Db.Adapter.Select}
   */
  Select.prototype.setColumns = function(columns) {
    if (!columns || (columns.constructor !== Array)) {
      throw new Error('You have to pass the columns as array.');
    }
    this.columns = columns.forEach(function(entry){
      this.addColumn(entry);
    }, this);
    return this;
  };
  
  /**
   * Adds an column to the select. you have to pass an object with the an column
   * and an optional table key. If no table-key is found, the current table-instance
   * is used.
   * 
   * @param {Object} entry  {column: '', table: ''}
   * @returns {Orm.Db.Adapter.Select}
   */
  Select.prototype.addColumn = function(entry) {
    
    if (!entry || (entry instanceof Object && !(entry.column && entry.table))) {
      throw new Error('You have to pass the column you want to add as an string or an object with an column key.');
    }
    var col = {table: entry.table || this.getTable().getName(), column: entry.column || entry};
    
    
    if (col.table instanceof Orm.Db.Table) {
      col.table = col.table.getName();
    }
    this.columns.push(col);
    return this;
  };
  
  Select.prototype.toString = function() {
    let string = '';
    
    string = Select.SELECT + Select.WS +
             this._parseColumns() +
             this._parseFrom() +
             this._parseJoin() +
             this._parseWhere() +
             ';';
    
    return string;
  };
  
  Select.prototype._parseFrom = function(table) {
    if (table && !(table instanceof Orm.Db.Table)) {
      throw new Error('You have to pass the table as an Orm.Db.Table instance.');
    }
    var fromString = '';
    if (!table) {
      table = this.getTable();
    }
    fromString += Select.WS + Select.FROM + Select.WS + table.getAdapter().escapeIdentifier(table.getName());
    return fromString;
  };
  
  /**
   * return a string for selecting the the given columns. converting the given
   * array to a string which can be used in a select-query.
   * 
   * @param {Array} columns [optional] columns of the table you want to get parsed
   *                        to a string
   * @returns {String}
   */
  Select.prototype._parseColumns = function(columns) {
    if (columns && columns.prototype !== Array) {
      throw new Error('The columns have to be passed as array.');
    }
    let columnString = '';

    columns = columns || this.getColumns();

    columns.forEach(function(entry, index, array){
      columnString += this.getTable().getAdapter().escapeIdentifier(entry.table) +
                      Select.CONCAT +
                      this.getTable().getAdapter().escapeIdentifier(entry.column) +
                      Select.WS + Select.AS + Select.WS +
                      '\'' + entry.table +  this.getTable().getColumnSeperator() + entry.column + '\'';
      if (index < (array.length - 1)) {
        columnString += ',' + Select.WS;
      }
    }, this);
    return columnString;
  };
  
  /**
   * return a string for joining the tables to the current table. converting the given
   * array to a string which can be used in a select-query.
   * 
   * @param {Array} joins [optional] joins you want to get parsed
   *                        to a string
   * @returns {String}
   */
  Select.prototype._parseJoin = function(joins) {
    var joinString = Select.WS,
        currentTable;
    joins = joins || this.getJoins();
    joins.forEach(function(join, index, values){
      currentTable = this.getTable().getAdapter().escapeIdentifier(join.table.getName());
      joinString += join.type + Select.WS +
                    currentTable + Select.WS +
                    Select.ON + Select.WS +
                    join.on;
      if (index < (values.length - 1)) {
        joinString += Select.WS;
      }
    }, this);
    return joinString;
  };
  
  /**
   * return a string for the where-part of a the query. converting the given
   * array to a string which can be used in a select-query.
   * 
   * @param {Array} whereParts [optional] where parts you want to get parsed
      *                        to a string
   * @returns {String}
   */
  Select.prototype._parseWhere = function(whereParts) {
    var whereString = '';
        whereParts = whereParts || this.getWhere();
        
    if (whereParts.length > 0) {
      whereString += Select.WS + Select.WHERE + Select.WS;
    }
    whereParts.forEach(function(orPart, orIndex, orArray) {
      if (orPart.length > 1) {
        whereString += '(';
      }
      orPart.forEach(function(andPart, andIndex, andArray){
        let condition = andPart.condition || '=';
        
        whereString += this.getTable().getAdapter().escapeIdentifier(andPart.table) + Select.CONCAT +
                       this.getTable().getAdapter().escapeIdentifier(andPart.column) + Select.WS +
                       condition + Select.WS + this.getTable().getAdapter().escape(andPart.value);
        if (andIndex < (andArray.length - 1)) {
          whereString += Select.WS + Select.AND + Select.WS;
        } 
      }, this);
      if (orPart.length > 1) {
        whereString += ')';
      }
      if (orIndex < (orArray.length - 1)) {
        whereString += Select.WS + Select.OR + Select.WS;
      }     
    }, this);
    return whereString;
  };
  
  /**
   * returns the table on which the select is executed.
   * 
   * @returns {Orm.Db.Table}
   */
  Select.prototype.getTable = function() {
    return this.table;
  };
  
  /**
   * returning all joins for the select.
   * 
   * @returns {Array}
   */
  Select.prototype.getJoins = function() {
    return this.joins;
  };
  
  /**
   * Add a left-join to the select.
   * 
   * @param {Orm.Db.Table} table the table you want to join
   * @param {string} on the criteria for the table to join
   * @param {Array} columns [optional] the columns you want to select
   * @returns {Orm.Db.Adapter.Select}
   */
  Select.prototype.joinLeft = function(table, on, columns) {
    if (!table || !(table instanceof Orm.Db.Table)) {
      throw new Error('You have to pass the table you want to join');
    }
    if (!on) {
      throw new Error('You have to pass the on part of the join');
    }
    if (columns && columns.constructor !== Array) {
      throw new Error('You have to pass the columns as an array');
    }
    //console.log(Select);
    //console.log(Select.JOINLEFT);
    this.addJoin(Select.JOINLEFT, table, on, columns);
    return this;
  };
  
  /**
   * interface for adding a join to the current select.
   * 
   * @param {String} type the join-type
   * @param {Orm.Db.Table} table the table you want to join
   * @param {String} on the on statement
   * @param {Array} columns [optional] the columns of the join you want to select
   * @returns {Advoprot.Db.Adapter.Select}
   */
  Select.prototype.addJoin = function(type, table, on, columns) {
    if (!type) {
      throw new Error('You have to pass the join type.');
    }
    if (!table || !(table instanceof Orm.Db.Table)) {
      throw new Error('You have to pass the table to join.');
    }
    if (!on) {
      throw new Error('You have to pass the on criteria.');
    }
    if (columns && columns.constructor !== Array) {
      throw new Error('You have to pass the columns as array.');
    }
    columns = columns || table.getColumns();
    
    columns = columns.map(function(column) {
      var joinColumn = {table: table.getName(), column: ''};
      
      if (_.isString(column)) {
        joinColumn.column =  column;
      } else if (_.isObject(column)) {
        joinColumn.column =  column.Field;
      }
      this.addColumn(joinColumn);
      return joinColumn;
    }, this);
    
    this.joins.push({
      type: type, 
      table: table, 
      on: on, 
      columns: columns
    });
    return this;
  };
  
  /**
   * Adding where parts to the query. Pass the where param as array with one or
   * more entrys to concat where parts with AND. Call where multiple times to 
   * concat the parts with OR.
   * 
   * @param {Object[]} where array of objects, object with following keys:
   *                   table, column, value, [optional] condition
   * @returns {Orm.Db.Adapter.Select}
   */
  Select.prototype.where = function(where) {
    if (!where || !(where instanceof Array)) {
      throw new Error('You have to pass the where param as array.');
    }
    var filteredWhere;
    if (where.length > 0) {
      filteredWhere = where.filter(function(entry){
        if (!entry.table || !entry.column || !entry.value) {
          return false;
        }
        return true;
      }, this);
      this.whereParts.push(filteredWhere);
    }
    return this;
  };
  
  /**
   * returning all where parts of the query as array of objects in array
   * 
   * @returns {Array}
   */
  Select.prototype.getWhere = function() {
    return this.whereParts;
  };
  return Select;
})();
Orm.Db.Adapter.Select = Select;

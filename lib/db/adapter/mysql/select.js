/* global Orm */
let MysqlSelect = (function(){
  "use strict";
  let MysqlSelect = function(table, columns) {
    Orm.Db.Adapter.Select.call(this, table, columns);
    this.JOINLEFT = 'LEFT JOIN';
    this.SELECT = 'SELECT';
    this.WS = ' ';
    this.CONCAT = '.';
    this.AS = 'AS';
    this.FROM = 'FROM';
    this.ON = 'ON';
    this.AND = 'AND';
    this.OR = 'OR';
    this.WHERE = 'WHERE';
    this.ESCAPE_COL = '`';
  };
  MysqlSelect.prototype = Object.create(Orm.Db.Adapter.Select.prototype);
  MysqlSelect.prototype.constructor = MysqlSelect;
  return MysqlSelect;
})();
Orm.Db.Adapter.Mysql.Select = MysqlSelect;

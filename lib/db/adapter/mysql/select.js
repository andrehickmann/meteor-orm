/* global Orm */
Select = (function(){
  
  Select = function(table, columns) {
    Orm.Db.Adapter.Select.call(this, table, columns);
  };
  
  Select.prototype = Object.create(Orm.Db.Adapter.Select.prototype);
  Select.prototype.constructor = Select;
  
  Select.SELECT = 'SELECT';
  Select.WS = ' ';
  Select.CONCAT = '.';
  Select.AS = 'AS';
  Select.FROM = 'FROM';
  Select.ON = 'ON';
  Select.JOINLEFT = 'LEFT JOIN';
  Select.AND = 'AND';
  Select.OR = 'OR';
  Select.WHERE = 'WHERE';
  Select.ESCAPE_COL = '`';
  
  return Select;
})();
Orm.Db.Adapter.Mysql.Select = Select;

/* global Meteor, Package, api */
Package.describe({
  name: 'higg:orm',
  version: '0.0.1',
  summary: 'orm for mapping data from database-tables to models',
  git: '',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  "use strict";
  api.versionsFrom('1.2.1');
  api.use('underscore', 'server');
  api.use('ecmascript', 'server');
  api.use('pcel:mysql', 'server');
  api.use('higg:cache', 'server');
  
  api.addFiles('lib/orm.js');
  api.addFiles('lib/model.js');
  api.addFiles('lib/db.js', 'server');
  api.addFiles('lib/db/adapter.js', 'server');
  api.addFiles('lib/db/adapter/livemysql.js', 'server');
  api.addFiles('lib/db/adapter/mysql.js', 'server');
  api.addFiles('lib/db/adapter/select.js', 'server');
  api.addFiles('lib/db/adapter/mysql/select.js', 'server');
  api.addFiles('lib/db/table.js', 'server');
  
  api.export('Orm');
});

Package.onTest(function(api) {
  "use strict";
  api.use('ecmascript');
  api.use('tinytest');
  api.use('higg:orm');
  api.addFiles('tests/orm-tests.js');
});

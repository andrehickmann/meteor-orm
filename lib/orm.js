Orm = {
  storage: false,

  getStorage: function() {
    "use strict";
    if (!this.storage) {
      this.storage = new CacheStorage('orm');
    }
    return this.storage;
  }
};

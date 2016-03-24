Orm = {
  storage: undefined,

  getStorage: function() {
    if (typeof storage === 'undefined') {
      storage = new CacheStorage('orm');
    }
    return storage;
  }
};

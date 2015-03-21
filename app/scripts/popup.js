'use strict';

function getWatchers(root) {
  root = angular.element(root || document.documentElement);
  var watcherCount = 0;
 
  function getElemWatchers(element) {
    var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
    var scopeWatchers = getWatchersFromScope(element.data().$scope);
    var watchers = scopeWatchers.concat(isolateWatchers);
    angular.forEach(element.children(), function (childElement) {
      watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
    });
    return watchers;
  }
  
  function getWatchersFromScope(scope) {
    if (scope) {
      return scope.$$watchers || [];
    } else {
      return [];
    }
  }
 
  return getElemWatchers(root);
}
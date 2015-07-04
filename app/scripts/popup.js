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

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-61308350-1', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');

angular.module('app', [])
  .config(function($httpProvider){
    $httpProvider.interceptors.push(function($q, $injector, $log){
       var  retries = 0,
            waitBetweenErrors = 1000,
            maxRetries =3;

        function onResponseError(httpConfig) {
          var $timeout = $injector.get('$timeout');
          return $timeout(function () {
              var $http = $injector.get('$http'); //we can't have $http in $httpProvider because it will cause circular dependency so this is one trick to get it
              return $http(httpConfig);
          }, waitBetweenErrors);
        }

        return {
          responseError: function(response){
            if(response.status == -1 && retries < maxRetries){
              $log.log('failing: ' + retries);
              retries++;
              return onResponseError(response.config);
            }
            retries = 0;
            return $q.reject(response);
          }
        }
    });
  })
  .controller('myController', ['$scope', '$http', '$log', function($scope, $http, $log){
      $scope.makeCall = function(){
        $http.get('.data.json').then(function(response){ //any arbirary call to result in failure
          $log.log('data received');
        }, function(rejection){
          $log.log('request finally rejected');
        })
      }
  }]);

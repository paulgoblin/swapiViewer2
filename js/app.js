'use strict'

var app = angular.module('swapiApp', []);

app.controller('PlanetCtrl', function($scope) {

  $scope.planetSelected = false;

  $scope.$on('planetSelected', function(event, planet){
    $scope.planetSelected = true;
    $scope.$broadcast('gotAPlanet', planet);
  })

})

app.directive("swapiResident", function($http){
  return {
    restrict: 'AE',
    scope: {
      resurl: '@resurl'
    },
    templateUrl: (elem, attr) => `partials/swapi-resident.html`,
    controller: function($scope, $http){
      $scope.resident = {};
      $scope.showRes = function(){
        return Object.keys($scope.resident).length > 0;
      }

      $http.get($scope.resurl).then(function(resp){
        console.log(resp.data);
        $scope.resident = resp.data;
      })



    }
  }
})

app.directive("swapiPlanet", function($http, $compile){
  return {
    restrict: 'AE',
    scope: {
      minRes: '@residents'
    },
    transclude: true,
    templateUrl: (elem, attr) => `partials/swapi-planet.html`,
    controller: function($scope, $http){

      $scope.planet = {};

      $scope.$on('gotAPlanet', function(event, planet) {
        console.log(planet);
        $('.residentContainer').empty();
        $scope.planet = planet;
        var $residents = planet.residents.map(function(resident){
          return $('<swapi-resident>').attr('resUrl',resident)
        })
        $residents.forEach(function($resident){
          $compile($resident)($scope);
        })
        $('.residentContainer').append($residents);
      })
    }
  }
})

app.directive("swapiPlanetsSelector", function($http) {
  return {
    restrict: 'AE',
    scope: {
      minRes: '@residents'
    },
    templateUrl: (elem, attr) => `partials/swapi-planets-selector.html`,
    controller: function($scope, $http) {

      $scope.selectPlanet = function(key){
        $scope.$emit('planetSelected', $scope.storedPlanets[key]);
      }

      $scope.storedPlanets = {};
      $scope.showSelector = true;
      $scope.hide = function (){
        return false;
      }

      var getPlanets = function(page){
        $http.get("http://swapi.co/api/planets/?page=" + page + "&format=json")
        .then(function(resp){
          console.log('got data:', resp.data);
          resp.data.results.forEach(function(planet){
            console.log('planet residents', planet.residents)
            if (planet.residents.length >= $scope.minRes) {
              $scope.storedPlanets[planet.name] = planet;
            }
          })
          if (resp.data.next) {
            getPlanets(++page)
          }
          if (!resp.data.next) {
            $scope.hide = () => true;
          }
        })
      }

      getPlanets(1)

    }
  }
})









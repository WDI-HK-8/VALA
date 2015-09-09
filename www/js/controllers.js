angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $auth, $window, $http, $state) {
  // controls the display of hamburger navicon

  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'))
      console.log($scope.currentUser.uid + ' is logged in.');
      if ($scope.currentUser != null){
        $state.go('app.home')
      }
  }

  validateUser(); //gets the current user

})

.controller('landingCtrl', function($scope, $auth, $http, $window, $state) {
  $scope.signinForm = {};

  $scope.car_exist = false;

  $scope.signin = function(){
    $auth.submitLogin($scope.signinForm).then(function(response){
      console.log(response);
      $window.localStorage.setItem('current-user', JSON.stringify(response));
      // set current user item
      if ($scope.car_exist == false){
        $state.go('app.add_vehicle');
      }

    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('signupCtrl', function($scope, $auth, $http, $state) {
  $scope.signupForm = {};

  $scope.signup = function(){
    $auth.submitRegistration($scope.signupForm).then(function(response){
      console.log(response);
      $state.go('app.landing');
      
    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('addVehicleCtrl', function($scope, $auth, $http, $window, $state) {
  $scope.carForm = {};
  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
  console.log($scope.currentUser.id);

  $scope.addVehicle = function(){
    console.log($scope.currentUser.id);
    $http.put('http://localhost:3000/api/v1/users/'+$scope.currentUser.id, $scope.carForm).then(function(response){
      console.log(response);
      $state.go('app.payment');

    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('addPaymentCtrl', function($scope, $auth, $http, $window, $state) {
  $scope.goToHome = function(){
    $state.go('app.home');
    console.log('go home!');
  }
})

.controller('homeCtrl', function($scope, $auth, $http, $window, $state) {

  $scope.myLocation = {
      lng : '',
      lat: ''
  };

  $scope.map = { 
    center: { 
      latitude: 45, 
      longitude: -73 
    }, 
    zoom: 8 
  };

       
  $scope.drawMap = function(position) {
 
    //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
    $scope.$apply(function() {
      $scope.myLocation.lng = position.coords.longitude;
      $scope.myLocation.lat = position.coords.latitude;
 
      $scope.map = {
        center: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        },
        zoom: 14,
        pan: 1
      };
 
      $scope.marker = {
        id: 0,
        coords: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        }
      }; 
       
      $scope.marker.options = {
        draggable: false,
        labelContent: "lat: " + $scope.marker.coords.latitude + '<br/> ' + 'lon: ' + $scope.marker.coords.longitude,
        labelAnchor: "80 120",
        labelClass: "marker-labels"
      };  
    });
  }
 
  navigator.geolocation.getCurrentPosition($scope.drawMap);

});



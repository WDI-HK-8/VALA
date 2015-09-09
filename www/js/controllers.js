angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $auth, $window, $http) {
  // controls the display of hamburger navicon

  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'))
      console.log($scope.currentUser);
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
});



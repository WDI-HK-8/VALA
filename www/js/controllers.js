angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $auth) {
})

.controller('landingCtrl', function($scope, $auth) {
  $scope.signinForm = {};

  $scope.signin = function(){
    $auth.submitLogin($scope.signinForm).then(function(response){
      console.log(response);
    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('signupCtrl', function($scope, $auth) {
  $scope.signupForm = {};

  $scope.signup = function(){
    $auth.submitRegistration($scope.signupForm).then(function(response){
      console.log(response);
    }).catch(function(response){
      console.log(response);
    })
  }
});



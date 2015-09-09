angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $auth) {
  // controls the display of hamburger navicon
  $scope.loggedIn = false;
  console.log($scope.loggedIn);
})

.controller('landingCtrl', function($scope, $auth, $http) {
  $scope.signinForm = {};

  $scope.signin = function(){
    $auth.submitLogin($scope.signinForm).then(function(response){
      console.log(response);
    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('signupCtrl', function($scope, $auth, $http) {
  $scope.signupForm = {};

  $scope.signup = function(){
    $auth.submitRegistration($scope.signupForm).then(function(response){
      console.log(response);
    }).catch(function(response){
      console.log(response);
    })
  }
});

// .controller('profileCtrl', function($scope, $auth, $location) {
//   $scope.signupForm = {};

//   $scope.signup = function(){
//     $auth.submitRegistration($scope.signupForm).then(function(response){
//       console.log(response);
//       $location.path('/home');
//     }).catch(function(response){
//       console.log(response);
//     })
//   }
// });



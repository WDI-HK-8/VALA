angular.module('starter.controllers', ['ionic', 'ngCordova'])

.controller('AppCtrl', function(CtrlService, $scope, $auth, $window, $http, $state) {
  // controls the display of hamburger navicon
  var validateUser = function(){
    $scope.currentUser = CtrlService.getUser(); //set value to show hamburger menu
    console.log($scope.currentUser);
    // console.log('CURRENT USER---->', $scope.currentUser);
      if ($scope.currentUser != null){
        $state.go('app.home');
      } else{
        $state.go('app.landing');
      }
  }

  $scope.signout = function(){
    CtrlService.clearUser();
    $scope.$apply;
    $state.go('app.landing');
  }

  $scope.signinForm     = {};
  $scope.signin         = function(){
    // ng-token-auth send http auth request to sign_in
    $auth.submitLogin($scope.signinForm).then(function(response){
      // store global current-user
      CtrlService.setUser(response);
      CtrlService.currentUser = CtrlService.getUser();
      validateUser();
      // check if user has car already
      response.car_license_plate ? $state.go('app.home') : $state.go('app.add_vehicle');
    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('landingCtrl', function(CtrlService, $scope, $auth, $http, $window, $state) {
  $scope.addressDisplay = ''
  // reset car_exist
  $scope.car_exist      = null;

})








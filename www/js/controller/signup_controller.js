valaApp.controller('signupCtrl', function($scope, $auth, $http, $state) {
  $scope.signupForm = {};

  $scope.signup = function(){
    $auth.submitRegistration($scope.signupForm).then(function(response){
      console.log(response);
      // notify users they have signed up and to check their inbox
      $state.go('app.landing');
      
    }).catch(function(response){
      console.log(response);
    })
  }
})
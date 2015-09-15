valaApp.controller('profileCtrl', function(CtrlService, $scope, $auth, $http, $window, $state) {

  $scope.personalForm = {};
  $scope.carForm      = {};

  $scope.editPersonalInfo = function(form){
    // check for nulls
    console.log(form);
  }

  $scope.editCarInfo = function(form){
    console.log(form);
  }

  function editUserRequest(formType){
    $http.put(CtrlService.urlFactory('users/')+ CtrlService.currentUser, editForm)
  }
})
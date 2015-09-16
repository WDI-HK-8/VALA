valaApp.controller('addVehicleCtrl', function($scope, $http, $window, $state, CtrlService) {
  $scope.carForm = {};
  console.log(CtrlService.currentUser.id);

  $scope.addVehicle = function(){
    console.log(CtrlService.currentUser.id);
    $http.put(CtrlService.urlFactory('users/')+CtrlService.currentUser.id, $scope.carForm)
    .then(function(response){
      console.log(response);
      $state.go('app.payment');

    }).catch(function(response){
      console.log(response);
    })
  }
})
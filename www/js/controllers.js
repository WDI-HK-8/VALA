angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $auth, $window, $http, $state) {
  // controls the display of hamburger navicon

  var validateUser = function(){
    $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
    console.log($scope.currentUser);
      if ($scope.currentUser != null){
        $state.go('app.home');
      } else{
        $state.go('app.landing');
      }
  }
  validateUser(); //gets the current user everytime the navbar is loaded

  $scope.signout = function(){
    $window.localStorage.clear();
    $scope.currentUser = null;
    $state.go('app.landing');
  }

})

.controller('landingCtrl', function($scope, $auth, $http, $window, $state) {
  $scope.signinForm = {};
  // reset car_exist
  $scope.car_exist = null;

  $scope.signin = function(){
    // ng-token-auth send http auth request to sign_in
    $auth.submitLogin($scope.signinForm).then(function(response){
      // store global current-user
      $window.localStorage.setItem('current-user', JSON.stringify(response));
      $scope.currentUser = response;
      // check if user has car already
      response.car_license_plate ? $state.go('app.home') : $state.go('app.add_vehicle');
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
      // notify users they have signed up and to check their inbox
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
  }
})

.controller('homeCtrl', function($scope, $auth, $http, $window, $state, $ionicLoading, $ionicPopup, $timeout) {

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
  $scope.requestMade = false;
  $scope.addressDisplay = 'Where to park?';
  $scope.myLocation = {
      lng : '',
      lat: ''
  };
  // plot 
  // $http.get('http://vala-api.herokuapp.com/api/v1/users/')
  
  // fed into navigator to create the map
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
        zoom: 13,
        pan: 2
      };

      $scope.mapConfig = { 
        events: {
          center_changed: function(a, b, c){
          $scope.center_coords = a.data.map.center;
          // console.log($scope.center_coords);
          },
          dragend: function(){
            var latlng = {lat: $scope.center_coords.G, 
              lng: $scope.center_coords.K
            };
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'location': latlng}, function(results){
              console.log(results[0].formatted_address);
              // scope apply error
              $scope.addressDisplay = String(results[0].formatted_address);
            });
          }
        }
      };

      $scope.currentLocation = {
        id: 0,
        coords: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        },
        options: {
          animation: google.maps.Animation.BOUNCE,
          icon: 'http://labs.google.com/ridefinder/images/mm_20_black.png'            
        }
      };
    });
  }

  // where the map is initiated and called
  navigator.geolocation.getCurrentPosition($scope.drawMap);

  $scope.sendCenterLocation = function(){
    var lat = $scope.center_coords ? $scope.center_coords.G : $scope.myLocation.lat;
    var lng = $scope.center_coords ? $scope.center_coords.K : $scope.myLocation.lng;
    sendPickupRequest(lat, lng);
  }

  function sendPickupRequest(lat, lng){
    var request = {
      request: {
        latitude: lat,
        longitude: lng
      }
    };

    $ionicLoading.show({
      templateUrl: 'templates/notification/waiting_request_page.html',
      scope: $scope
    });

    $http.post('http://localhost:3000/api/v1/users/'+ $scope.currentUser.id+'/requests', request).then(function(response){
      $scope.LastRequestId = response.data.id;
      $scope.requestMade = true;
      console.log($scope.LastRequestId);
    }).catch(function(response){
      console.log(response);
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'There was an error in your request.',
        template: 'Please try again later.'
      });
    })
  }

  $scope.cancelRequest = function(){
    $http.put('http://localhost:3000/api/v1/requests/'+ $scope.LastRequestId + '/cancel_request').then(function(response){
      console.log(response);
      $ionicLoading.hide();
      $scope.requestMade = false;
    }).catch(function(response){
      console.log(response);
    })
  }
})

.controller('profileCtrl', function($scope, $auth, $http, $window, $state) {

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));

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
    $http.put('http://vala-api.herokuapp.com/api/v1/users/'+ $scope.currentUser, editForm)
  }
});
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

.controller('homeCtrl', function($scope, $auth, $http, $window, $state, $ionicLoading, $ionicPopup, $timeout) {

  $scope.currentUser = JSON.parse($window.localStorage.getItem('current-user'));
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
        zoom: 10,
        pan: 2
      };

      $scope.mapConfig = { 
        events: {
          center_changed: function(a, b, c){
          $scope.center_coords = a.data.map.center;
          console.log($scope.center_coords);
          },
          dragend: function(){
            $timeout(function(){

              var latlng = {lat: $scope.center_coords.G, 
                lng: $scope.center_coords.K
              };
              var geocoder = new google.maps.Geocoder();
              geocoder.geocode({'location': latlng}, function(results){
                console.log(results[0].formatted_address);
                $scope.$apply($scope.addressDisplay = String(results[0].formatted_address));
              })
            }, 1500);
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

     

      // this needs to show valet in area
      $scope.marker = {
        id: "self",
        coords: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        },
        options: {
          animation: google.maps.Animation.BOUNCE,
          icon: 'http://labs.google.com/ridefinder/images/mm_20_black.png'            
        }
      }; 
      
      // this needs to show valet in area
      $scope.userPickupMarkers = [
        {
          id: "1",
          title: "you",
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng,
          icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png'
        }
      ];

      $scope.events = {
        center_changed: function(a, b, c){
          console.log(a,b,c);
        }
      };

    });
  }

  // where the map is initiated and called
  navigator.geolocation.getCurrentPosition($scope.drawMap);

  $scope.sendCenterLocation = function(){
    if(!$scope.center_coords){
      console.log('My current location is X:' + $scope.myLocation.lat + ', Y: ' + $scope.myLocation.lng);

      sendPickupRequest($scope.myLocation.lat, $scope.myLocation.lng);

    } else{
      console.log('I selected location X:' + $scope.center_coords.G + ', Y:' + $scope.center_coords.K);

      sendPickupRequest($scope.center_coords.G, $scope.center_coords.K);

    }
  }

  function sendPickupRequest(lat, lng){
    var request = {request: {
      latitude: lat,
      longitude: lng
    }};

    $ionicLoading.show({
      template: 'Loading...'
    });

    $http.post('http://vala-api.herokuapp.com/api/v1/users/'+ $scope.currentUser.id+'/requests', request).then(function(response){
      console.log(response);
      $ionicLoading.hide();
    }).catch(function(response){
      console.log(response);
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'There was an error in your request.',
        template: 'Please try again later.'
      });

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
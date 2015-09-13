angular.module('starter.controllers', ['ionic'])

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
  $scope.$watch(validateUser()); 

  $scope.signout = function(){
    CtrlService.clearUser();
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

.controller('addVehicleCtrl', function($scope, $http, $window, $state, CtrlService) {
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

.controller('homeCtrl', function(CtrlService, $scope, $auth, $http, $window, $state, $ionicLoading, $ionicPopup, $ionicModal) {

  $scope.requestMade    = false;
  $scope.addressDisplay = 'Where to park?';
  $scope.myLocation     = {};
  $scope.map;
  $scope.pickup  = false;
  $scope.dropoff  = false;
  var marker;
  var watchId;

  if(navigator.geolocation){

    var option  = {
      enableHighAccuracy: true,
      timeout           : Infinity,
      maximumAge        : 0             
    };
    
    var success = function(response){ //response is position
      $scope.myLocation.lat = response.coords.latitude;
      $scope.myLocation.lng = response.coords.longitude;
      console.log($scope.myLocation.lat, $scope.myLocation.lng);
      // this should reset current location
      var mapOptions = {
        center: {
          lat: $scope.myLocation.lat, 
          lng: $scope.myLocation.lng
        },
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      initMap(mapOptions); //draws map...again?
    };
    var fail    = function(response){
      console.log(response);
    };

    //fetches new location on location change
    // var watchId = 
    navigator.geolocation.watchPosition(success, fail, option);
    // navigator.geolocation.clearWatch(watchId);
  } else {
    alert('Geolocation not supported.');
  }

  // CURRENTLY EXECUTES PRIOR TO HAVING GOOGLE MAP ASSETS FROM API
  function initMap(mapOptions) {
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    marker = new google.maps.Marker({
      position: mapOptions.center,
      map: $scope.map
    })
    $scope.map.addListener('center_changed', function() {
      $scope.center_coords = $scope.map.getCenter(); //{G:lat, K:lng}
    });

    $scope.map.addListener('dragend', function(){
      var latlng = {
        lat: $scope.center_coords.G, 
        lng: $scope.center_coords.K
      };
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': latlng}, function(results){
        console.log(results[0].formatted_address);
        $scope.$digest($scope.addressDisplay = results[0].formatted_address)
      });
    });
  }

  $scope.sendCenterLocation = function(){
    var lat = $scope.center_coords ? $scope.center_coords.G : $scope.myLocation.lat;
    var lng = $scope.center_coords ? $scope.center_coords.K : $scope.myLocation.lng;
    $scope.lat = lat;
    $scope.lng = lng;
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
      scope: $scope,
      noBackdrop: false
    });

    // create a request by the user
    $http.post(CtrlService.urlFactory('users/'+ $scope.currentUser.id +'/requests'), request)
    .then(function(response){
      $scope.LastRequestId = response.data.id;
      $scope.requestMade = true;
      console.log($scope.LastRequestId);
    })
    .catch(function(response){
      console.log(response);
      $ionicLoading.closeModal();
      $ionicPopup.alert({
        title: 'There was an error in your request.',
        template: 'Please try again later.'
      });
    })
  }
  $scope.cancelRequest = function(){
    // void a request by the user
    $http.put(CtrlService.urlFactory('requests/'+ $scope.LastRequestId + '/cancel_request'))
    .then(function(response){
      console.log(response);
      $ionicLoading.closeModal();
      $scope.requestMade = false;
    })
    .catch(function(response){
      console.log(response);
    })
  }

  //ASSIGNS VALET #2 to CREATED REQUEST ONLY
  $scope.valetAcceptRequest = function(){
    $http.put(CtrlService.urlFactory('valets/2/requests/' + $scope.LastRequestId +'/valet_pick_up'))
    .then(function(response){
      console.log(response.data.auth_code);
      $ionicLoading.hide()
      $scope.$parent.pickup = true;
      // VALET LOCATION
      $scope.valetLatlng = {
        lat: Number(response.data.parking_location.latitude),
        lng: Number(response.data.parking_location.longitude)
      }
      // PICKUP LOCATION
      $scope.userLatlng  = {
        lat: $scope.lat,
        lng: $scope.lng
      };  
      // show valet information
      $scope.openModal();
    })
    .catch(function(response){
      console.log(response);
    })
  }

  $ionicModal.fromTemplateUrl('templates/notification/pickup_page.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.openModal = function() {
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.showMarker($scope.valetLatlng);
    $scope.showMarker($scope.userLatlng);
    $scope.modal.hide();
  };

  $scope.showMarker = function(Latlng){
    console.log(Latlng);
    var marker = new google.maps.Marker({
      position: Latlng,
      map:      $scope.map,
      visible:  true,
      icon:     'img/curr_loc_pin.png',
      animation: google.maps.Animation.DROP
    });
  }

  $scope.sendAuthCode = function(codeInput){
    var input = {
      request:{
        auth_code: codeInput
      }
    };

    $http.put(CtrlService.urlFactory('users/'+ $scope.currentUser.id +'/requests/' + $scope.LastRequestId +'/car_pick_up'), input)
    .then(function(response){
      $scope.pickup   = false;
      $scope.dropoff  = true;
      console.log(response, $scope);
    })
    .catch(function(response){
      console.log(response);
    })
  }
})

.controller('profileCtrl', function(CtrlService, $scope, $auth, $http, $window, $state) {

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

.service('CtrlService', function($window){

  this.currentUser;

  this.urlFactory = function(params){
    return 'http://vala-api.herokuapp.com/api/v1/'+ params;
  }
  this.setUser = function(response){
    $window.localStorage.setItem('current-user', JSON.stringify(response));
  }

  this.getUser = function(){
    return JSON.parse($window.localStorage.getItem('current-user'));
  }

  this.clearUser = function(){
    $window.localStorage.setItem('current-user', null);
  }

  // this is returned
});
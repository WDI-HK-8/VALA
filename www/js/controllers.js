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
  $scope.$watch(validateUser()); 
  $scope.$watch($scope.currentUser); 

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

.controller('homeCtrl', function(CtrlService, $scope, $auth, $http, $window, $state, $ionicLoading, $ionicPopup, $ionicModal, PrivatePubServices, $cordovaGeolocation) {

  $scope.addressDisplay = 'Where to park?';
  $scope.myLocation     = {};
  $scope.requestMade    = false;
  $scope.pickup         = false;
  $scope.dropoff        = false;
  $scope.map;
  var marker;
  var watchId;

  // Regular google maps API
  if(navigator.geolocation){

    var option  = {
      enableHighAccuracy: true,
      timeout           : 10000
    };
    var success = function(response){ //response is position
      $scope.myLocation.lat = response.coords.latitude;
      $scope.myLocation.lng = response.coords.longitude;
      console.log('MY CURRENT LOCATION--->', $scope.myLocation.lat, $scope.myLocation.lng);
      // this should reset current location
      var mapOptions = {
        center: {
          lat: $scope.myLocation.lat, 
          lng: $scope.myLocation.lng
        },
        zoom: 16
      };
      ionic.DomUtil.ready(function(){
        initMap(mapOptions); //draws map
      })
    };
    var fail    = function(response){
      console.log(response);
    };

    navigator.geolocation.getCurrentPosition(success, fail, option);
    // var watchId = 
    //fetches new location on location change
    // navigator.geolocation.clearWatch(watchId);
  } else {
    alert('Geolocation not supported.');
  }

  $window.initMap = function(mapOptions) {
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
      marker  = new google.maps.Marker ({
      position: mapOptions.center, //AKA my current position
      map     : $scope.map,
      icon    : 'img/curr_loc_pin.png'
    })

    $scope.map.addListener('dragend', function(){
      $scope.center_coords = $scope.map.getCenter(); //{G:lat, K:lng}
      console.log('dragend---> ', $scope.center_coords);
      var latlng   = {
        lat: $scope.center_coords.G, 
        lng: $scope.center_coords.K
      };

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        'location': latlng
      }, function(results){
        $scope.$digest($scope.addressDisplay = results[0].formatted_address)
      });
    });
  }
  // Called by button click event
  $scope.sendCenterLocation = function(){
    $scope.lat              = $scope.center_coords ? $scope.center_coords.G : $scope.myLocation.lat;
    $scope.lng              = $scope.center_coords ? $scope.center_coords.K : $scope.myLocation.lng;
    sendPickupRequest($scope.lat, $scope.lng);
  }
  function sendPickupRequest(lat, lng){
    var request = {
      request: {
        latitude: lat,
        longitude: lng
      }
    };
    console.log('Request Payload---->', request);
    console.log($scope);
    $scope.dropoff != true ? $scope.ionicLoadMsg = ' pickup ' : $scope.ionicLoadMsg = ' dropoff ';
    console.log($scope.ionicLoadMsg);
    $ionicLoading.show({
      // in-line template B/C map refreshes with templateURL
      template: '<ion-spinner icon="spiral" class="ion-loading-c col col-30"></ion-spinner><h1>Notifying friendly valets near your {{ionicLoadMsg}} point ...</h1><button ng-click="cancelRequest()" class="button button-assertive button-block">Cancel</button>',
      scope: $scope,
      noBackdrop: false
    });

    // CREATE A REQUEST
    if($scope.LastRequestId && $scope.dropoff){ //if request id already exists and it's a dropoff...
      $http.put(CtrlService.urlFactory('users/'+$scope.currentUser.id+'/requests/'+$scope.LastRequestId + '/request_drop_off'), request)
      .then(function(response){
        $scope.dropoff_request = true;
        console.log('Last Request ID--->', $scope.LastRequestId);
      })
      .catch(function(response){
        console.log(response);
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'There was an error in your request.',
          template: 'Please try again later.'
        });
      })
    } else{
      $http.post(CtrlService.urlFactory('users/'+ $scope.currentUser.id +'/requests'), request)
      .then(function(response){
        $scope.requestMade    = true;
        $scope.LastRequestId  = response.data.id;
        console.log('Last Request ID--->', $scope.LastRequestId);
        $scope.subscribeChannel('/user/'+ $scope.LastRequestId)
      })
      .catch(function(response){
        console.log(response);
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'There was an error in your request.',
          template: 'Please try again later.'
        });
      })
    }
  }

  $scope.subscribeChannel = function(user_response_id){
    // REAL-TIME SOCKET
    // Set subscription channel
    PrivatePubServices.subscribe(user_response_id);
    // The listener to the subscription
    PrivatePub.subscribe(user_response_id, function(data, channel) {
    
      // ON VALET RESPONSE SUCCESS
      console.log('----> subscribed');
      $ionicLoading.hide()

      // MARKER POSITIONING
      $scope.userLatlng = {
        lat: $scope.lat,
        lng: $scope.lng
      };  
      $scope.showMarker($scope.userLatlng); 

      $scope.requestMade ? $scope.pickup = true : $scope.pickup = false;

      //handles realtime subscriptions

      if(data.valet){
        $scope.valet            = {};
        $scope.valet.name       = data.valet.name;
        $scope.valet.phone      = data.valet.phone;
        $scope.valet.picture    = data.valet.picture;
        $scope.valet.valet_id   = data.valet.valet_id;
      } else if (data.parking_spot) {
        $scope.parking          = {};
        $scope.parking.address  = data.parking_spot.address;
        $scope.parking.latitude = data.parking_spot.latitude;
        $scope.parking.longitude= data.parking_spot.longitude;
      } else if (data.request){
        $scope.delivery_auth    = data.request.auth_code;
      } else {
        $scope.rating           = data.status;
      }
      console.log($scope);
      console.log($scope.pickup_valet, $scope.dropoff_valet);

      // open modal if request pickup is true
      if($scope.pickup){
        // Drop pin of car pickup location only if valet responds
        $scope.openModal();
        $scope.pickup_valet  = $scope.valet;
      }
      // when a dropoff request is just made by the user, unanswered
      else if(!$scope.delivery_auth && $scope.dropoff && $scope.dropoff_request){
        $scope.openModal();
      }
      else if($scope.delivery_auth){
        $scope.$apply($scope.delivery_auth);
        $scope.dropoff_valet  = $scope.valet;
        $ionicLoading.show({
          // in-line template B/C map refreshes with templateURL
          template: '<ion-spinner icon="spiral" class="ion-loading-c col col-30"></ion-spinner><h1>Your Auth Code is:{{delivery_auth}}</h1><h1>Valet is now retrieving your car...</h1>',
          scope: $scope,
          noBackdrop: false
        })  
      }
      else { // code is entered
        $ionicLoading.hide();
      }
      // show modal when the rating is given
      if($scope.rating){ 
        $ionicLoading.hide();
        $scope.openModal();
      } 
      // this is to keep the subscription open after valet answers to the dropoff request
      if($scope.dropoff != true){ 
        PrivatePubServices.unsubscribe('/user/'+ user_response_id, function() {
          console.log('---->unsubscribed');
        });
      }
      console.log($scope.pickup_valet, $scope.dropoff_valet);
    });
  }
  // show cancel button only when request is created
  $scope.cancelRequest = function(){
    $http.put(CtrlService.urlFactory('requests/'+ $scope.LastRequestId + '/cancel_request'))
    .then(function(response){
      $scope.requestMade    = false;
      console.log(response);
      $ionicLoading.hide();
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
    $scope.modal.show();
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
    if(!$scope.delivery_auth && $scope.dropoff && $scope.dropoff_request){
      $ionicLoading.show({
        // in-line template B/C map refreshes with templateURL
        template: '<ion-spinner icon="spiral" class="ion-loading-c col col-30"></ion-spinner><h1>Contacting Friendly valets near your car for delivery...</h1>',
        scope: $scope,
        noBackdrop: false
      })
    }
  };

  $scope.showMarker = function(Latlng){
    console.log('---> Drop marker: ',Latlng, $scope.map);
    new google.maps.Marker({
      position  : Latlng,
      map       : $scope.map,
      visible   : true,
      icon      : 'img/curr_loc_pin.png',
      animation : google.maps.Animation.DROP,
      zIndex    : google.maps.Marker.MAX_ZINDEX + 1
    });
  }

  // Add gmap script tag into home.html

  $scope.sendAuthCode = function(codeInput){
    var input = {
      request:{
        auth_code: codeInput
      }
    };
    // currently, the pickup is true due to 
    $http.put(CtrlService.urlFactory('users/'+ $scope.currentUser.id +'/requests/' + $scope.LastRequestId +'/car_pick_up'), input)
    .then(function(response){
      // TRANSITION TO DROPOFF CYCLE
      $scope.pickup       = false;
      $scope.dropoff      = true;
      $scope.requestMade  = false;
      // Wait for response of "Parked" from valet

      $scope.subscribeChannel('/user/'+ $scope.LastRequestId)
      $ionicLoading.show({
        // in-line template B/C map refreshes with templateURL
        template: '<ion-spinner icon="spiral" class="ion-loading-c col col-30"></ion-spinner><h1>Parking your car...</h1>',
        scope: $scope,
        noBackdrop: false
      });
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
valaApp.controller('homeCtrl', function(CtrlService, $scope, $auth, $http, $window, $state, $ionicLoading, $ionicPopup, $ionicModal, PrivatePubServices, $cordovaGeolocation, $timeout, $ionicPlatform) {

  $ionicPlatform.ready(function(){

    $scope.addressDisplay = 'Where to park?';
    $scope.myLocation     = {};
    $scope.requestMade    = false;
    $scope.pickup         = false;
    $scope.dropoff        = false;
    $scope.centerMarker   = true;
    $scope.map;
    var marker;
    var watchId;
    $scope.currentUser    = CtrlService.getUser();

    // Regular google maps API
    if(navigator.geolocation){

      var option       = {
        enableHighAccuracy: true,
        timeout           : 10000
      };
      var success      = function(response){ //response is position
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
        // ionic.DomUtil.ready(function(){
        initMap(mapOptions); //draws map
        // })
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
      $scope.map    = new google.maps.Map(document.getElementById('map'), mapOptions);
        marker      = new google.maps.Marker ({
        position  : mapOptions.center, //AKA my current position
        map       : $scope.map,
        animation : google.maps.Animation.BOUNCE,
      })

      // add infoWindow
      $scope.infowindow      = new google.maps.InfoWindow({
        content: 'You are here.'
      });
      $scope.infowindow.open($scope.map, marker);

      $scope.map.addListener('dragend', function(){
        $scope.center_coords = $scope.map.getCenter(); //{G:lat, K:lng}
        console.log('MAP CENTER---> ', $scope.center_coords);
        var latlng   = {
          lat: $scope.center_coords.H, 
          lng: $scope.center_coords.L
        };
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': latlng }, function(results){
          $scope.$digest($scope.addressDisplay = results[0].formatted_address)
        });
      });

      $scope.map.addListener('center_changed', function(){
        $scope.infowindow.close();
      });
    }
    // Called by button click event
    $scope.sendCenterLocation = function(){
      $scope.lat              = $scope.center_coords ? $scope.center_coords.H : $scope.myLocation.lat;
      $scope.lng              = $scope.center_coords ? $scope.center_coords.L : $scope.myLocation.lng;
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
        console.log('----> subscribed', '-------> ', data);
        $ionicLoading.hide()

        $scope.requestMade ? $scope.pickup = true : $scope.pickup = false;

        //handles realtime subscriptions
        if(data.valet){
          $scope.centerMarker     = false;
          $scope.valet            = {};
          $scope.valet.name       = data.valet.name;
          $scope.valet.phone      = data.valet.phone;
          $scope.valet.picture    = data.valet.picture;
          $scope.valet.valet_id   = data.valet.valet_id;
        } else if (data.parking_spot) {
          $scope.centerMarker     = true;
          $scope.parking          = {};
          $scope.parking.address  = data.parking_spot.address;
          $scope.parking.latLng   = {
            lat: Number(data.parking_spot.latitude),
            lng: Number(data.parking_spot.longitude)
          };
          // drops marker and sets map center
          $scope.parkingMarker    = $scope.showMarker($scope.parking.latLng, 'parking_icon.png');
          $scope.map.panTo($scope.parking.latLng);
          $scope.infowindow       = new google.maps.InfoWindow({
            content: 'Your car is now parked'
          });
          $scope.infowindow.open($scope.map, $scope.parkingMarker); 

        } else if (data.request){
          $scope.delivery_auth    = data.request.auth_code;
        } else if (data.status){
          $scope.rating           = data.status;
        } else{
          $scope.serviceBill      = data.bill;
        }
        console.log($scope);
        console.log($scope.pickup_valet, $scope.dropoff_valet);

        // Drop pin of car pickup location only if valet responds
        if($scope.pickup){
          $scope.openModal();
          $scope.pickup_valet     = $scope.valet;
          var pickupMark          = $scope.showMarker({lat:$scope.center_coords.H, lng:$scope.center_coords.L}, 'pickup_pin.png');
          $scope.infowindow       = new google.maps.InfoWindow({
            content: 'Pickup Point'
          });
          $scope.infowindow.open($scope.map, pickupMark);
        }
        // when a dropoff request is just made by the user, unanswered
        else if(!$scope.delivery_auth && $scope.dropoff && $scope.dropoff_request){
          $scope.openModal();
        }
        else if($scope.delivery_auth){
          $scope.$apply($scope.delivery_auth);
          $scope.dropoff_valet    = $scope.valet;
          $ionicLoading.show({
            // in-line template B/C map refreshes with templateURL
            template: '<ion-spinner icon="spiral" class="ion-loading-c col col-30"></ion-spinner><h1>Your Auth Code is:<br>{{delivery_auth}}</h1><br><h1>Valet is now retrieving your car.</h1>',
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
          template: '<ion-spinner icon="spiral" class="ion-loading-c col col-30"></ion-spinner><h1>Your valet will pickup your car shortly. Thank you for your patience.</h1>',
          scope: $scope,
          noBackdrop: false
        })
      }
    };
    // ADD ZOOM ZOOM TO MARKER when dropped
    $scope.showMarker = function(Latlng, icon){
      console.log('---> Drop marker: ',Latlng);
      return new google.maps.Marker({
        position  : Latlng,
        map       : $scope.map,
        visible   : true,
        icon      : 'img/'+icon,
        animation : google.maps.Animation.BOUNCE,
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
        // $scope.pickupMark.setMap(null);

        // drop new pin of parked location. zoom map to that location

        console.log(response, $scope);
      })
      .catch(function(response){
        console.log(response);
      })
    }

    $scope.sendReviews  = function(choice_pickup, choice_dropoff, tip){
      var ratingRequest = {
        request: {
          pick_up : choice_pickup,
          drop_off: choice_dropoff,
          tip     : Number(tip)
        }
      };

      console.log(ratingRequest);
      $http.put(CtrlService.urlFactory('users/'+ $scope.currentUser.id + '/requests/' + $scope.LastRequestId + '/ratings'), ratingRequest)
      .then(function(response){
        console.log(response);
        $scope.totalBill       = response.data.total;
        $scope.completeRequest = true;
        $scope.modal.hide();
        // show the cost of the bill
        $ionicLoading.show({
          // in-line template B/C map refreshes with templateURL
          template  : '<h1>Thank you for using Vala services.<br> Your bill is ${{totalBill}}',
          scope     : $scope,
          noBackdrop: false,
        });
        $timeout(function(){window.location.reload()}, 10000);
      })
      .catch(function(response){
        $ionicPopup.alert({
          title: 'There was an error in your request.',
          template: 'Please enter reviews for both valets. Thank you.'
        });
        console.log(response);
      })
    }

    $scope.panToCurrentLocation = function(){
      navigator.geolocation.getCurrentPosition(function(response){
        $scope.myLocation.lat   = response.coords.latitude;
        $scope.myLocation.lng   = response.coords.longitude;
      })
      $scope.map.panTo($scope.myLocation);
    }
  }) //IONIC PLATFORM READY
}) //CONTROLLER LEVEL
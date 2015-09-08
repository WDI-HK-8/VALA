// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ng-token-auth'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $authProvider) {
  $stateProvider

  .state('app', { //APP MENU
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/menu/home.html'
      }
    }
  })

  .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/menu/profile.html'
        }
      }
  })
  .state('app.support', {
    url: '/support',
    views: {
      'menuContent': {
        templateUrl: 'templates/menu/support.html'
      }
    }
  })

  .state('app.tutorial', {
    url: '/tutorial',
    views: {
      'menuContent': {
        templateUrl: 'templates/menu/tutorial.html'
      }
    }
  })

  .state('app.landing', { //CONTROLLER: LOGIN() 
    url: '/landing',
    views: {
      'menuContent': {
        templateUrl: 'templates/landing_page.html',
        controller: 'landingCtrl'
      }
    }
  })

  .state('app.signup', { //CONTROLLER: SIGNUP()
    url: '/signup',
    views: {
      'menuContent': {
        templateUrl: 'templates/registration/signup_page.html',
        controller: 'signupCtrl' 
      }
    },
  })

  .state('app.add_vehicle', {
    url: '/add_vehicle',
    views: {
      'menuContent': {
        templateUrl: 'templates/registration/add_vehicle_page.html'
      }
    }
  })
  .state('app.payment', {
    url: '/payment',
    views: {
      'menuContent': {
        templateUrl: 'templates/registration/payment_page.html'
      }
    }
  })


  // Valet response to pickup
  .state('app.pickup', { 
    url: '/pickup',
    views: {
      'menuContent': {
        templateUrl: 'templates/notification/pickup_page.html'
      }
    }
  })

  // Valet response to dropoff
  .state('app.dropoff', { 
    url: '/dropoff',
    views: {
      'menuContent': {
        templateUrl: 'templates/notification/dropoff_page.html'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/landing');
  $authProvider.configure({
    apiUrl:                 'http://localhost:3000',
    emailSignInPath:        '/auth/sign_in',
    emailRegistrationPath:  '/auth',
    signOutUrl:             '/auth/sign_out',
    accountUpdatePath:      '/auth',
    confirmationSuccessUrl:  window.location.href
  });
});

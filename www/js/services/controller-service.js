valaApp.service('CtrlService', function($window){

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
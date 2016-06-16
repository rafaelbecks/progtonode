/*
Angular main module of the app, the directives are written here too.
Author: Rafael Becerra
Date: 19/11/2015
*/

if(document.URL.indexOf("#")==-1){
  location.href="#/";
}

paceOptions = {
  elements: false,
  restartOnRequestAfter: false
}

var progtonode=angular.module('progtonode',['ngSanitize','rzModule','ui.router']);

progtonode.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {        
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl : 'graph-view.html',
                controller  : 'mainController'
            })
            .state('info', {
                url: '/info',
                templateUrl : 'info.html',
                controller : 'infoController'
            })

});

progtonode.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});


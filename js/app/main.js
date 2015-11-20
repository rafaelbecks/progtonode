/*
Angular main module of the app, the directives are written here too.
Author: Rafael Becerra
Date: 19/11/2015
*/

if(document.URL.indexOf("#")==-1){
  location.href="#/";
}

var progtonode=angular.module('progtonode',['ngSanitize']);

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
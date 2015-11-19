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
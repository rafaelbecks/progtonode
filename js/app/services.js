/*
Angular services to connect to Discogs API via jsonp
Author: Rafael Becerra
Date: 19/11/2015
*/

progtonode.factory("services", ['$http', function($http) {
	 var obj = {};
	 var serviceBase="https://api.discogs.com/";
	 var key="DzeLDibbNpzoWAoECGFq";
	 var secret="WXVJZboStFcLCtZgReNwceReAuBBVTPu";
	 var callback="?callback=JSON_CALLBACK";

	  obj.getArtistInfo=function(artist_id){
	  	return $http.jsonp(serviceBase+"artists/"+artist_id+callback).success(function(data){
	 			console.log("OK");	
	      });
	 	};

	  obj.searchMusic=function(keyword){
	  	return $http.jsonp(serviceBase+"database/search?q="+keyword+"&key="+key+"&secret="+secret+"&callback=JSON_CALLBACK").success(function(data){
	 			console.log("OK");	
	      });	  	
	  }

	  obj.genericService=function(url){
	  		return $http.jsonp(url+callback).success(function(data){
	 			console.log("OK");	
	      });
	  }


	return obj;
}]);

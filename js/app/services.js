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
	  	return $http.jsonp(serviceBase+"artists/"+artist_id+callback+"&key="+key+"&secret="+secret).success(function(data){
	 			console.log("OK");	
	      });
	 	};

	  obj.searchMusic=function(keyword){
	  	return $http.jsonp(serviceBase+"database/search?q="+keyword+"&type=artist&key="+key+"&secret="+secret+"&callback=JSON_CALLBACK").success(function(data){
	 			console.log("OK");	
	      });	  	
	  }

	  obj.genericService=function(url){
	  		return $http.jsonp(url+callback+"&key="+key+"&secret="+secret).success(function(data){
	 			console.log("OK");	
	      });
	  }

	  obj.youtubeService=function(q){
	  	return $http.get("https://www.googleapis.com/youtube/v3/search?part=id%2Csnippet&q="+q+"&type=playlist&key=AIzaSyCLY3rJCKgk2OygEKE2f4ZiGdArRF_dZDE").success(function(data){
	  		console.log("OK Youtube");
	  	});
	  }

	return obj;
}]);

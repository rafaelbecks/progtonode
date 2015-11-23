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

/** Motherfucker servicio
	  obj.getGraph=function(name,groups,level){
	  	return new Promise(function(resolve,reject){
		 graph={
		  "nodes":[],
		  "links":[]
	 	 };	  	
	  	graph.nodes.push({"name":name,"group":1});
		for(var i=0;i<groups.length; i++){
			if(groups[i].active)
				graph.nodes.push({"name":groups[i].name,"group":1});
			else
				graph.nodes.push({"name":groups[i].name,"group":2});
			//	graph.links.push({"source":0,"target":i+1,"value":1});
		obj.genericService(groups[i].resource_url).then(function(data){
			//console.log(data.data.data);
			console.log(data.data.data.groups);
			if(data.data.data.groups!=undefined){
				console.log("ENTRA AQUI EN GRUPOS")
				level2=data.data.data.groups;
			}
			console.log(data.data.data.members);
			if(data.data.data.members!=undefined){
				console.log("ENTRA AQUI EN MIEMBROS")
				level2=data.data.data.members;
			}

			for(var j=0;j<level2.length; j++){
//			console.log(level2[j].name);
					graph.nodes.push({"name":level2[j].name,"group":2});
				}
				if(i==groups.length && j==level2.length){
					alert("a");
				  	resolve(graph);
				}
		});
		}
	  	});
	  }

*/

	return obj;
}]);

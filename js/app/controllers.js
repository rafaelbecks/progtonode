/*
Main controller of the app
Author: Rafael Becerra
Date: 19/11/2015
*/

progtonode.controller('mainController', function($scope ,$http, services){
	$scope.searching=false;
	$scope.searchArtist=function(keyword){
	 graph={
	  "nodes":[],
	  "links":[]
 	 };
	$(".main-banner").addClass("show-results"); 
	location.href="#"+keyword;
	$scope.searching=true;
	services.searchMusic(keyword).then(function(data){
		$scope.searching=false;
		$scope.searchIsDone=true;
		$scope.results=data.data.data.results;
		//result=true_data.results[0].id;
		//Setting thumb image and getting artist info from API
//		showArtistData(result);
	});	
	};

	$scope.showArtistData=function(id,thumb){
	 graph={
	  "nodes":[],
	  "links":[]
 	 };
	$scope.img_artist=thumb;
 	 //jQuery way to animate scroll to results, must find angular way
	$("html, body").animate({ scrollTop: $('#results').offset().top }, 1000);
	services.getArtistInfo(id).then(function(data){
		$scope.artistBase=data.data.data;
		//Build graph in case artist is musician
		if($scope.artistBase.groups!=undefined)
			buildGraph($scope.artistBase.name,$scope.artistBase.groups,0);
		//Build graph in case artist is band/project
		if($scope.artistBase.members!=undefined)
			buildGraph($scope.artistBase.name,$scope.artistBase.members,0);				
		buildProfileText($scope.artistBase.profile);
	});
	};


	buildGraph=function(name,groups,level){
		graph.nodes.push({"name":name,"group":1});
		for(var i=0;i<groups.length; i++){
			if(groups[i].active)
				graph.nodes.push({"name":groups[i].name,"group":1});
			else
				graph.nodes.push({"name":groups[i].name,"group":2});
			graph.links.push({"source":0,"target":i+1,"value":1});
		}
		console.log(graph);
		drawGraph(graph);
	};

	buildProfileText=function(bio){
		if(bio.indexOf("[a")>0){
			first_reference=bio.substring(bio.indexOf("[a")+2,bio.indexOf("]"));
			services.getArtistInfo(first_reference).then(function(data){
				bio=bio.replace("[a"+first_reference+"]",'<a href="#">'+data.data.data.name+"</a>");
				$scope.artistBase.profile=bio.substring(0,bio.indexOf("[b]"));
			});
		}
	};
});


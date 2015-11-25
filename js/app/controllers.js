/*
Main controller of the app
Author: Rafael Becerra
Date: 19/11/2015
*/

progtonode.controller('mainController', function($scope ,$http, services,$sce){
	
	$scope.$watch("percentaje", function (newValue, oldValue ) {
    if(newValue>=80){
    	setTimeout(function(){
    		$scope.buildG();
    	},1500);
    }
});

	$scope.percentaje=0;
	$scope.searching=false;
	$scope.tracking=[];
	$scope.searchArtist=function(keyword){
	 graph={
	  "nodes":[],
	  "links":[]
 	 };
 	 $scope.tracking=[];
	$(".main-banner").addClass("show-results"); 
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
	if(id==undefined){
		swal("Sorry", "The artist doesn't exists", "error");
	}else{
	$scope.loading = true;
	location.href="#id="+id;
		 graph={
		  "nodes":[],
		  "links":[]
	 	 };
	 	 if(thumb!=undefined)
			$scope.img_artist=thumb;
	 	 //jQuery way to animate scroll to results, must find angular way
		$("html, body").animate({ scrollTop: $('#results').offset().top -20}, 1000);
		$("graph").hide();
		$(".loader").show();
		services.getArtistInfo(id).then(function(data){
			$scope.artistBase=data.data.data;
			$scope.tracking.push({id:id,name:$scope.artistBase.name});
			if($scope.artistBase.images!=undefined)
				$scope.img_artist=$scope.artistBase.images[0].uri150;
			//Build graph in case artist is musician
			if($scope.artistBase.groups!=undefined){
				//buildGraph($scope.artistBase.name,$scope.artistBase.groups,0);
				buildGraph2nd($scope.artistBase.name,$scope.artistBase.groups,0);
			}
			//Build graph in case artist is band/project
			if($scope.artistBase.members!=undefined){
				//buildGraph($scope.artistBase.name,$scope.artistBase.members,0);								
				buildGraph2nd($scope.artistBase.name,$scope.artistBase.members,0);				
			}
			buildProfileText($scope.artistBase.profile);
			//Fetch youtube data
			$scope.youtubePlaylist($scope.artistBase.name);
		});		
	}
	};

	$scope.refreshPlayer=function(playlist){
		$scope.playlist_id_current=playlist;
	};


	$scope.youtubePlaylist=function(q){
		services.youtubeService(q).then(function(data){
				$scope.playlist_id="https://www.youtube.com/embed/videoseries?list="+data.data.items[0].id.playlistId;
				if($scope.playlist_id_current==undefined)
					$scope.refreshPlayer($scope.playlist_id);
		});
	}

	buildGraph=function(name,groups,level){
		graph.nodes.push({"name":name,"group":1});
		for(var i=0;i<groups.length; i++){
			if(groups[i].active)
				graph.nodes.push({"name":groups[i].name,"group":1,"id_discogs":groups[i].id});
			else
				graph.nodes.push({"name":groups[i].name,"group":2,"id_discogs":groups[i].id});
				//Links
				graph.links.push({"source":0,"target":i+1,"value":1});
		}
	};


	buildGraph2nd=function(name,groups,level){
		found=false;
		$scope.percentaje=0;
		$scope.porc=100/groups.length;
		graph.nodes.push({"name":name,"group":1});
		for(var i=0;i<groups.length; i++){
			if(groups[i].active)
				graph.nodes.push({"name":groups[i].name,"group":1,"id_discogs":groups[i].id});
			else
				graph.nodes.push({"name":groups[i].name,"group":2,"id_discogs":groups[i].id});
				//Links
				graph.links.push({"source":0,"target":i+1,"value":1});
			services.genericService(groups[i].resource_url).then(function(data){
			$scope.percentaje=$scope.percentaje+$scope.porc;
				if(i==groups.length){
					console.log("Ultima vuelta")
				}
				indexOrigin=0;
				if(data.data.data.members!=undefined)
					groupsOfNodes=data.data.data.members;
				if(data.data.data.groups!=undefined)
					groupsOfNodes=data.data.data.groups;
					for(var j=0;j<groupsOfNodes.length;j++){
						searchResults=[];
						for(k=0;k<graph.nodes.length;k++){
							//Delete repetitions and find origin
							//console.log(groupsOfNodes[j].name+"="+graph.nodes[k].name);
							if(groupsOfNodes[j].name==graph.nodes[k].name)
								searchResults.push(true);
							else
								searchResults.push(false);
							console.log(data.data.data.name+"="+graph.nodes[k].name);
							if(data.data.data.name==graph.nodes[k].name){
								indexOrigin=k;
								console.log(indexOrigin);
							}
						}							
						if(searchResults.indexOf(true)==-1){
						if(groupsOfNodes[j].name!=graph.nodes[0].name){	
							if(groupsOfNodes[j].active)
								graph.nodes.push({"name":groupsOfNodes[j].name,"group":1,"id_discogs":groupsOfNodes[j].id});
							else
								graph.nodes.push({"name":groupsOfNodes[j].name,"group":2,"id_discogs":groupsOfNodes[j].id});							
						}
							graph.links.push({"source":indexOrigin,"target":graph.nodes.length-1,"value":1});

							console.log(i+" AND LENGTH="+groups.length);
							console.log(j+" AND LENGTH="+groupsOfNodes.length);
							console.log(graph);							
						}
					}
			});
		}
		};

	$scope.buildG=function(){
		$(".loader").hide();
		$("graph").show();
		drawGraph(graph);
	}

	buildProfileText=function(bio){
		if(bio.indexOf("[a")>0){
			first_reference=bio.substring(bio.indexOf("[a")+2,bio.indexOf("]"));
			services.getArtistInfo(first_reference).then(function(data){
				bio=bio.replace("[a"+first_reference+"]",'<a href="#">'+data.data.data.name+"</a>");
				$scope.artistBase.profile=bio.substring(0,bio.indexOf("[b]"));
			});
		}
	};

	if(document.URL.indexOf("id")>0){
		id_search=document.URL.substring(document.URL.indexOf("id")+3,document.URL.length);
		$scope.showArtistData(id_search,undefined);
	}

	$scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  $scope.emptyTrack=function(){
  	 $scope.tracking=[];
  }
});


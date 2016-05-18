/*
Main controller of the app
Author: Rafael Becerra
Date: 19/11/2015
*/

progtonode.controller('mainController', function($scope ,$http, services,$sce,$stateParams,$state){

    particlesJS.load('particles-js', 'particles.json', function() {
    });

    particlesJS.load('particles-loading',"particles-loading.json",function(){
		if(document.URL.indexOf("id")==-1){   
		  $(".loader").hide();
		 }
    });

    $("#searchIcon").hide();
    $("#proglogoIcon").show();

    $('[data-toggle="tooltip"]').tooltip(); 
     $( ".controls,graph" ).draggable({ scroll: false});

   $('.toggle').click(function(e){
      e.preventDefault(); // The flicker is a codepen thing
      $(this).toggleClass('toggle-on');
    });


	$scope.$watch("percentaje", function (newValue, oldValue ) {
    if(newValue>=80){
    	$scope.showManualConstruction=false;
    	setTimeout(function(){
    		$scope.buildG();
    	},1500);
    }
	});

	emptyGraph=function(){
		 $scope.graph={
		  "nodes":[],
		  "links":[]
	 	 };
	};
	$scope.showManualConstruction=false;
	$scope.percentaje=0;
	$scope.searching=false;
	$scope.tracking=[];
	$scope.expanded=false;
	$scope.afterSearch=false;
	$scope.searchType = "artist"
	$scope.zoomSlider = {
	  value: 0,
	  options: {
	    floor: 1,
	    ceil: 4,
   	  hideLimitLabels:true,
	  onChange:function(){
	  	 $("graph").animate({ 'zoom': $scope.zoomSlider.value }, 100);
	  }
	  }
	};

	$scope.setSearchMode = function(current)
	{
		$scope.searchType = (current=="artist") ? "master" : "artist";
	}


	$scope.searchArtist=function(keyword){
	 $scope.graph={
	  "nodes":[],
	  "links":[]
 	 };
 	 $scope.tracking=[];
	$(".main-banner").addClass("show-results"); 
	$scope.searching=true;
	services.searchMusic(keyword,$scope.searchType).then(function(data){
		$scope.searching=false;
		$scope.searchIsDone=true;
		$scope.results=data.data.data.results;
	});	
	};

	$scope.showArtistData=function(id,thumb){
	$scope.percentaje=0;
  	location.href="#/?id="+id;
	if(id==undefined){
		swal("Sorry", "The artist doesn't exists", "error");
	}else{
	$scope.afterSearch=true;
	$scope.loading = true;
		 $scope.graph={
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
			if($scope.artistBase.images!=undefined)
				$scope.img_artist=$scope.artistBase.images[0].uri150;
		if($scope.artistBase.groups==undefined && $scope.artistBase.members==undefined)
			swal({title:"Sorry",
							text:"We don't have enough data to draw a graph, try another search",
							type:"warning",confirmButtonText:"Try another search"}, function(){
								$("html, body").animate({ scrollTop: $('body').offset().top}, 1000);
						});
		else{
			$scope.tracking.push({id:id,name:$scope.artistBase.name});

			//Build graph in case artist is musician
			if($scope.artistBase.groups!=undefined){
				if($scope.expanded)
					buildGraph2nd($scope.artistBase.name,$scope.artistBase.groups,$scope.artistBase.id);
				else
					buildGraph($scope.artistBase.name,$scope.artistBase.groups,$scope.artistBase.id);
			}
			//Build graph in case artist is band/project
			if($scope.artistBase.members!=undefined){
				if($scope.expanded)
					buildGraph2nd($scope.artistBase.name,$scope.artistBase.members,$scope.artistBase.id);				
				else
					buildGraph($scope.artistBase.name,$scope.artistBase.members,$scope.artistBase.id);				
			}
			buildProfileText($scope.artistBase.profile);
			//Fetch youtube data
			$scope.youtubePlaylist($scope.artistBase.name);			
		}

		});		
	}
	};

	$scope.refreshPlayer=function(playlist){
		$scope.playlist_id_current=playlist;
	};

	$scope.toggleInfo=function(){
		$(".white-info").fadeToggle();
	}

	$scope.youtubePlaylist=function(q){
		services.youtubeService(q).then(function(data){
				$scope.playlist_id="https://www.youtube.com/embed/videoseries?list="+data.data.items[0].id.playlistId;
				if($scope.playlist_id_current==undefined)
					$scope.refreshPlayer($scope.playlist_id);
		});
	}


	$scope.getReleases=function(url,name){
		services.releaseService(url,100).then(function(data){
//			emptyGraph();
//			graph.nodes.push({"name":name,"group":1});
			$scope.albums=[];
			albums=(data.data.data.releases);
			for(var i=0;i<albums.length;i++){
				if(albums[i].type=="master"){
					$scope.albums.push(albums[i]);
				}
			}
		});
	};

	buildGraph=function(name,groups,mainId){
		$scope.graph.nodes.push({"name":name,"group":1,"id_discogs":mainId});
		for(var i=0;i<groups.length; i++){
			if(groups[i].active)
				$scope.graph.nodes.push({"name":groups[i].name,"group":1,"id_discogs":groups[i].id});
			else
				$scope.graph.nodes.push({"name":groups[i].name,"group":2,"id_discogs":groups[i].id});
				//Links
				$scope.graph.links.push({"source":0,"target":i+1,"value":1});
		}
		$scope.buildG();
	};


	buildGraph2nd=function(name,groups,mainId){
		found=false;
		relations=[]; // Array to save the relationships of repetitions
		$scope.percentaje=0;
		$scope.porc=100/groups.length;
		$scope.graph.nodes.push({"name":name,"group":1,"id_discogs":mainId});
		for(var i=0;i<groups.length; i++){
			if(groups[i].active)
				$scope.graph.nodes.push({"name":groups[i].name,"group":1,"id_discogs":groups[i].id});
			else
				$scope.graph.nodes.push({"name":groups[i].name,"group":2,"id_discogs":groups[i].id});
				//Links
				$scope.graph.links.push({"source":0,"target":i+1,"value":1});
			services.genericService(groups[i].resource_url).then(function(data){
			$scope.percentaje=$scope.percentaje+$scope.porc;
				indexOrigin=0;
				if(data.data.data.members!=undefined)
					groupsOfNodes=data.data.data.members;
				if(data.data.data.groups!=undefined)
					groupsOfNodes=data.data.data.groups;
					for(var j=0;j<groupsOfNodes.length;j++){
						searchResults=[]; //Array to determinate if node is already in graph
						for(k=0;k<$scope.graph.nodes.length;k++){
							//Delete repetitions and find origin
							//console.log(groupsOfNodes[j].name+"="+$scope.graph.nodes[k].name);
							if(groupsOfNodes[j].name==$scope.graph.nodes[k].name){
								searchResults.push(true);
								if(relations.indexOf(k)==-1)
									relations.push(k);
							}
							else
								searchResults.push(false);
							if(data.data.data.name==$scope.graph.nodes[k].name){
								indexOrigin=k;
							}
						}							
						if(searchResults.indexOf(true)==-1){
						if(groupsOfNodes[j].name!=$scope.graph.nodes[0].name){	
							if(groupsOfNodes[j].active)
								$scope.graph.nodes.push({"name":groupsOfNodes[j].name,"group":1,"id_discogs":groupsOfNodes[j].id});
							else
								$scope.graph.nodes.push({"name":groupsOfNodes[j].name,"group":2,"id_discogs":groupsOfNodes[j].id});							
						}
							$scope.graph.links.push({"source":indexOrigin,"target":$scope.graph.nodes.length-1,"value":1});
							for(l=0;l<relations.length;l++){
								$scope.graph.links.push({"source":indexOrigin,"target":relations[l],"value":1});														
							}
						}
					}
			});
		}
		};


	$scope.build2nd=function(artistBase){
		emptyGraph();
		if($scope.expanded){
			$("graph").hide();
			$(".loader").show();
			if(artistBase.members!=undefined)
				buildGraph2nd(artistBase.name,artistBase.members,0);
			if(artistBase.groups!=undefined)
				buildGraph2nd(artistBase.name,artistBase.groups,0);
		}
		else{
			if(artistBase.members!=undefined)
				buildGraph(artistBase.name,artistBase.members,0);
			if(artistBase.groups!=undefined)
				buildGraph(artistBase.name,artistBase.groups,0);
		}
	}

	$scope.buildG=function(){
		$(".loader").hide();
		$("graph").show();
		drawGraph($scope.graph);
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

	$scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  $scope.emptyTrack=function(id){
  	 $scope.tracking=[];
  }


	if(document.URL.indexOf("id")>0){
		id_search=document.URL.substring(document.URL.indexOf("id")+3,document.URL.length);
		$scope.showArtistData(id_search,undefined);
		$("html, body").animate({ scrollTop: $('#results').offset().top -20}, 1000);
	}


 $scope.showReleaseInfo = function(url,thumb)
 {
 	 if(thumb!=undefined)
		$scope.img_artist=thumb;
	$("html, body").animate({ scrollTop: $('#results').offset().top -20}, 1000);
	$("graph").hide();
	$(".loader").show();
 	services.genericService(url).then(function(data){
 		$scope.masterInfo = data.data.data;
 		services.getMasterVersions($scope.masterInfo.id).then(function(data)
 		{
 			firstVersionURL = data.data.data.versions[0].resource_url;
 			services.genericService(firstVersionURL).then(function(data){
 				releaseData = data.data.data;
 				musicians = getArtistsByTracks(releaseData);
 				console.log(musicians);
				buildGraph(releaseData.title,musicians,releaseData.id);
 			});
 		// 	$scope.mainRealeaseInfo = data.data.data;

			// buildGraph($scope.mainRealeaseInfo.title,$scope.mainRealeaseInfo.extraartists,$scope.mainRealeaseInfo.id);

 		});
 	});
 }
  
});


getArtistsByTracks = function(release)
{
	musicians = [];
	musiciansIds = [];

	// Créditos generales del album
	
	for(var h in release.extraartists){
		if(musiciansIds.indexOf(release.extraartists[h].id)==-1){
			musicians.push(release.extraartists[h]);			
			musiciansIds.push(release.extraartists[h].id);
		}
	}

	// Créditos por track
	for(var i=0;i<release.tracklist.length;i++)
	{
		for(var j in release.tracklist[i].extraartists){
			if(musiciansIds.indexOf(release.tracklist[i].extraartists[j].id)==-1){
				musicians.push(release.tracklist[i].extraartists[j]);			
				musiciansIds.push(release.tracklist[i].extraartists[j].id);
			}
		}
	}
	return musicians;
}


progtonode.controller("infoController",function($scope, $state){
    $("#searchIcon").show();
    $("#proglogoIcon").hide();
  particlesJS.load('particles-js', 'particles.json', function() {
    });

});
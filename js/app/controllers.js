/*
Main controller of the app
Author: Rafael Becerra
Date: 19/11/2015
*/

progtonode.controller('mainController', function($scope ,$http, services,$sce,$stateParams,$state){

    visuals();

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
		mixpanel.track("change search mode", current);
		$scope.searchType = (current=="artist") ? "master" : "artist";
	}


	$scope.searchArtist=function(keyword){

	mixpanel.track("search artist", {keyword: keyword});

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

	if(id==undefined){
		swal("Sorry", "The artist doesn't exists", "error");
	}else{
	mixpanel.track("click artist", {id: id, thumb: thumb});
	$scope.afterSearch=true;
	$scope.loading = true;
		 $scope.graph={
		  "nodes":[],
		  "links":[]
	 	 };
	 	 if(thumb!=undefined)
			$scope.img_artist=thumb;

		location.href="#/?artist="+id;

		$("html, body").animate({ scrollTop: $('#results').offset().top -20}, 1000);

		$scope.searchType = "artist";

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
			console.log($scope.albums);
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
		mixpanel.track("1st level graph", {graph: $scope.graph});
		$scope.buildG();
	};


	buildGraph2nd=function(name,groups,mainId){
		found=false;
		relations=[]; // Array to save the relationships of repetitions
		mixpanel.track("2nd level graph begin", {id: mainId, name: name});
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
				if(groupsOfNodes)
				{
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
				}
			});
		}
		};


	$scope.build2nd=function(artistBase,type){
		artistBase = artistBase || $scope.masterInfo;
		emptyGraph();		
		$("graph").hide();
		$(".loader").show();
		console.log(type);
		if($scope.expanded){
			if(type=="artist"){	
				console.log("aqui");
				if(artistBase.members!=undefined)
					buildGraph2nd(artistBase.name,artistBase.members,0);
				if(artistBase.groups!=undefined)
					buildGraph2nd(artistBase.name,artistBase.groups,0);				
			}else
			{

				buildGraph2nd(artistBase.title,artistBase.musicians,0);
			}
		}
		else{
			if(type=="artist"){	
				if(artistBase.members!=undefined)
					buildGraph(artistBase.name,artistBase.members,0);
				if(artistBase.groups!=undefined)
					buildGraph(artistBase.name,artistBase.groups,0);
			}else
			{
				buildGraph2nd(artistBase.title,artistBase.musicians,0);
			}
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

 $scope.showReleaseInfo = function(releaseID,thumb)
 {
 	url= "https://api.discogs.com/masters/"+releaseID;
	emptyGraph(); 
 	 if(thumb!=undefined)
		$scope.img_artist=thumb;
	$("html, body").animate({ scrollTop: $('#results').offset().top -20}, 1000);
	$("graph").hide();
	$(".loader").show();
	$scope.searchType = "master";
 	services.genericService(url).then(function(data){
 		$scope.masterInfo = data.data.data;
 		location.href="#/?album="+$scope.masterInfo.id;
 		$scope.img_artist=$scope.masterInfo.images[0].uri150;
 		services.getMasterVersions($scope.masterInfo.id).then(function(data)
 		{
 			firstVersionURL = data.data.data.versions[0].resource_url;
 			services.genericService(firstVersionURL).then(function(data){
 				releaseData = data.data.data;
 				musicians = getArtistsByTracks(releaseData);
 				$scope.masterInfo.musicians = musicians;
				buildGraph(releaseData.title,musicians,releaseData.id);
				$scope.afterSearch = true;
 			});
 		// 	$scope.mainRealeaseInfo = data.data.data;

			// buildGraph($scope.mainRealeaseInfo.title,$scope.mainRealeaseInfo.extraartists,$scope.mainRealeaseInfo.id);

 		});
 	});
 }
  

	$scope.$watch("percentaje", function (newValue, oldValue ) {
    if(newValue>=80){
    	$scope.showManualConstruction=false;
    	setTimeout(function(){
			mixpanel.track("showed graph", {graph : $scope.graph});
    		$scope.buildG();
    	},1500);
    }
	});

	$scope.$watch("afterSearch",function(newValue){
		if(newValue == true)
		{
			$("body").removeClass('noScroll');
		}
	});



	if(document.URL.indexOf("artist")>0){
		id_search=document.URL.substring(document.URL.indexOf("artist")+7,document.URL.length);
		$scope.showArtistData(id_search,undefined);
	}

	if(document.URL.indexOf("album")>0){
		id_search=document.URL.substring(document.URL.indexOf("album")+6,document.URL.length);
		$scope.searchType = 'master'; $("#switch").addClass("toggle-on");
		$scope.showReleaseInfo(id_search,undefined);
		$("html, body").animate({ scrollTop: $('#results').offset().top -20}, 1000);
	}

});




getArtistsByTracks = function(release)
{
	musicians = [];
	musiciansIds = [];

	// Créditos generales del album
	
	for(var h in release.extraartists){
		if(musiciansIds.indexOf(release.extraartists[h].id)==-1 && !isException(release.extraartists[h].role)){
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

  scrollTo = function(element, margin)
  {
		$("html, body").animate({ scrollTop: $(element).offset().top -margin}, 1000);
  }



Pace.on("done", function()
	{
		if(document.URL.indexOf("album")>0 || document.URL.indexOf("artist")>0)
			$("html, body").scrollTop($('#results').offset().top -20);
	});


progtonode.controller("infoController",function($scope, $state){
    $("#searchIcon").show();
    $("#proglogoIcon").hide();
    $("#searchIconBack").hide();
    $("body").removeClass('noScroll');
  particlesJS.load('particles-js', 'particles.json', function() {
    });

  $scope.scrollTo = function(element, margin)
  {
		$("html, body").animate({ scrollTop: $(element).offset().top -margin}, 1000);
  }

});
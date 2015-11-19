progtonode.controller('mainController', function($scope ,$http, services){

	$scope.searchArtist=function(keyword){

 graph={
  "nodes":[],
  "links":[]
};
		$("html, body").animate({ scrollTop: $('#results').offset().top }, 1000);
		location.href="#"+keyword;
		services.searchMusic(keyword).then(function(data){
			true_data=data.data.data;
			result=true_data.results[0].id;
			$scope.img_artist=true_data.results[0].thumb;
			services.getArtistInfo(result).then(function(data){
				
				$scope.artistBase=data.data.data;
				
				if($scope.artistBase.groups!=undefined)
					buildGraph($scope.artistBase.name,$scope.artistBase.groups);
				if($scope.artistBase.members!=undefined)
					buildGraph($scope.artistBase.name,$scope.artistBase.members);				

				var bio = $scope.artistBase.profile;
				if(bio.indexOf("[a")>0){
					first_reference=bio.substring(bio.indexOf("[a")+2,bio.indexOf("]"));
					services.getArtistInfo(first_reference).then(function(data){
						bio=bio.replace("[a"+first_reference+"]",'<a href="#">'+data.data.data.name+"</a>");
						$scope.artistBase.profile=bio.substring(0,bio.indexOf("[b]"));
					});
				}
			});
		});

	
	};


	buildGraph=function(name,groups){
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
	}
});


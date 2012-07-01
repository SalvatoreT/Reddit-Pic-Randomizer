
/**
 * @fileoverview This is used to call the reddit api and manage the 
 * subreddits being used. It uses jQuery.
 * @author sal.testa@gmail.com Salvatore Testa
 */

/* mapping of subreddits to images they contain */ 
var subreddits = new Array();

$(document).ready(function() {
	var default_categories = ['aww','earthporn','HumanPorn'];
	$.each(default_categories, function(index,category){
		addSubreddit(category);
		updateImageDictionary(category);
	});
});

$("#add-subreddit").click(function() {
	var subreddit = $("#input-subreddit").val();
	if(subreddit != '') {
		updateImageDictionary(subreddit);
		$("#input-subreddit").val('');
	}
});


function addSubredditContainer(category) {
	var subredditContainer = $('<div/>',{ class:"well" });
	var rowOfComponents = $('<div/>',{ class:"row" }).appendTo(subredditContainer);
	var title =  $('<h3/>',{ 
		class:"subreddittag pull-left",
		text:category
		}).appendTo(rowOfComponents);
	var slider =  $('<div/>',{ 
		class:"slider",
		id:category,
		}).appendTo(rowOfComponents);
	var button =  $('<div/>',{ 
		class:"btn btn-danger pull-right",
		}).appendTo(rowOfComponents).append($('<dev/>',{class:'icon-remove icon-white'}));

	subredditContainer.hide();
	$('#subreddit-container-list').prepend(subredditContainer);
	subredditContainer.show(1000);
	
}

/**
* Call the Reddit API to get images for a given subreddit
* @param {string} category Subreddit we are calling
*/
function updateImageDictionary(category) {
	$.ajax({
	    url:'/api/image_lists.php',
	    type:'POST',
	    data: {
		    'subreddit':category
	    }
	}).done(function(data){
		var response = JSON.parse(data);
		addImages(category, response[category]);
		addSubredditContainer(category);
	});
}

/**
* Get a weighted random subreddit
* @return {string} name of subreddit
*/
function randomSubreddit() {
	var number = Math.random();
	var lower_bound = 0;
	for(i in subreddits) {
		var weight = subreddits[i]['weight'];
		if ((weight != 0) & (number <= (lower_bound + weight))) {
			return i;
		}
		lower_bound += weight;
	}
	return null;
}

/**
* Get a normal-random image from a category
* @param {string} category Name of subreddit
* @return {string} url of the image
*/
function randomImageUrl(category) {
	if(!inSubreddits(category)) return '';
	if(subreddits[category]['images'] == null) return '';
	var urls = subreddits[category]['images'];
	if(urls.length == 0) return '';
	var index = Math.floor(Math.random() * urls.length);
	return urls[index];
}

/**
* Get a normal-random image from a category
* @param {string} category Name of subreddit
* @return {boolean} Whether or not this category exist already
*/
function inSubreddits(category) {
	return (subreddits[category] != null);
}

/**
* Create new subreddit and give it a weigth of 1/(number of subreddits)
* @param {string} category Subreddit we are adding/refreshing
*/
function addSubreddit(category) {
	subreddits[category] = new Array();
	normalizeWeightAround(category,1/countSubreddits());
}

/**
* Remove given subreddit
* @param {string} category Subreddit we are deleting
*/
function removeSubreddit(category) {
	if(!inSubreddits(category)) return;
	normalizeWeightAround(category, 0);
	delete subreddits[category];
}

/**
* Add a list of images to the given subreddit
* @param {string} category Subreddit we giving images
* @param {Array.<string>} images Picture urls we are adding
*/
function addImages(category, images) {
	if(!inSubreddits(category)) return;
	subreddits[category]['images'] = new Array();
	subreddits[category]['images'] = images;
}

/**
* Adjust the other subreddits' weights around the weight we want
*	to set for the selected one 
* @param {string} category Subreddit thats getting a new weight
* @param {number} weight New weight from [0,1] for given subreddit 
*/
function normalizeWeightAround(category, weight) {
	if(!inSubreddits(category)) return;
	subreddits[category]['weight'] = weight;
	var remaining = 1 - weight;
	var total = 0;
	for(var i in subreddits) {
		if(i != category) {
			total += subreddits[i]['weight'];
		}
	}
	if(total != 0) {
		for(var i in subreddits) {
			if(i != category) {
				var percent = subreddits[i]['weight']/total;
				subreddits[i]['weight'] = Math.max(percent * remaining,.00001);
			}
		}
	}
}

/**
* Get the total number of subreddits
* @return {number} count of subreddits
*/
function countSubreddits() {
	var count = 0;
	for(var i in subreddits) count++;
	return count;
}

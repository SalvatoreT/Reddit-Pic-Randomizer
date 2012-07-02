
/**
 * @fileoverview This is used to call the reddit api and manage the subreddits 
 * being used. It uses jQuery but everything does so you shouldn't be surprised.
 * @author sal.testa@gmail.com Salvatore Testa
 */

/* mapping of subreddits to images they contain */ 
var subreddits = new Array();

/* Wait for the document to load */
$(document).ready(function() {
	/* Properly format the containers based on the window dimensions */
	$('#reddit-image-container').css('height',($(window).height()-78)+'px');
	$('#redditap-container').css('min-width',($(window).width()-40)+'px');
	$('#input-subreddit').css('width',($('#input-well').width()-63)+'px');	
	/* Preload the page with these default catagories */
	var default_categories = ['aww','gifs','pics'];
	$.each(default_categories, function(index,category){
		addSubreddit(category);
		updateImageDictionary(category);
	});
	/* Allow for enter key to count as clicking/tapping the reddit image */
	$(document).keypress(function(event) {
		if(event.target.tagName == 'BODY' && event.keyCode == 13) {
			$('#reddit-image-container').click();
		}
	});
});

/* Listener for the add subreddit button */
$("#add-subreddit").click(function() {
	/* Don't allow duplicates */
	var subreddit = $("#input-subreddit").val().toLowerCase();
	/* Clear the input field */
	$("#input-subreddit").val('');
	if(subreddit != '' & !inSubreddits(subreddit)) {
		updateImageDictionary(subreddit);
	}
});

/* Pressing enter in the input field triggers the add subreddit button */
$("#input-subreddit").change(function(){$("#add-subreddit").click();});

/* Listen for the user to click/tap the reddit image (container) */
$('#reddit-image-container').click(function() {
	var randSubreddit = randomSubreddit();
	var randUrl = randomImageUrl(randSubreddit);
	if (randUrl != '') {
		$('#random-image').css('background-image','url('+randUrl+')');
	} else {
		$('#random-image').css('background-image','url(./tap.gif)');
	}
});

/**
* Generate the appropriate html objects for the subreddit 
* @param {string} category Container's designated subreddit
*/
function addSubredditContainer(category) {
	var subredditContainer = $('<div/>',{ 
		class:"well subreddit-row"})
		.css('height','20px');

		var deleteButton =  $('<div/>',{ 
			class:"btn btn-danger remove-btn"})
			.appendTo(subredditContainer)
			.append($('<dev/>',{class:'icon-remove icon-white'}));

		var title =  $('<div/>',{ 
			class:"subreddit-tag",
			text:category})
			.appendTo(subredditContainer);

		var frequencyButtonContainer = $('<div/>',{
			class:"btn-group"})
			.attr('data-toggle','buttons-radio')
			.appendTo(subredditContainer);

			var low = $('<button/>',{
				class:"btn btn-small",
				text:'Low'
				})
				.click(function() {
					setWeight(category,1);
				})
				.appendTo(frequencyButtonContainer);

			var med = $('<button/>',{
				class:"btn btn-small",
				text:'Med'
				})
				.click(function() {
					setWeight(category,2);
				})
				.appendTo(frequencyButtonContainer);

			var high = $('<button/>',{
				class:"btn btn-small",
				text:'High'
				})
				.click(function() {
					setWeight(category,4);
				})
				.appendTo(frequencyButtonContainer);

	/* By default, start on medium */
	med.click();
	med.button('toggle');
	/* Add the subreddit container to the list of containers */
	subredditContainer.hide();
	$('#subreddit-container-list').prepend(subredditContainer);
	subredditContainer.slideDown("slow"); // Being fancy
	/* Listener for removing the container */
	deleteButton.click(function() {
		subredditContainer.hide();
		subredditContainer.remove();
		removeSubreddit(category);
	});
}

/**
* Call the Reddit API to get images for a given subreddit
* @param {string} category Subreddit we are calling
*/
function updateImageDictionary(category) {
	$.ajax({
	    url:'./image_lists.php',
	    type:'POST',
	    data: {
		    'subreddit':category
	    }
	}).done(function(data){
		var response = JSON.parse(data);
		addSubreddit(category);
		addImages(category, response[category]);
		if (countUrls(category) != 0) {
			addSubredditContainer(category);
		} else {
			removeSubreddit(category);
		}
	});
}

/**
* Get a weighted random subreddit
* @return {string} name of subreddit
*/
function randomSubreddit() {
	var number = Math.random() * weighSubreddits();
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
* Set/change the prevalence of a given subreddit
* @param {string} category Subreddit
* @param {string} weight Influence of subreddit
*/
function setWeight(category, weight) {
	subreddits[category]['weight'] = weight; 
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
* Get a normal-random image from a category
* @param {string} category Name of subreddit
* @return {string} url of the image
*/
function randomImageUrl(category) {
	if(!inSubreddits(category)) return '';
	if(subreddits[category]['images'] == null) return '';
	var urls = subreddits[category]['images'];
	if(urls.length == 0) return '';
	var index = Math.floor(Math.random() * countUrls(category));
	return urls[index];
}

/**
* Find how many images are associated with a subreddit
* @param {string} category Name of subreddit
* @return {number} count of image instances
*/
function countUrls(category) {
	if(!inSubreddits(category)) return 0;
	if(subreddits[category]['images'] == null) return 0;
	var urls = subreddits[category]['images'];
	return urls.length;
}

/**
* See if the subreddit is loaded
* @param {string} category Name of subreddit
* @return {boolean} Whether or not this category exist already
*/
function inSubreddits(category) {
	return (subreddits[category] != null);
}

/**
* Create new/reset a subreddit
* @param {string} category Subreddit we are adding/resetting
*/
function addSubreddit(category) {
	subreddits[category] = new Array();
}

/**
* Remove given subreddit
* @param {string} category Subreddit we are deleting
*/
function removeSubreddit(category) {
	if(!inSubreddits(category)) return;
	delete subreddits[category];
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

/**
* Get the total number of subreddits
* @return {number} count of subreddits
*/
function weighSubreddits() {
	var total = 0;
	for(var i in subreddits) {
		// console.log(i);
		total += subreddits[i]['weight'];
		// console.log(subreddits[i]['weight']);
	}
	return total;
}

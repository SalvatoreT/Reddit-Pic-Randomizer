<?php
/*
* This is the image retrieval api built on the Reddit API.
*/
$subreddit = $_POST["subreddit"];
$limit = isset($_POST["limit"]) ? $_POST["limit"] : 100;
$response = array();
/* Retrieve the data from reddit */
$content = json_decode(file_get_contents("http://www.reddit.com/r/".$subreddit.".json?limit=".$limit),true);
foreach($content['data']['children'] as $reddit_post) {
	$url = $reddit_post['data']['url']; 
	/* Only looking for imgur images */
	if(strstr($url, 'imgur.com') && !strstr($url, '/a/')) {
		$url_info = pathinfo($url);
		/* Make sure the file has an extension. */
		if(!isset($url_info['extension'])) {
			$url = $url.'.jpg';
		}
		/* Add this file to the list */
		$response[$subreddit][] = $url;
	}
}
/* Return the subreddit images */
echo json_encode($response);

?>
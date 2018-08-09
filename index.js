//youtube video api polling
// run every 5 minutes and insert video new videos into db
require('dotenv').config();

const firebase = require('./firebase');
const db = firebase.database;
var request = require('request-promise');

function videoConstructor(item){
    const {id, snippet} = item;
    const {videoId} = id;
    const {title, description, thumbnails, publishedAt } = snippet;
    const {high} = thumbnails;
    const {url} = high;
    const imageUrl = url;
    const youtubeVideoURLBase = 'https://www.youtube.com/watch?v=';
    const videoUrl = youtubeVideoURLBase + videoId

    return {
        videoId,
        title,
        description,
        imageUrl,
        videoUrl,
        publishedAt
    }
}

async function getChannelVideos(){
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
	let result;
	try {
		result = await request({
			url: `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`,
			method: "GET",
			json: true   // <--Very important!!!
	});
		return result;
	}
	catch (error) {
		return error;
	}
}

async function getVideosAndUpdateDB(){
    const value = await getChannelVideos();
    const {items} = value;
    items.forEach(function(item){
      sendVideoToDB(videoConstructor(item));
    })
}

function sendVideoToDB(video) {
  const dbBaseRef = db.ref(`KoreanUnnieVideos`);
  dbBaseRef.once('value', function(snapshot) {
    if (snapshot.hasChild(video.videoId)) {
      //video already exists
    } else{
      db
      .ref(`KoreanUnnieVideos/${video.videoId}`)
      .set(video);
      notifyUsers(video);
    }
  });

}

function notifyUsers(video) {
  console.log('new video', video);
}
getVideosAndUpdateDB();
setInterval(getVideosAndUpdateDB, 1000 * 60 * 6)

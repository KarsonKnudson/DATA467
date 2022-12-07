const { youtube } = require('scrape-youtube');
const { getColorFromURL } = require('color-thief-node');
var util = require('util');
var fs = require('graceful-fs');
var Sentiment = require('sentiment');
var hsv = require('rgb-hsv');
var ytdl = require('ytdl-core');

// Read search terms
var terms = fs.readFileSync('google-10000-english-usa-no-swears.txt').toString().split("\n");

const COOKIE = 'CONSENT=YES+US.en+20160828-16-0; VISITOR_INFO1_LIVE=jcfD4pRHPFU; LOGIN_INFO=AFmmF2swRQIgMfaH5L2REno_jIiU3ZZZvnfRlGtxeph6j492Z4RJRhQCIQCqC7ULulJPMa_1b3xtguaAQdkVBQFVO3FJJiL4hDND_g:QUQ3MjNmeURLWFZoeGRJV0dvVHJYYWhJWjFBckc2dXh2dk44N2hWcnVnUFI3UXV2cDRQTGNjSkRFUFZNaXZ4SjdkajBEOFMyZVozdTl1b21ydk11ZFJJUzQ3dWZyOVBMRllJbmI2V1ZZTnQ2cGpGV3MtQnQ3NE1PMTFGaXRiUXU5N2hvWlAtQ3AxSGZQZlpKMTh3Q2Y1M2tkX1dMelJsMm13; YT_CL={"loctok":"APLXd648zSCCl_6r4ZVkV6Kkxm9JuPSmbay63vKrCjVEHYkqP-o6xOnaNWM1RhVgBQeeE8Z6t8ro5jBwP09e6dHzc7ZpKQ"}; SID=Pwit208xZqQpOV86M5ArhMG_7PnluennIfLDdOgvJeDzZsfDQJfhRCHVadMJRGTCxXHIWw.; __Secure-1PSID=Pwit208xZqQpOV86M5ArhMG_7PnluennIfLDdOgvJeDzZsfDzlEfMOhGtJkCt-MDI3o7Fg.; __Secure-3PSID=Pwit208xZqQpOV86M5ArhMG_7PnluennIfLDdOgvJeDzZsfDLtCa5Keg9_L20GmTfZj93Q.; HSID=AzMCL6Nf0h8IpoHaq; SSID=AjByr3r1KA6hxoRyD; APISID=NZKbJ5ubOZmZqJE-/AQiCK74UUfNbl8NnO; SAPISID=DcKNUCEQGZfXUSVT/AsuWVVhTcQHdrEtnY; __Secure-1PAPISID=DcKNUCEQGZfXUSVT/AsuWVVhTcQHdrEtnY; __Secure-3PAPISID=DcKNUCEQGZfXUSVT/AsuWVVhTcQHdrEtnY; PREF=volume=100&f6=40000080&tz=America.Phoenix&f5=20000&f7=100; YSC=nDUAk-mtKvM; SIDCC=AIKkIs1GFlsa9nFb4brAEpsAdAQJnIMDBJw6IM7Jmz43K1rSM2utMBJE9X9RVRYVHSMevZs3yVc; __Secure-1PSIDCC=AIKkIs38fLf8VAMUV9ye2sE0AcgzfzKL8IjGvf9JMd4d0lRJjx-mO8jsByIVa6ynGjQwtRAbCs8; __Secure-3PSIDCC=AIKkIs0sJP_L76HdPKBoCxXVLe_SYV_POOOeBJJUOHjsAYtuanSXycxUbfNoRYIDRoLocm7kpU-y'

// Allows delay in sending requests to prevent Google from banning local IP
var interval = 200;
var promise_1 = Promise.resolve();
var promise_2 = Promise.resolve();
var promise_3 = Promise.resolve();

// Sentiment analysis initialize
var sentiment = new Sentiment();

// Color mapping
const colormap = [
	[0,0,0,"black"],
	[255,255,255,"white"],
	[255,0,0,"red"],
	[255,255,0,"yellow"],
	[0,128,0,"green"],
	[0,255,255,"aqua"],
	[0,0,255,"blue"],
	[255,0,255,"fuschia"],
	[128,128,128,"gray"],
	[192,192,192,"silver"],
	[255,170,0,"orange"],
	[128,128,0,"olive"],
	[0,255,0,"lime"],
	[0,128,128,"teal"],
	[128,0,128,"purple"],
	[0,0,128,"navy"],
	[128,0,0,"maroon"]
];

// Remove the default maximum length for format function
util.inspect.defaultOptions.maxArrayLength = null;

// Search parameters
const parameters = ["CAMSBggFEAEYAQ%253D%253D", "CAMSBggFEAEYAw%253D%253D", "CAMSBggFEAEYAg%253D%253D"]

// Create timestamped folder for storing data
const path = './data_' + Date.now() + '\\'
if (!fs.existsSync(path)){
    fs.mkdirSync(path);
}

/*
	SEARCH AREA
*/

// On search success
function process_search(term, param, d) {
    for (i in d) {
        video_id = d[i].id;
		fs.appendFile(path + 'video_ids.txt', util.format(video_id + '\n'), function (err) {
			if (err) throw err;
			//console.log(' - [SEARCH-FINISH]\tTerm: ' + term + '; param ' + param);
		  });
		  get_video_data(video_id);
    }
}

// On search failure
function error_search(term, param, d) {
	fs.appendFile('search_error.log', '[SEARCH-ERROR] Term: ' + term + '; param ' + param + '\n' + util.format(d) +  '\n', function (err) {
	  if (err) throw err;
	  console.log(' ! [SEARCH-ERROR] Term: ' + term + '; param ' + param);
	});
}

// Iterate through all search terms
for (const i in terms) {
	for (const j in parameters) {
		promise_1 = promise_1.then(function () {
			console.log(' + [SEARCH-START]\tTerm: ' + terms[i] + '; param ' + j.toString());
			youtube.search(terms[i], { sp: parameters[j] }).then( (d) => {process_search(terms[i], j.toString(), d.videos)}, (d) => {error_search(terms[i], j.toString(), d.videos)});
			fs.appendFile(path + 'terms_searched.txt', util.format('Term: ' + terms[i] + '; param ' + parameters[j] + '\n'), function (err) {
				if (err) throw err;
			  });
			return new Promise(function (resolve) {
				setTimeout(resolve, 2000);
			});
		});
	}
}

/*
	VIDEO DATA GET
*/

// On success
function process_video_data(id, info) {
    if (info.videoDetails.dislikes == null) {
        info.videoDetails.dislikes = 0;
    }
	
    let video_data = {
        video_id: info.videoDetails.videoId,
        views: info.videoDetails.viewCount,
        likes: info.videoDetails.likes,
        comments: info.videoDetails.dislikes,
        duration: info.videoDetails.lengthSeconds,
        family_safe: info.videoDetails.isFamilySafe,
        unlisted: info.videoDetails.isUnlisted,
        channel_verified: info.videoDetails.author.verified,
        channel_sub_count: info.videoDetails.author.subscriber_count,
        age_restricted: info.videoDetails.age_restricted,
        category: info.videoDetails.category,
        keywords: info.videoDetails.keywords
    }

	test_date = new Date(info.videoDetails.publishDate);
	video_data.dayofweek = test_date.toLocaleString('en-US', {
		weekday: 'long'
	  });

	  video_data.month = test_date.toLocaleString('en-US', {
		month: 'long'
	  });

	if (info.videoDetails.keywords == null){
		video_data.keywords = 0;
	} else {
		video_data.keywords = info.videoDetails.keywords.length;
	}

	if (info.videoDetails.title == null){
		video_data.title_length = 0;
	} else {
		video_data.title_length = info.videoDetails.title.length;
	}

	if (info.videoDetails.description == null){
		video_data.description_length = 0;
	} else {
		video_data.description_length = info.videoDetails.description.length;
	}

	if (info.videoDetails.author.name == null){
		video_data.channelname_length = 0;
	} else {
		video_data.channelname_length = info.videoDetails.author.name.length;
	}

	if (info.videoDetails.author.name == null) {
        video_data.channelname_sentiment = 0;
    } else {
        video_data.channelname_sentiment = sentiment.analyze(info.videoDetails.author.name).comparative;
    }

    if (info.videoDetails.title == null) {
        video_data.title_sentiment = 0;
    } else {
        video_data.title_sentiment = sentiment.analyze(info.videoDetails.title).comparative;
    }

    if (info.videoDetails.description == null) {
        video_data.description_sentiment = 0;
    } else {
        video_data.description_sentiment = sentiment.analyze(info.videoDetails.description).comparative;
    }

    if (video_data.likes === null || isNaN(video_data.likes)) {
		fs.appendFile(path + 'like_count_errored_ids.txt', id + '\n', function (err) {
			if (err) throw err;
		});
    } else {
        fs.appendFile(path + 'get_data' + '.json', util.format(JSON.stringify(video_data)) + '\n', function (err) {
            if (err) throw err;
            //console.log(' - [GET_DATA-FINISH]\tID: ' + id);
            });
        fs.appendFile(path + 'id_processed.txt', id + '\n', function (err) {
            if (err) throw err;
            });
		get_video_thumbnail(video_data, info.videoDetails.thumbnails[0].url)
    }
}

// On failure
function error_data(id, d) {
	console.log("ERROR")
	fs.appendFile(path + 'data_error.log', '[GET_DATA-ERROR] ID: ' + id + '\n' + util.format(d) + '\n', function (err) {
	  if (err) throw err;
	  console.log(' ! [GET_DATA-ERROR] Term: ' + id);
	});
    fs.appendFile(path + 'data_errored_ids.txt', id + '\n', function (err) {
        if (err) throw err;
    });
}

function get_video_data(video_id) {
	promise_2 = promise_2.then(function () {
		//console.log(' + [GET_DATA-START]\tID: ' + video_id);
		ytdl.getInfo("https://www.youtube.com/watch?v=" + video_id, {
			requestOptions: {
			  headers: {
				cookie: COOKIE
			  },
			},
		  }).then( (d) => {process_video_data(video_id, d)}, (d) => {error_data(video_id, d)});
		return new Promise(function (resolve) {
			setTimeout(resolve, 5);
		});
	});
}

/*
	 ANALYZE THUMBNAIL
*/

// On success, write scraped app data to file, including regex formatting to ensure JSON compatibility
function process_thumbnail(video_data, color) {
    tuplet = hsv.apply(null, color);
	video_data.saturation = tuplet[1] / 255;
	
	difference = Array.apply(null, Array(colormap.length))

	for (i in colormap) {
		rd = (color[0] - colormap[i][0])**2;
		gd = (color[1] - colormap[i][1])**2;
		bd = (color[2] - colormap[i][2])**2;
		difference[i] = rd + gd + bd;
	}

	minimum_difference = Math.min(...difference);
	video_data.closest_color = colormap[difference.indexOf(minimum_difference)][3];


    fs.appendFile(path + 'all_data' + '.json', util.format(JSON.stringify(video_data)) + '\n', function (err) {
        if (err) throw err;
        console.log(' - [COLOR-FINISH]\tID: ' + video_data.video_id);
        });
    fs.appendFile(path + 'id_color_processed.txt', video_data.video_id + '\n', function (err) {
        if (err) throw err;
        });
}

// On failure
function error_thumbnail(video_data, d) {
	fs.appendFile(path + 'color_error.log', '[COLOR-ERROR] ID: ' + video_data.video_id + '\n' + util.format(d) + '\n', function (err) {
	  if (err) throw err;
      console.log(' ! [COLOR-ERROR]\tID: ' + video_data.video_id);
	});
    fs.appendFile(path + 'color_errored_ids.txt', video_data.video_id + '\n', function (err) {
        if (err) throw err;
    });
}


function get_video_thumbnail(video_data, thumbnail_url) {
	promise_3 = promise_3.then(function () {
		//console.log(' + [COLOR-START]\tID: ' + video_data.video_id + "; URL: " + thumbnail_url);
		(getColorFromURL(thumbnail_url.split("?sqp")[0])).then( (d) => {process_thumbnail(video_data, d)}, (d) => {error_thumbnail(video_data, d)});
		return new Promise(function (resolve) {
			setTimeout(resolve, 5);
		});
	});
}
// [START app]
const express = require('express');
const app = express();

var bodyParser = require('body-parser');
var cors = require("cors");
var youtubesearchapi=require('youtube-search-api');
const sanitize = require('sanitize-filename');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const ffmpegOrigin = require('ffmpeg');
const kue = require("kue");
const queue = kue.createQueue();

app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb'}));
app.use(
    cors(),
    bodyParser({limit: '500mb'})
)

app.get('/js/jsfunction.js', function(request, response){
    console.log('__dirname===', __dirname)
    response.sendFile(__dirname + '/js/jsfunction.js');
});

app.get('/css/style.css', function(request, response){
    console.log('__dirname===', __dirname)
    response.sendFile(__dirname + '/css/style.css');
});

app.get('/index', function(request, response){
    console.log('__dirname===', __dirname)
    response.sendFile(__dirname + '/index.html');
});

app.get('/download', (req, res) => {

    let path = 'youtube-video/' + req.query.filename
    let isExist = fs.existsSync(path)
    console.log('download path===', path, isExist)
    if (isExist) res.download(path)
    else res.json(false)
})

app.get('/search-youtube2', async (req, res) => {
    let result =  await youtubesearchapi.GetListByKeyword(req.query['q'] || 'cat', true)
    res.json(result)
})


app.get('/delete', (req, res) => {

    let path = 'youtube-video/' + req.query.filename
    let isExist = fs.existsSync(path)
    console.log('delete path===', path, isExist)
    if (isExist) {
        fs.unlinkSync(path)
        res.json(true)
    }
    else res.json(false)
})

app.get('/listofmp3', (request, response) => {
    let testFolder = 'youtube-video'
    const fs = require('fs');
    let result = []
    fs.readdirSync(testFolder).forEach(file => {
        var stats = fs.statSync(testFolder + '/' + file)
        var fileSizeInBytes = stats.size;
        // Convert the file size to megabytes (optional)
        var fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
        let sub = file.substring(file.length - 4).toLocaleLowerCase()
        if (sub === '.mp3') result.push({
            file,
            size: fileSizeInMegabytes
        })
    });

    response.json(result)
})

app.get('/youtube2mp3', (request, response) => {
    let { youtubeUrl } = (request.query || {})
    if (youtubeUrl) {
        // download(youtubeUrl, response)
        queue.create("download", {
            ...(request.query || {})
        })
        .priority("high")
        .attempts(5)
        .save();
        response.json(true)
    }
    else {
        response.json(false)
    }
})


async function download(videoId, response) {
    try {
        // Create a reference to the stream of the video being downloaded.
        let info = await ytdl.getInfo(videoId);
        let temp = ((info.videoDetails || {}).title || new Date().toISOString()) + '_' + videoId
        let titleTempMp4 = sanitize( temp + '.mp4');
        let titleMp3 = sanitize(temp + '.mp3');
        
        let videoObject = ytdl(videoId, {filter: 'video', quality: 'highest'});
        let listSpecialChars = [',', '/', '?', ':', '@', '&', '=', '+', '$', '#', ' ', ')', '(']
        for (let each of listSpecialChars) {
            titleTempMp4 = titleTempMp4.split(each).join('_')
            titleMp3 = titleMp3.split(each).join('_')
        }
        let fullPathMp4 = 'youtube-video/' + titleTempMp4;
        let fullPathMp3 = 'youtube-video/' + titleMp3;
        let isPathExist = await fs.pathExists(fullPathMp3)
    
        if (isPathExist) {
            if (response) response.json(true)
        } else {
            let flag = false
        
            videoObject.on('progress', (chunkLength, downloaded, total) => {
                if (!flag) {
                    console.log('downloading...' + titleTempMp4, (downloaded/total)*100, '%')
                    flag = true
                    setTimeout(() => {
                        flag = false
                    }, 1000);
                }
            });
        
            videoObject.on('error', async (err) => {
                let isPathExist = await fs.pathExists(fullPathMp4)
                if (isPathExist ) fs.unlinkSync(fullPathMp4)
                console.log(err)
                // response.json(err)

            });
        
            // Create write-able stream for the temp file and pipe the video stream into it.
            videoObject.pipe(fs.createWriteStream(fullPathMp4)).on('finish', async () => {
                console.log('download completed...')
                // return {
                    //     mp4Path: fullPathMp4,
                    //     mp3Path: titleMp3
                    // }
                    
                    await convertMp4ToMp3(fullPathMp4, fullPathMp3)
                    if (response) response.json(true)
            });

        }
    } catch(err) {
        if (response) response.json(false)
    }
}

async function convertMp4ToMp3(mp4Path, mp3Path) {
    // Tell the user we are starting to convert the file to mp3.
    // let title = sanitize(((info.videoDetails || {}).title || new Date().toISOString()) + '_' + videoId + '.mp3');
    console.log('mp3Path===', mp3Path)
    console.log('mp4Path===', mp4Path)
    try {
        var process = new ffmpegOrigin(mp4Path);
        process.then(function (video) {
            // Callback mode
            video.fnExtractSoundToMP3(mp3Path, function (error, file) {
                if (!error) {
                    console.log('Audio file: ' + file);
                    fs.unlinkSync(mp4Path)
                } else console.log('error===', error)
            });
        }, function (err) {
            console.log('Error: ' + err);
        });
            
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }
}

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});


queue.process("download", (job, done) => {
    let { youtubeUrl } = job.data
    console.log('youtubeUrl===', youtubeUrl)
    download(youtubeUrl)
    done()
    return true
  });
  
  app.use("/kue-api/", kue.app);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
// [END app]

module.exports = app;
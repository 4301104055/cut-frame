const express = require('express')
const ffmpeg = require('ffmpeg');
const bodyParser = require('body-parser')
const ffmpegfl = require('fluent-ffmpeg')
const fs = require('fs')
const expressFileUpload = require('express-fileupload');
const { tmpdir } = require('os');
const app = express();
const url = require('url');
var imageDir = __dirname + '/tmp/';
var path = require('path');


app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendfile(__dirname + '/index.html')
})

//xoa anh
app.get('/xoaanh', (req, res) => {
    var query = url.parse(req.url, true).query;
    pic = query.image;

    
    getImages(imageDir, function (err, files) {
        console.log(files)
        var dem = 0;
        for (var i = 0; i < files.length; i++) {
            fs.unlink(__dirname + "\\tmp\\" +files[i], function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        }
        
    });
})

// Define the static file path


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
    expressFileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

ffmpegfl.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpegfl.setFfprobePath("C:/ffmpeg/bin");

ffmpegfl.setFlvtoolPath("C:/flvtool");

console.log(ffmpegfl)

app.post('/convert', (req, res) => {
    let to = req.body.to
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.${to}`
    console.log(to)
    console.log(file)

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    //Sua dinh dang
    ffmpegfl("tmp/" + file.name)
        .withOutputFormat(to)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi")
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

//Chỉnh tỉ lệ
app.post('/resize', (req, res) => {
    let height = req.body.height
    let width = req.body.width
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`

    if (height == '') height = '?'
    if (width == '') width = '?'
    let size = height + 'x' + width
    //console.log(to)
    console.log(file)
    console.log(height)
    console.log(height)
    console.log(size)
    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    ffmpegfl("tmp/" + file.name)
        .withSize(size)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi")
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})


//Gộp video
app.post('/merge', (req, res) => {
    let file1 = req.files.file1
    let file2 = req.files.file2
    let fileName = `merge.avi`
    //console.log(to)
    console.log(file1)
    console.log(fileName)
    console.log(__dirname+"\\tmp")

    //Load file
    file1.mv("tmp/" + file1.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File 1 Uploaded successfully");
    });

    file2.mv("tmp/" + file2.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File 2 Uploaded successfully");
    });

    ffmpegfl({ source: "tmp/" + file1.name })
        //.addInput("tmp/" + file2.name)
        .mergeAdd("tmp/" + file2.name)
        .mergeAdd("tmp/" + file2.name)
        
        .on('end', function () {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file1.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
            fs.unlink("tmp/" + file2.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi" + err.message)
            fs.unlink("tmp/" + file1.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
            fs.unlink("tmp/" + file2.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .mergeToFile(__dirname + fileName, __dirname);
})

//xoa am thanh
app.post('/noaudio', (req, res) => {
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`

    console.log(file)

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    //Xoa am thanh
    ffmpegfl("tmp/" + file.name)
        .withNoAudio()
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi" + err.message)
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

app.post('/chinhcodec', (req, res) => {
    let codec = req.body.codec
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`
    console.log(codec)
    console.log(file)

    //ffmpegfl.getAvailableCodecs(function (err, codecs) {
    //    console.log('Available codecs:');
    //    console.dir(codecs);
    //});

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    //Sua dinh dang
    ffmpegfl("tmp/" + file.name)
        .withVideoCodec(codec)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi")
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})


//cắt frame
app.post('/cutframe', (req, res) => {
    let frame = req.body.frame
    let file = req.files.file
    //let fileName = `output.${to}`
    console.log(frame)
    console.log(file)



    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
        try {
            var process = new ffmpeg("tmp/" + file.name);
            process.then(function (video) {
                // Callback mode
                video.fnExtractFrameToJPG("tmp/", {
                    frame_rate: frame,
                    number: 999,
                    file_name: 'my_frame',
                }, function (error, files) {
                    if (!error)
                        console.log('Frames: ' + files);
                    
                    try {
                        app.use(express.static(__dirname));
                        app.get('/', function (req, res) {
                            res.sendFile(__dirname + '/test.html');
                        })
                    }
                    catch{
                        console.log("Loi")
                    }

                });

            }, function (err) {
                console.log('Error: ' + err);
            });


        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
        }
    });
})

//add watermark
app.post('/watermark', (req, res) => {
    let wm = req.files.filewm
    let file = req.files.filevideo
    let ps = req.body.position
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`
    
    console.log(file)

    //load watermark
    wm.mv("tmp/" + wm.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });


    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
        try {
            var process = new ffmpeg("tmp/" + file.name);
            process.then(function (video) {
                // Callback mode
                video.fnAddWatermark("tmp/" + wm.name, "tmp/", {
                    position: ps
                }, function (error, files) {
                        if (!error) {
                            console.log('thanhcong');
                            res.download(__dirname + fileName, function (err) {
                                if (err) throw err;

                                fs.unlink(__dirname + fileName, function (err) {
                                    if (err) throw err;
                                    console.log("File deleted");
                                });
                            });
                            fs.unlink("tmp/" + wm.name, function (err) {
                                if (err) throw err;
                                console.log("File deleted");
                            });
                            fs.unlink("tmp/" + file.name, function (err) {
                                if (err) throw err;
                                console.log("File deleted");
                            });
                        }
                    try {
                        app.use(express.static(__dirname));
                        app.get('/', function (req, res) {
                            res.sendFile(__dirname + '/test.html');
                        })
                    }
                    catch{
                        console.log("Loi")
                        fs.unlink("tmp/" + wm.name, function (err) {
                            if (err) throw err;
                            console.log("File deleted");
                        });
                        fs.unlink("tmp/" + file.name, function (err) {
                            if (err) throw err;
                            console.log("File deleted");
                        });
                    }

                });

            }, function (err) {
                console.log('Error: ' + err);
            });

        } catch (e) {
            console.log(e.code);
            console.log(e.msg);
        }
    });
})

app.post('/Bit', (req, res) => {
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`
    let Bit = req.body.Bit
    //console.log(to)
    console.log(file)
    console.log(Bit)
    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    ffmpegfl("tmp/" + file.name)
        .withVideoBitrate(Bit)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi")
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

app.post('/fps', (req, res) => {
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`
    var fps = req.body.fps
    var nb = parseInt(fps)
    //console.log(to)
    console.log(nb)
    console.log(typeof (nb))
    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");

    });

    ffmpegfl("tmp/" + file.name)
        .withFpsOutput(nb)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi: " + err.message)
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

//Cắt video
app.post('/cutvideo', (req, res) => {
    let start = req.body.start
    let end = req.body.end
    let file = req.files.file
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`


    //console.log(to)
    console.log(file)
    console.log(start)
    console.log(end)

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    ffmpegfl("tmp/" + file.name)
        .setStartTime(start)
        .setDuration(end - start)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi")
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

//Them am thanh
app.post('/addaudio', (req, res) => {
    let file = req.files.file
    let audio = req.files.fileaudio
    let tenoutput = req.body.nameoutput
    if (tenoutput == "") {
        tenoutput = "output"
    }
    let fileName = `-${tenoutput}.mp4`

    console.log(file)

    //Load file
    file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    audio.mv("tmp/" + audio.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });

    //Xoa am thanh
    ffmpegfl("tmp/" + file.name)
        .addInput("tmp/" + audio.name)
        .on('end', function (stdout, stderr) {
            console.log("Hoan thanh")
            res.download(__dirname + fileName, function (err) {
                if (err) throw err;

                fs.unlink(__dirname + fileName, function (err) {
                    if (err) throw err;
                    console.log("File deleted");
                });
            });
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
            fs.unlink("tmp/" + audio.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .on('error', function (err) {
            console.log("Xay ra loi" + err.message)
            fs.unlink("tmp/" + file.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
            fs.unlink("tmp/" + audio.name, function (err) {
                if (err) throw err;
                console.log("File deleted");
            });
        })
        .saveToFile(__dirname + fileName)
})

app.listen(4000, () => {
    console.log("Dung port 4000")
})

function getImages(imageDir, callback) {
    var fileType = '.jpg',
        files = [], i;
    fs.readdir(imageDir, function (err, list) {
        for (i = 0; i < list.length; i++) {
            if (path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
        }
        callback(err, files);
    });
}
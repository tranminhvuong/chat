const playVideo = require('./playVideo');
function openCamera(){
    navigator.mediaDevices.getUserMedia({audio:false, video:true})
    .then(stream => {
        playVideo(stream, 'localvideo')
        })
    .catch(err => console.log(err));
}
module.exports = openCamera;
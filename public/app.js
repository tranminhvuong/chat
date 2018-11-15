var open = function(){
	navigator.mediaDevices.getUserMedia({audio:false, video:true})
    .then(stream => {
        const video = document.getElementById('localvideo');
        video.srcObject =stream;
    video.onloadedmetadata = function(){
        video.play();
    };
        })
    .catch(err => console.log(err));
}
open();

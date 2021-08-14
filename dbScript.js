

let req = indexedDB.open("gallery", 1);

let database;
let numberOfMedia = 0;

req.addEventListener("success", function() {
    database = req.result;
    console.log(database);

});
req.addEventListener("upgradeneeded",function(){

    let db = req.result;

    db.createObjectStore("media",{keyPath: "mId"});

});
req.addEventListener("error", function(){

});

let backBtn = document.querySelector(".backBtn");

backBtn.addEventListener("click", function() {
    location.assign("index.html");
    backBtn.classList.add("back-btn-animation")
});


function saveMedia(media){
    if(!database) return;

    let data = {
        mId: Date.now(),
        mediaData: media,
    };

    let tx = database.transaction("media","readwrite");
    let mediaObjectStore = tx.objectStore("media");
    mediaObjectStore.add(data);
}

function viewMedia(){
    if(!database) return;

    let galleryContainer = document.querySelector(".gallery-container");




    let tx = database.transaction("media","readonly");
    let mediaObjectStore = tx.objectStore("media");

    let req = mediaObjectStore.openCursor();

    req.addEventListener("success", function(){
        cursor = req.result;
        if(cursor) {
            // console.log(cursor.value);

            numberOfMedia++;

            let mediaCard = document.createElement("div");
            mediaCard.classList.add("media-card");
            mediaCard.innerHTML = `<div class="actual-media"></div>
            <div class="media-buttons">
                <button class="media-download">Download</button>
                <button data-mid = "${cursor.value.mId}" class="media-delete">Delete</button>
            </div>`;

            //agar image hogi to typeof data string form m hoga and agr video hogi ya blob hogi to typeof data object hoga.

            let data = cursor.value.mediaData;  //to fetch data

            let actualMediaDiv = mediaCard.querySelector(".actual-media");

            let downloadBtn = mediaCard.querySelector(".media-download");

            let deleteBtn = mediaCard.querySelector(".media-delete");

            deleteBtn.addEventListener("click", function(e) {
                let mId = Number(e.currentTarget.getAttribute("data-mid"));
                deleteMedia(mId);

                e.currentTarget.parentElement.parentElement.remove();
            })

            let type = typeof data;

            if(type == "string"){
                
                //image

                let image = document.createElement("img");
                image.src = data;

                downloadBtn.addEventListener("click", function() {
                    downloadMedia(data, "image");
                })

                actualMediaDiv.append(image);

            }else if(type == "object"){
                //video

                let video = document.createElement("video");

                let url = URL.createObjectURL(data);

                video.src = url;

                downloadBtn.addEventListener("click", function() {
                    downloadMedia(url, "video");
                })

                video.autoplay = true;
                video.loop = true;
                video.controls = true;
                video.muted = true;

                actualMediaDiv.append(video);
            }


            galleryContainer.append(mediaCard);


            cursor.continue();
        }else{
            if(numberOfMedia == 0){
                galleryContainer.innerText = "NO MEDIA PRESENT......";
                
            }
        }
    });

}

function downloadMedia(url, type){

    let anchor = document.createElement("a");

    anchor.href = url;

    if(type == "image"){
        
        anchor.download = "image.png";

    }else{

        anchor.download = "video.mp4";
    }

    anchor.click();

    anchor.remove();
}

function deleteMedia(mId){

    let tx = database.transaction("media","readwrite");
    let mediaStore = tx.objectStore("media");

    mediaStore.delete(mId);
}

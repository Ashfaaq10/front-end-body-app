document.getElementById('image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('imagePreview');
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('uploadForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData();
    const imageFile = document.getElementById('image').files[0];
    formData.append('image', imageFile);

    try {
        const response = await fetch('https://your-backend-app.vercel.app/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        displayPredictions(result.measurements);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
});

document.getElementById('takePictureBtn').addEventListener('click', function() {
    document.getElementById('uploadForm').style.display = 'none';
    document.getElementById('takePictureBtn').style.display = 'none';
    document.getElementById('cameraContainer').style.display = 'block';

    // Constraints to use back camera
    const constraints = {
        video: {
            facingMode: { exact: "environment" }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        let video = document.getElementById('videoElement');
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.error('Error accessing webcam:', err);
    });
});

document.getElementById('captureBtn').addEventListener('click', function() {
    let timerDiv = document.getElementById('timer');
    let countdown = 10; // 10 seconds countdown
    timerDiv.textContent = `Taking picture in ${countdown}...`;
    
    let interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            timerDiv.textContent = `Taking picture in ${countdown}...`;
        } else {
            clearInterval(interval);
            timerDiv.textContent = '';

            let video = document.getElementById('videoElement');
            let canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            let context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Stop video stream
            video.srcObject.getVideoTracks().forEach(track => track.stop());

            // Convert canvas to base64 data
            let base64Image = canvas.toDataURL('image/jpeg');

            // Display captured image in preview
            const img = document.getElementById('capturePreview');
            img.src = base64Image;
            img.style.display = 'block';

            // Send base64 image data to server
            fetch('https://your-backend-app.vercel.app/api/upload-base64', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64Image })
            })
            .then(response => response.json())
            .then(result => {
                displayPredictions(result.measurements);
            })
            .catch(error => {
                console.error('Error uploading image:', error);
            });

            // Reset UI
            document.getElementById('uploadForm').style.display = 'block';
            document.getElementById('takePictureBtn').style.display = 'block';
            document.getElementById('cameraContainer').style.display = 'none';
        }
    }, 1000); // 1-second interval
});

function displayPredictions(predictions) {
    const predictionsDiv = document.getElementById('predictions');
    predictionsDiv.style.display = 'block';
    predictionsDiv.innerHTML = `<h2>Predicted Measurements:</h2><pre>${JSON.stringify(predictions, null, 2)}</pre>`;
}

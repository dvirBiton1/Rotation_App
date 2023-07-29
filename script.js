// Global variables
let queuedImagesArray = [],
    queuedForm = document.querySelector("#queued-form"),
    queuedDiv = document.querySelector('.queued-div'),
    inputDiv = document.querySelector('.input-div'),
    input = document.querySelector('.input-div input'),
    deleteImages = [],
    currentImgIndex = -1,
    currentFileIndex = 0;

/**
 * Function called when OpenCV is ready. Sets up event listeners for rotation buttons.
 */
function onOpenCvReady() {
    cv = window.cv;
    angleInput = document.getElementById('angleInput');
    rotateRightBtn = document.getElementById('rotateRight');
    rotateLeftBtn = document.getElementById('rotateLeft');
    rotateRightBtn.addEventListener('click', rotateRight, false);
    rotateLeftBtn.addEventListener('click', rotateLeft, false);
}

/**
 * Displays the queued images in the frontend by creating canvas elements for each image and
 * adding them to the queuedDiv container.
 */
function displayQueuedImages() {
    queuedDiv.innerHTML = ''; // Clear the existing content
    queuedImagesArray.forEach((image, index) => {
        // Create a canvas element for each image
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');

        // Create an Image object to load the image data
        const img = new Image();

        // When the image is loaded, draw it on the canvas
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        // Load the image data into the Image object
        img.src = URL.createObjectURL(image);

        // Add a delete button (you can customize this part)
        const deleteButton = document.createElement('span');
        deleteButton.innerHTML = '&times;';
        deleteButton.onclick = () => deleteQueuedImage(index);

        // Create a container div for the canvas and delete button
        const container = document.createElement('div');
        container.classList.add('image'); // You might want to add any CSS class here
        container.appendChild(canvas);
        container.appendChild(deleteButton);

        // Append the container to the queuedDiv
        queuedDiv.appendChild(container);
    });

    currentImgIndex = queuedImagesArray.length - 1;
    console.log("currentImgIndex: " + currentImgIndex);
}

/**
 * Deletes the queued image at the specified index and updates the display.
 * @param {number} index - The index of the image to delete.
 */
function deleteQueuedImage(index) {
    queuedImagesArray.splice(index, 1);
    displayQueuedImages();
}

// Event listener for input file selection
input.addEventListener("change", () => {
    const files = input.files;
    for (let i = 0; i < files.length; i++) {
        queuedImagesArray.push(files[i]);
    }
    queuedForm.reset();
    displayQueuedImages();
});

// Event listener for dropping files into inputDiv
inputDiv.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
        if (!files[i].type.match("image")) continue; // only photos

        if (queuedImagesArray.every(image => image.name !== files[i].name))
            queuedImagesArray.push(files[i]);
    }
    displayQueuedImages();
});

/**
 * Rotates the currently displayed image to the right by the specified angle.
 */
function rotateRight() {
    console.log("rotateRight");
    const angle = parseFloat(angleInput.value);
    console.log(angle);
    if (!isNaN(angle) && currentImgIndex !== -1) {
        var imgToRotate = document.getElementsByClassName("image")[currentImgIndex].getElementsByTagName("canvas")[0];
        const rotatedMat = rotateImage(imgToRotate, -angle);
        cv.imshow(imgToRotate, rotatedMat);
        rotatedMat.delete();
    }
}

/**
 * Rotates the currently displayed image to the left by the specified angle.
 */
function rotateLeft() {
    console.log("rotateLeft");
    const angle = parseFloat(angleInput.value);
    console.log(angle);
    if (!isNaN(angle) && currentImgIndex !== -1) {
        var imgToRotate = document.getElementsByClassName("image")[currentImgIndex].getElementsByTagName("canvas")[0];
        const rotatedMat = rotateImage(imgToRotate, angle);
        cv.imshow(imgToRotate, rotatedMat);
        rotatedMat.delete();
    }
}

/**
 * Rotates the provided image by the specified angle using OpenCV.
 * @param {HTMLCanvasElement} img - The canvas containing the image to rotate.
 * @param {number} angle - The angle of rotation in degrees.
 * @returns {cv.Mat} The rotated OpenCV Mat object.
 */
function rotateImage(img, angle) {
    const mat = cv.imread(img);
    const rotatedMat = new cv.Mat();
    const center = new cv.Point(mat.cols / 2, mat.rows / 2);
    const M = cv.getRotationMatrix2D(center, angle, 1);
    cv.warpAffine(mat, rotatedMat, M, mat.size());

    // Clean up OpenCV Mats
    mat.delete();

    return rotatedMat;
}

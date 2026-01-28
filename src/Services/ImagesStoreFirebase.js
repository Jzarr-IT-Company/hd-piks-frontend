import { getDownloadURL, ref, storage, uploadBytesResumable } from './Services.js';

// Refactored to use async/await and avoid blocking the main thread
export const storeImageOnFirebase = async (firseBaseFIlesStorage) => {
    try {
        const storageRef = ref(storage, `images/${firseBaseFIlesStorage[0].name}`);
        
        // Create a promise-based wrapper around uploadBytesResumable
        const uploadTask = uploadBytesResumable(storageRef, firseBaseFIlesStorage[0]);
        
        // Await the completion of the upload
        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    console.log("ERROR DUE TO STORING IMAGES", error.message);
                    reject(error); // Reject the promise on error
                },
                () => {
                    // Resolve the promise once the upload completes
                    resolve(uploadTask.snapshot.ref);
                }
            );
        });

        // Once the upload is completed, fetch the download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', downloadURL);
        
    } catch (error) {
        console.error("Error during image upload:", error);
        throw error; // Propagate error to higher levels if necessary
    }
};

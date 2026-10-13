
import { useState } from 'react';

const CLOUDINARY_CLOUD_NAME = 'mpkeapds';
const CLOUDINARY_UPLOAD_PRESET = 'image-upload-app';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function handleFileChange(event) {
    const file = event.target.files[0];

    setError('');
    setMessage('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedFile(null);
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    if (
      CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME' ||
      !CLOUDINARY_CLOUD_NAME.trim() ||
      !CLOUDINARY_UPLOAD_PRESET.trim()
    ) {
      setError('Please add your Cloudinary Cloud Name and upload preset.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append('file', selectedFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || 'Image upload failed. Please try again.'
        );
      }

      setUploadedImage(data.secure_url);
      setMessage('Your image was uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <section className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">
          Image Upload App
        </h1>

        <p className="mb-8 text-center text-gray-500">
          Upload your images to Cloudinary and display them here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="image"
              className="mb-2 block font-semibold text-gray-700"
            >
              Select an image
            </label>

            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-blue-700"
            />
          </div>

          {selectedFile && (
            <p className="break-words text-sm text-gray-600">
              Selected: {selectedFile.name}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {uploading ? 'Uploading image...' : 'Upload Image'}
          </button>
        </form>

        {uploading && (
          <p role="status" className="mt-5 text-center text-blue-600">
            Please wait while your image uploads...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        {uploadedImage && (
          <div className="mt-8">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">
              Uploaded Image
            </h2>

            <img
              src={uploadedImage}
              alt="Successfully uploaded"
              className="max-h-96 w-full rounded-xl border border-gray-200 object-contain"
            />

            <a
              href={uploadedImage}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block break-all text-sm text-blue-600 underline"
            >
              View image on Cloudinary
            </a>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

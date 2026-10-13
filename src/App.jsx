
import { useRef, useState } from 'react';

const CLOUDINARY_CLOUD_NAME = 'mpkeapds';
const CLOUDINARY_UPLOAD_PRESET = 'image-upload-app';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fileInputRef = useRef(null);

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
      !CLOUDINARY_CLOUD_NAME.trim() ||
      CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME' ||
      !CLOUDINARY_UPLOAD_PRESET.trim()
    ) {
      setError('Please configure your Cloudinary settings.');
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

      const transformedUrl = data.secure_url.replace(
        '/upload/',
        '/upload/w_400,h_300,c_limit,q_auto,f_auto/'
      );

      const newImage = {
        id: data.asset_id,
        name: selectedFile.name,
        url: data.secure_url,
        thumbnailUrl: transformedUrl,
      };

      setImages((previousImages) => [
        newImage,
        ...previousImages,
      ]);

      setMessage('Image uploaded successfully!');

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-10 rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">
            Cloudinary Image Gallery
          </h1>

          <p className="mb-8 text-center text-gray-500">
            Upload your favourite images and see them in your gallery.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
            <div>
              <label
                htmlFor="image"
                className="mb-2 block font-semibold text-gray-700"
              >
                Choose an image
              </label>

              <input
                ref={fileInputRef}
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
              Uploading your image. Please wait...
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
        </div>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Gallery
            </h2>

            <p className="text-sm text-gray-500">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </p>
          </div>

          {images.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <p className="text-lg font-semibold text-gray-700">
                Your gallery is empty
              </p>

              <p className="mt-2 text-gray-500">
                Upload your first image to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg"
                >
                  <img
                    src={image.thumbnailUrl}
                    alt={image.name}
                    loading="lazy"
                    className="h-56 w-full bg-gray-100 object-cover"
                  />

                  <div className="p-4">
                    <p
                      className="truncate font-medium text-gray-800"
                      title={image.name}
                    >
                      {image.name}
                    </p>

                    <a
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                    >
                      View original image
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Set canvas size to the cropped area size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // If the cropped image is still too large, resize it
    const MAX_SIZE = 800;
    if (canvas.width > MAX_SIZE || canvas.height > MAX_SIZE) {
      const scale = Math.min(MAX_SIZE / canvas.width, MAX_SIZE / canvas.height);
      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = canvas.width * scale;
      resizedCanvas.height = canvas.height * scale;
      const resizedCtx = resizedCanvas.getContext('2d');
      resizedCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
      return resizedCanvas.toDataURL('image/jpeg', 0.8);
    }

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
        />
      </div>
      
      <div className="w-full max-w-2xl mt-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-white"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-white/10 text-white uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-white/20 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-4 bg-white text-black uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors"
          >
            Confirmar Recorte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;

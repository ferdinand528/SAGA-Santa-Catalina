export const comprimirImagen = (archivo) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Resolución ideal para web
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Aquí sucede la magia: calidad 0.7 (70%)
        ctx.canvas.toBlob((blob) => {
          const fileComprimido = new File([blob], archivo.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(fileComprimido);
        }, 'image/jpeg', 0.7);
      };
    };
  });
};
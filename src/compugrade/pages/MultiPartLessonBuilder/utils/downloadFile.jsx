export default async function downloadFile(file, fallbackName = "download") {
    if (!file) return;
  
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name || fallbackName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
  
    if (typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))) {
      try {
        const response = await fetch(file, { mode: "cors" });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const urlParts = file.split(".");
        const ext = urlParts[urlParts.length - 1].split(/\#|\?/)[0];
        a.href = url;
        a.download = ext ? `${fallbackName}.${ext}` : fallbackName;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed", err);
        window.open(file, "_blank");
      }
      return;
    }
  
    if (typeof file === "string" && file.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = file;
      a.download = fallbackName;
      a.click();
      return;
    }
  
    if (typeof file === "string") {
      const byteCharacters = atob(file);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fallbackName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
  }
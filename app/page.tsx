"use client";
import { useState } from 'react';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/create-token', {
        method: "POST",
        body: formData
        // method: 'POST',
        // body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setIpfsHash(data.ipfsHash);
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
      <div>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Upload File</button>
        </form>

        {ipfsHash && (
            <div>
              <p>File uploaded to IPFS!</p>
              <p>IPFS Hash: {ipfsHash}</p>
              <a href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`} target="_blank">
                View File
              </a>
            </div>
        )}
      </div>
  );
}
export default function Home() {
  return (
    <div>
      <UploadForm/>
    </div>
  );
}

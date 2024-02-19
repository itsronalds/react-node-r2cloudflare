import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const getSignedURL = async () => {
    const formData = new FormData();
    formData.append('file', file);

    const request = await fetch('http://localhost:3000/api/signed-url', {
      method: 'POST',
      body: formData,
    });
    const response = await request.json();

    await uploadFileToS3(response.response);
  };

  const uploadFileToS3 = async (signedURL) => {
    const request = await fetch(signedURL, {
      method: 'PUT',
      body: file,
    });
    console.log(request);
  };

  // const getSignedURL = async () => {
  //   const formData = new FormData();
  //   formData.append('file', file);

  //   const request = await fetch('http://localhost:3000/api/signed-url-v2', {
  //     method: 'POST',
  //     body: formData,
  //   });
  //   const response = await request.json();

  //   if (response.response) {
  //     await uploadFileToS3(response.response);
  //   }
  // };

  // const uploadFileToS3 = async (data) => {
  //   const { fields, url } = data;
  //   console.log(fields, url);

  //   const formData = new FormData();

  //   Object.entries(fields).forEach(([key, value]) => {
  //     formData.append(key, value);
  //   });

  //   formData.append('file', file);

  //   const request = await fetch(url, {
  //     method: 'POST',
  //     body: formData,
  //   });

  //   console.log(request);
  // };

  return (
    <div className="app">
      <div className="form">
        <h1>Upload file</h1>
        <input type="file" onChange={handleFileChange} />
        <button type="button" onClick={getSignedURL}>
          Upload
        </button>
      </div>
    </div>
  );
}

export default App;

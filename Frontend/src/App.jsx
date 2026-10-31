import { useState, useId } from 'react'
import './App.css'
import { useEffect } from 'react'

function App() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [folderItems, setFolderItems] = useState([])
  const [url, setUrl] = useState('http://192.168.29.22:8081/')
  const [uploading, setUploading] = useState(null)
  const [alert, setAlert] = useState("")
  const id = useId()

  function getFolder(url) {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setIsLoading(false)
        setFolderItems(data)
      }).catch((error) => {
        setError(error)
        console.log("frontend :: app.js :: error :: ", error)
      })
  }

  useEffect(() => {
    getFolder(url)
  }, [])

  async function uploadHandler(e) {
    const files = e.target.files
    const file = files[0]
    console.log(file)
    const readStream = await file.stream()
    console.log(readStream)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:8081/', true)
    xhr.setRequestHeader("filename", `${file.name}`)
    xhr.addEventListener('load', () => {
      console.log(xhr.response)
    })
    xhr.upload.addEventListener("loadstart", (event) => {
      console.log(`${0} %`)
    });
    xhr.upload.addEventListener("progress", (event) => {
      const totalFileSize = file.size
      let amountLoaded = (event.loaded / totalFileSize) * 100
      amountLoaded = Math.round(amountLoaded)
      console.log(`${amountLoaded} %`)
      setUploading(amountLoaded)
    });
    xhr.addEventListener('loadend', () => {
      setUploading(null)
      setAlert('File is uploaded sucessfully')
      setTimeout(() => {
        setAlert("")
      }, 2000);
    })
    xhr.send(file)
  }

  if (error) {
    return <h2>something went wrong</h2>
  } else if (isLoading) {
    return <h2>Loading.....</h2>
  } else {
    return <div>
      <h1>Our Storage</h1>
      <input onChange={uploadHandler} id="fileInput" type="file" multiple></input>
      {uploading !== null ? `${uploading} % File is Uploading...` : ""}
      {alert !== null ? alert : ""}
      {folderItems.map((list, i) => {
        return <div key={i}>
          <span>{`${i+1}. `}</span>
          <span>{list}</span>&nbsp;
          <a href={`http://192.168.29.22:8081/${encodeURIComponent(list)}?action=open&happy=true&enjoy=false`}>open</a>&nbsp;
          <a href={`http://192.168.29.22:8081/${encodeURIComponent(list)}?action=download&happy=true&enjoy=false`}>download</a>
          <br></br>
        </div>
      })}
      {/* {folderItems.map((list, i) => {
  const itemPath = encodeURIComponent(list);

  return (
    <div key={i}>
      <span>{list}</span>&nbsp;

      <a
        href={`http://192.168.29.22:8081/${itemPath}?action=open`}
      >
        Open
      </a>
      &nbsp;

      <a
        href={`http://192.168.29.22:8081/${itemPath}?action=download`}
      >
        Download
      </a>

      <br />
    </div>
  );
})} */}
    </div >


  }

}

export default App

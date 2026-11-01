import { useState, useId } from 'react'
import './App.css'
import { useEffect } from 'react'
import { useRef } from 'react'

function App() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [folderItems, setFolderItems] = useState([])
  const [url, setUrl] = useState('http://192.168.29.22:8081/')
  const [uploading, setUploading] = useState(null)
  const [alert, setAlert] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [editInputValue, setEditInputValue] = useState('')
  const id = useId()
  const [oldFilename, setOldFilename] = useState(null)
  const [trigerRender, setTrigerRender] = useState(false)
  const [alertMsg, setAlertMsg] = useState(null)


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
    setTrigerRender(false)
  }, [trigerRender])

  async function uploadHandler(e) {
    const files = e.target.files
    const file = files[0]
    // console.log(file)
    // const readStream = await file.stream()
    // console.log(readStream)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:8081/', true)
    xhr.setRequestHeader("filename", `${file.name}`)
    xhr.addEventListener('load', () => {
      // console.log(xhr.response)
    })
    xhr.upload.addEventListener("loadstart", (event) => {
      // console.log(`${0} %`)
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
      // setTrigerRender(true)
      getFolder(url)
    })
    xhr.send(file)
  }

  async function editModeHandler(filename) {
    console.log(filename.list)
    setEditMode(true)
    setOldFilename(filename.list)
    setEditInputValue(filename.list)
  }
  async function editHandler(e) {
    // console.log(e)
    console.log(e.target.value)
    setEditInputValue(e.target.value)
  }
  async function serverCallToEdit() {
    console.log(oldFilename)
    const res = await fetch('http://localhost:8081/', {
      method: "PATCH",
      body: JSON.stringify({
        oldFilename,
        "newFileName": editInputValue
      })
    }
    )
    const result = await res.text()
    console.log("server res :: ", result)
    setEditInputValue("")
    setEditMode(false)
    setTrigerRender(true)
  }
  async function deleteHandler(filename) {
    await fetch('http://localhost:8081/', {
      method: "DELETE",
      body: JSON.stringify({ filename })
    })
      .then((res) => res.text())
      .then((data) => {
        alertMessag(data)
      })
    setTrigerRender(true)
  }

  function alertMessag(msg) {
    setAlertMsg(msg)
    setTimeout(() => {
      setAlertMsg(null)
    }, 2000)
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
      {alertMsg !== null ? alertMsg : ""}
      {/* edit mode */}
      {editMode ? <div>
        <input value={editInputValue} onInput={editHandler} name='inputfiled' />
        <button onClick={serverCallToEdit}>sumbit</button>
      </div> : ""}
      {folderItems.map((list, i) => {
        return <div key={i}>
          <span>{`${i + 1}. `}</span>
          <span>{list}</span>&nbsp;
          <a href={`http://192.168.29.22:8081/${encodeURIComponent(list)}?action=open&happy=true&enjoy=false`}>open</a>&nbsp;
          <a href={`http://192.168.29.22:8081/${encodeURIComponent(list)}?action=download&happy=true&enjoy=false`}>download</a>&nbsp;
          <button onClick={() => editModeHandler({ list })}>edit</button>&nbsp;
          <button onClick={() => deleteHandler(list)}>delete</button>
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

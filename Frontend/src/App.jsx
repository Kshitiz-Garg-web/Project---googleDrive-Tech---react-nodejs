import { useState, useId } from 'react'
import './App.css'
import { useEffect } from 'react'

function App() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [folderItems, setFolderItems] = useState([])
  const [url, setUrl] = useState('http://192.168.29.22:8081/')
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

  if (error) {
    return <h2>something went wrong</h2>
  } else if (isLoading) {
    return <h2>Loading.....</h2>
  } else {
    return <div>
      {folderItems.map((list, i) => {
        return <div key={i}>
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

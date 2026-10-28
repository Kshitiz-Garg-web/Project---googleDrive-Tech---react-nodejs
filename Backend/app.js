import http from "node:http"
import fs from "node:fs/promises"

const server = http.createServer()

server.listen(8081, () => {
  console.log("listening at http://localhost:8081")
})

server.on("error", (error) => {
  console.log("server error:", error)
})

server.on("request", async (req, res) => {
  const { actualUrl, reqPath, queryParams, fileName } = getInfoFromUrl(req)
  console.log('1 reqPath -> ', reqPath)
  console.log('2 queryParams -> ', queryParams)
  console.log('3 fileName -> ', fileName)
  console.log('4 actualUrl -> ', actualUrl)
  console.log('type of reqPath -> ', typeof (reqPath))

  if (req.url === "/") {
    await serveDirectory("", res)
  } else {
    try {
      const storagePath = `./storage/${reqPath}`
      const stats = await fs.stat(storagePath)

      if (stats.isDirectory()) {
        await serveDirectory(reqPath, res)
      } else if (queryParams.action === "download") {
        // console.log('via download', fileName)
        res.end("download will work soon")
      } else {
        // console.log('via open', fileName)

        const fileHandler = await fs.open(storagePath)
        streamFile(fileHandler, res)
      }
    } catch (error) {
      console.log(`WAY 1 web server error: ${error}`)
      res.end("page not found")
    }
  }
})

function streamFile(fileHandler, res) {
  const readStream = fileHandler.createReadStream()
  readStream.pipe(res)
  readStream.on("end", async () => {
    await fileHandler.close()
    console.log("file closed")
    console.log(`
      
      
      `)
  })
}

async function serveDirectory(reqPath, res) {
  const storagePath = `./storage/${reqPath}`
  console.log('5 storagePath -> ', storagePath)
  const storageList = await fs.readdir(storagePath)
  const urlPath = reqPath === '' ? reqPath : reqPath
    console.log('6 urlPath -> ', urlPath)
  let dynamicHtml = ""

  storageList.forEach((item) => {
    const itemPath = `${urlPath}/${encodeURIComponent(item)}`
      console.log('itemPath -> ', itemPath)
    dynamicHtml += `
    <div>
     <span>${item}</span>
     <a href="http://localhost:8081${itemPath}?action=open&happy=true&enjoy=false">open</a>
     <a href="http://localhost:8081${itemPath}?action=download&happy=true&enjoy=false">download</a>
    </div>
    <br>`
  })

  const htmlBoilerplate = await fs.readFile("./boilerPlate.html", "utf8")
  res.end(htmlBoilerplate.replace("${dynamicHtml}", dynamicHtml))
}

function getInfoFromUrl(req) {
  const actualUrl = decodeURIComponent(req.url)
  const [reqPath, queryString] = actualUrl.split("?")
  const queryParams = {}

  queryString?.split("&").forEach((pair) => {
    const [key, value] = pair.split("=")
    queryParams[key] = value
  })

  // ---about fileName---
  const allLevels = reqPath.split('/')
  const fileName = allLevels[allLevels.length - 1]
  // ---about fileName---

  return {
    actualUrl,
    reqPath,
    queryParams,
    fileName
  }
}

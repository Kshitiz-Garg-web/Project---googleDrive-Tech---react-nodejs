import http from "node:http"
import fs from "node:fs/promises"
import mime from 'mime-types'

const server = http.createServer()

server.listen(8081, () => {
  console.log("listening at http://localhost:8081")
})

server.on("error", (error) => {
  console.log("server error:", error)
})

server.on("request", async (req, res) => {
  const { actualUrl, reqPath, queryParams, fileName } = getInfoFromUrl(req)

  // global headers for both case - direc open to download
  res.setHeader("Access-Control-Allow-Origin", "*")

  if (req.url === "/") {
    await serveDirectory("", res)
  } else {
    try {
      const storagePath = `./storage/${reqPath}`
      const stats = await fs.stat(storagePath)

      if (stats.isDirectory()) {
        await serveDirectory(reqPath, res)
      } else {
        // set headers for global - 
        res.setHeader("Content-Type", mime.contentType(fileName))
        res.setHeader("Content-Length", stats.size)

        if (queryParams.action === "download") {
          // set headers for download
          res.setHeader(
            "Content-Disposition",
            `attachment; fileName="${fileName}"`
          )
        } else if (queryParams.action === "open") {
          // set headers for open
        }
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
  const urlPath = reqPath === '' ? reqPath : reqPath
  // const itemPath = `${urlPath}/${encodeURIComponent(item)}`
  const storageList = await fs.readdir(storagePath)
  res.setHeader("Content-Type", mime.lookup('json'))
  res.end(JSON.stringify(storageList))
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

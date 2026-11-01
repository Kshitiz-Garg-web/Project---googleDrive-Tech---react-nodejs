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
  res.setHeader("Access-Control-Allow-Headers", "*")
  res.setHeader("Access-Control-Allow-Methods", "*")

  if (req.method === 'GET') {
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
  }
  else if (req.method === "OPTIONS") {
    res.end('all ok')
  }
  else if (req.method === 'POST' && req.url === '/') {
    const { filename } = req.headers
    const fileHandle = await fs.open(`storage/${filename}`, 'w'
    )
    const writeStream = fileHandle.createWriteStream()
    req.pipe(writeStream)



    // way1
    // req.on('end', () => { 
    //   console.log('req is end') 
    //   writeStream.on('finish', () => {
    //     writeStream.close()
    //     console.log('writeStream is closed')
    //   })
    // })

    // way2
    // req.on('end', () => {
    //   console.log('req is end')
    //   writeStream.end(() => {
    //     console.log('writeStream is closed')
    //   })
    // })

    // way3
    // writeStream.end();

    // writeStream.on("finish", () => {
    //   res.end("File uploaded successfully");
    // });

    res.end("file uploading is done")
    req.on('error', (error) => {
      console.log("server :: app.js :: error ", error)
    })
  }
  else if (req.method === 'PATCH' && req.url === '/') {
    console.log('put time-----------------')
    let chunkCollectore = []
    req.on('data', (chunk) => {
      chunkCollectore.push(chunk)
    })
    req.on('end', async () => {
      let body = JSON.parse(Buffer.concat(chunkCollectore).toString())
      console.log(body)
      await fs.rename(
        `./storage/${body.oldFilename}`,
        `./storage/${body.newFileName}`
      );
      res.end('got it')

    })
  }
  else if (req.method === 'DELETE' && req.url === '/') {
    const chunkCollectore = []
    req.on('data', (chunk) => {
      chunkCollectore.push(chunk)
    })
    req.on("end", async () => {
      const { filename } = JSON.parse(Buffer.concat(chunkCollectore).toString())
      console.log(filename)
      await fs.rm(`./storage/${filename}`, { recursive: true })
      console.log('200ok done')
      res.end("file is deleted successfully")
    })
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
  const arr = await fs.readdir(storagePath)
  const storageList = arr.filter((item) => item !== '.gitkeep')
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

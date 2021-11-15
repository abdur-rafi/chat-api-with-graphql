import "reflect-metadata";
import express from 'express'

let app = express()



let port = 3000;

app.use('/',(req, res)=>{
    res.send('Working')
})

app.listen(port, ()=>{
    console.log(`server is listening on port ${port}`)
})

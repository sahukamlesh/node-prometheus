const express = require('express');
const responseTime  = require('response-time')
const client = require('prom-client'); //metric collection
const {doSomeHeavyTask} = require('./utils')
 const app = express();

const PORT  = 8080;

const reqResTime  = new client.Histogram({
    name:'http_express_req_res_time',
    help:'This tells us how much time is taken for req, res ',
    labelNames:['method','route','status_code'],
    buckets:[1,50,100,200,800,1000,2000]
})

const totalReqCounter = new client.Counter({
    name:'total_Req',
    help:'Tells total req'
})
const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({register:client.register})

app.use(responseTime((req, res, time) => {
    if (req.path !== '/metrics') { // Metrics endpoint ignore karo
        totalReqCounter.inc(); 
        reqResTime.labels({
            method: req.method,
            route: req.url,
            status_code: res.statusCode,
        }).observe(time);
    }
}));


app.get('/',(req,res)=>{
    return res.json({
        message:'Hello express server from prometheus '
    })
})

app.get('/slow',async(req,res)=>{
    try{
        const timeTaken  = await doSomeHeavyTask();
        return res.status(200).json({
            status:'Sucess',
            message:`Heavy task completed in ${timeTaken}ms`
        })
    }catch(err){
        return res(500).json({
            status:'Error',
            err:'Internal Server error '
        })
    }

})
//special route for prometheus :

app.get('/metrics',async(req,res)=>{
    res.setHeader('Content-Type',client.register.contentType)
    const metrics = await client.register.metrics()
    res.send(metrics)
})
app.listen(PORT,()=>{
    console.log(`Server is up at the${PORT} `)
})

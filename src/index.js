const express = require('express')
const app = express()
const port = 3000;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
app.get("/", (req, res) => res.send("Hello!"));

app.get("/capacity", (req, res) => res.send({
    "cpu": "20",
    "memory": "100Gi",
    "pods": "20"
}));

app.get("/nodeAddresses", (req, res) => res.send([]));

app.get("/nodeConditions", (req, res) => res.send([
    {
        "type": "Ready",
        "status": "True",
        "lastHeartbeatTime": (new Date()).toISOString(),
        "lastTransitionTime": (new Date()).toISOString(),
        "reason": "KubeletReady",
        "message": "At your service"
    }
]));

app.get("/getPods", (req, res) => res.send([]));


app.listen(port, () => console.log(`Listening on port ${port}`));

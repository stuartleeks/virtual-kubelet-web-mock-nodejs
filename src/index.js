const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000;
var pods = [];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

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

app.get("/getPods", (req, res) => res.send(pods));

app.get("/getPodStatus", (req, res) => {
    var namespace = req.query["namespace"];
    var name = req.query["name"];
    for (let i = 0; i < pods.length; i++) {
        const pod = pods[i];
        if (pod.metadata.namespace === namespace && pod.metadata.name === name){
            res.send(pod.status);
            return;
        }
    }
    res.statusCode = 404;
    res.send();
});

app.post("/createPod", (req, res) => {
    var pod = req.body;

    pod.status.phase = "Running";
    pod.status.conditions = [
        { type: "PodScheduled", status: "true" },
        { type: "Initialized", status: "true" },
        { type: "Ready", status: "true" },
    ];
    var containerStatuses = [];
    for (let i = 0; i < pod.spec.containers.length; i++) {
        const containerSpec = pod.spec.containers[i];
        containerStatuses.push({
            "name": containerSpec.name,
            "image": containerSpec.image,
            "ready": true,
            "restartCount": 0,
            "state": {
                "running": {
                    "startedAt": (new Date()).toISOString()
                },
            }
        });
    }
    pod.status.containerStatuses = containerStatuses;

    pods.push(pod);
    res.send("OK");
});

app.post("/updatePod", (req, res) => {
    var newPod = req.body;

    for (let i = 0; i < pods.length; i++) {
        const pod = pods[i];
        if (pod.metadata.namespace === newPod.metadata.namespace && pod.metadata.name === newPod.metadata.name){
            pods[i] = newPod;
            res.send();
            return;
        }
    }
    res.statusCode = 404;
    res.send();
});

app.delete("/deletePod", (req, res) => {
    var podToDelete = req.body;

    for (let i = 0; i < pods.length; i++) {
        const pod = pods[i];
        if (pod.metadata.namespace === podToDelete.metadata.namespace && pod.metadata.name === podToDelete.metadata.name){
            pods.splice(i, 1);
            res.send();
            return;
        }
    }
    res.statusCode = 404;
    res.send();
});

app.listen(port, () => console.log(`Listening on port ${port}`));

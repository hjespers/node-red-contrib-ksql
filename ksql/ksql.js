"use strict";
module.exports = function(RED) {
    var KafkaRest = require('kafka-rest');
    var util = require("util");

    function ConfluentProxyNode(n) {
        RED.nodes.createNode(this, n);
        this.proxy = n.proxy;
        this.clientid = n.clientid;
    }
    RED.nodes.registerType("rest-proxy", ConfluentProxyNode, {});

    function ConfluentInNode(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.proxy = n.proxy;
        this.cgroup = n.cgroup;
        this.autocommit = n.autocommit;
        this.proxyConfig = RED.nodes.getNode(this.proxy);
        var node = this;
        var stream;
        //var topic = this.topic;
        if (this.proxyConfig) {

            var kafka = new KafkaRest({ 'url': this.proxyConfig.proxy });

            // subscribe to kafka topic (if provided), otherwise print error message
            if (this.topic && this.cgroup) {
                try {
                    kafka.consumer(this.cgroup).join({
                        "format": "binary",
                        "auto.commit.enable": this.autocommit,
                    }, function(err, consumer_instance) {
                        // consumer_instance is a ConsumerInstance object
                        stream = consumer_instance.subscribe(node.topic);

                        stream.on('data', function(msgs) {

                            for(var i = 0; i < msgs.length; i++) {
                                //console.log("Got a message: key=" + msgs[i].key + " value=" + msgs[i].value + " partition=" + msgs[i].partition);
                                var msg = {
                                    topic: node.topic,
                                    offset: msgs[i].offset,
                                    partition: msgs[i].partition,
                                    size: msgs[i].size
                                };
                                if (msgs[i].value) {
                                    msg.payload = msgs[i].value.toString();
                                } else {
                                    msg.payload = ""; //in case of msg with null value
                                }
                                if (msgs[i].key) {
                                    msg.key = msgs[i].key.toString();
                                }
                                try {
                                    node.send(msg);
                                } catch(e) {
                                    // statements
                                    util.log('[confluent] error sending node message: ' +e);
                                }
                            }
                        });

                        stream.on('error', function(err) {
                            console.error('[confluent] Error in our kafka input stream');
                            console.error(err);
                        });

                        node.on('close', function() {
                            consumer_instance.shutdown(function() {
                                util.log("[confluent] consumer shutdown complete.");
                            });
                        });

                    });                
                } catch(e) {
                    util.log('[confluent] Error creating consumer:' +e);
                }
                util.log('[confluent] Created consumer on topic = ' + this.topic); 

            } else {
                node.error('missing required input topic or consumer group');
            }
        } else {
            node.error("missing proxy configuration");
        }

    }
    RED.nodes.registerType("confluent in", ConfluentInNode);

    function ConfluentOutNode(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.proxy = n.proxy;
        this.key = n.key;
        this.partition = Number(n.partition);
        this.proxyConfig = RED.nodes.getNode(this.proxy);
        var node = this;

        if (this.proxyConfig) {

            var kafka = new KafkaRest({ 'url': this.proxyConfig.proxy });

            // add request status in the future like Node-red HTTP nodes do
            // this.status({
            //    fill: "green",
            //    shape: "dot",
            //    text: "connected"
            // });

            this.on("input", function(msg) {
                var partition, key, topic, value;

                //set the partition  
                if (Number.isInteger(this.partition) && this.partition >= 0){
                    partition = this.partition;
                } else if(Number.isInteger(msg.partition) && Number(msg.partition) >= 0) {
                    partition = Number(msg.partition);
                } 

                //set the key
                if ((typeof this.key === 'string') && this.key !== "") {
                    key = this.key;
                } else if ((typeof msg.key === 'string') && msg.key !== "") {
                    key = msg.key;
                } else {
                    key = null;
                }

                //set the topic
                if (this.topic === "" && msg.topic !== "") {
                    topic = msg.topic;
                } else {
                    topic = this.topic;
                }

                //publish the message
                if (msg === null || topic === "") {
                    node.error("request to send a NULL message or NULL topic");
                } else if (msg !== null && topic !== "" ) {
                    //handle different payload types including JSON object
                    if( typeof msg.payload === 'object') {
                        value = JSON.stringify(msg.payload);
                    } else {
                        value = msg.payload.toString();
                    }
                    kafka.topic(topic).produce({'key': key, 'value': value, 'partition': partition}, function(err,res){
                        if (err) {
                            util.log('[confluent] Error publishing message to rest proxy');
                            node.error(err);
                        } else if (res) {
                            node.send(res);
                        }
                    });
                } 
            });

            this.on('close', function() {
                //cleanup
            });

        } else {
            this.error("[confluent] missing proxy configuration");
        }

    }
    RED.nodes.registerType("confluent out", ConfluentOutNode);


    function ConfluentMetaDataNode(n) {
        RED.nodes.createNode(this, n);
        this.topic = n.topic;
        this.proxy = n.proxy;
        this.requestType = n.requestType;
        this.proxyConfig = RED.nodes.getNode(this.proxy);
        var node = this;

        if (this.proxyConfig) {

            var kafka = new KafkaRest({ 'url': this.proxyConfig.proxy });
            

            this.on("input", function(msg) {
                var topic;
                //set the topic
                if (this.topic === "" && msg.topic !== "") {
                    topic = msg.topic;
                } else if (this.topic === "" && msg.topic === "") {
                    //util.log('[confluent] Metadata request does not contain topic in node config or inbound msg.topic');
                    node.error( new Error('Metadata request does not contain topic'));
                    return;
                } else {
                    topic = this.topic;
                }

                // kafka.brokers is a Brokers instance, list() returns a list of Broker instances
                //kafka.brokers.list(function(err, brokers) {
                //    for(var i = 0; i < brokers.length; i++)
                //        console.log(brokers[i].toString());
                //});

                // get metadata about a topic
                kafka.topics.get(topic, function(err, res) {
                    if (err) {
                        util.log("[confluent] Failed to get metadata for topic " + topic + ": " + err);
                        node.error(err);
                    }
                    else {
                        //console.log(topic.toString() + " (raw: " + JSON.stringify(topic.raw) + ")");
                        //console.log('got metadata response = ' + res.toString());
                        var newmsg = {};
                        newmsg.topic = res.name;
                        newmsg.partitions = res.raw.partitions.length;
                        newmsg.payload = res.raw;
                        node.send(newmsg);
                    }
                });               
            });
        } else {
            node.error("missing required proxy configuration");
        }
    }
    RED.nodes.registerType("confluent metadata", ConfluentMetaDataNode);

};
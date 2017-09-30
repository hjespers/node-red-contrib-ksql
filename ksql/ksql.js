"use strict";
module.exports = function(RED) {
    var ksql = require("request");
    var util = require("util");

    function KSQLNode(n) {
        RED.nodes.createNode(this, n);
        this.command = n.command;
        this.rest = n.rest;
        var node = this;

        node.on("input", function(msg) {
            var outmsg = { 
                topic: msg.topic
            };
            var ksqlurl = node.rest + '/ksql';
            var body = {  "ksql": node.command };
            console.log('ksqlurl = ' + ksqlurl);
            console.log('body = ' + util.inspect(body) );
 
            ksql({ 
                method: 'POST', 
                url: ksqlurl, 
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(body)
            }, function ( error, response, body ){
                var data;
                if ( util.isNullOrUndefined(body) ) {
                   console.log('[ksql] Null or Undefined response body');
                } else {
                    //console.log('got reponse body = ' + util.inspect(body) );
                    try {
                        data = JSON.parse( body );
                        outmsg.payload = data;
                        node.send(outmsg);  
                    } catch (e) {
                        console.log('[ksql] caught the following error parsing response: ' + e);
                        outmsg.payload = data;
                        node.send(outmsg);                          
                    }
                }
            });
        });
    }
    RED.nodes.registerType("ksql", KSQLNode);


    function KSQLQueryNode(n) {
        RED.nodes.createNode(this, n);
        this.query = n.query;
        this.rest = n.rest;
        this.query = n.query;
        var node = this;
        //node.on("ready", function(msg) {
            var outmsg = { 
                //topic: msg.topic
            };
            var ksqlurl = node.rest + '/query';
            var body = { "ksql": node.query };
            //console.log('ksqlurl = ' + ksqlurl);
            //console.log('body = ' + util.inspect(body) );

            ksql({ 
                method: 'POST', 
                url: ksqlurl, 
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(body) })
                .on('data', function(chunk) {
                    //console.log('got a chunk = ' + chunk);
                    var data;
                    if ( util.isNullOrUndefined(chunk) || chunk == "" || chunk == "\n") {
                       //console.log('[ksql] Null or Undefined response chunk');
                    } else {
                        //console.log('got reponse body = ' + util.inspect(body) );
                        try {
                            data = JSON.parse( chunk );
                            outmsg.payload = data;
                            node.send(outmsg);  
                        } catch (e) {
                            console.log('[ksql] caught the following error parsing response: ' + e);
                            outmsg.payload = e;
                            node.send(outmsg);                          
                        }
                    }
                })
                .on('error', function(error) {
                    console.log('[ksql] ' + error);
                    //TODO: not sure how to send error downstream or for debug tab in node-red
                    outmsg.error = error;
                    node.send(outmsg);
                }); 
            //});     
    }
    RED.nodes.registerType("ksql query", KSQLQueryNode);

};
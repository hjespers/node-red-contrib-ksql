##node-red-contrib-ksql

Node-RED (http://nodered.org) nodes for KSQL processing of Apache Kafka streams. Written using the HTTP/REST interface provides with the Confluent KSQL Engine (https://github.com/confluentinc/ksql).

Works with Confluent Open Source and Confluent Enterprise distributions (versions 3.3 or greater).


##Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-ksql

Start node-red as normal or use the -v flag for more verbose debugging

	node-red -v

Point your browser to http://localhost:1880

You should see two KSQL nodes in the output area of the pallet on the left side of the screen.
<ul>
    <li>KSQL <img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql.png"></li>
    <li>QUERY <img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql-query.png"></li>
</ul>

The main difference between the two nodes is that the KSQL node has an input so the configured KSQL statement is not executed immediately at startup like the QUERY node does. This is useful for chaining multiple KSQL commands together such that a CREATE statement can be executed before a dependant SELECT statement.

Drag either ksql node to the canvas and double click to configure the KSQL Engine URL, KSQL Command/Query (remember the trailing semicolon ';'), and node name (for display on the canvas).

<img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql-config.png">

Click on the pencil icon to the right of the rest-proxy selection box to configure a rest-proxy URL if one does not already exist.

<img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql-query-config.png">


##Author

Hans Jespersen, https://github.com/hjespers

##Feedback and Support

For more information, feedback, or support see https://github.com/hjespers/node-red-contrib-ksql/issues
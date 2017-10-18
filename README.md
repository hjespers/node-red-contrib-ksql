#node-red-contrib-ksql

Node-RED (http://nodered.org) nodes for KSQL processing of Apache Kafka streams. Written using the HTTP/REST interface provides with the Confluent KSQL Engine (https://github.com/confluentinc/ksql).

Works with Confluent Open Source and Confluent Enterprise distributions (versions 3.3 or greater).


#Install

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-ksql

Start node-red as normal or use the -v flag for more verbose debugging

	node-red -v

Point your browser to http://localhost:1880

You should see two KSQL nodes in the output area of the pallet on the left side of the screen.
<ul>
    <li>input <img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql.png"></li>
    <li>output <img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql-query.png"></li>
</ul>

Drag either ksql node to the canvas and double click to configure the KSQL Engine URL and KSQL commands.

<img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql-config.png">

Click on the pencil icon to the right of the rest-proxy selection box to configure a rest-proxy URL if one does not already exist.

<img src="https://github.com/hjespers/node-red-contrib-ksql/blob/master/images/ksql-query-config.png">

Publish and subscribe just as you would with the mqtt node with some small differences namely:
<ul>
	<li>topics should not contain "/" or "." characters
	<li>kafka wildcard/regex subscriptions are not yet fully tested
	<li>ensure you have unique Group IDs configured unless you want multiple consumers to be in a Kafka consumer group
</ul>

#Author

Hans Jespersen, https://github.com/hjespers

#Feedback and Support

For more information, feedback, or support see https://github.com/hjespers/node-red-contrib-ksql/issues
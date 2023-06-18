const fs = require("fs");
const mqtt = require("mqtt");
require("dotenv").config();

const LOG_PATH = process.env.LOG_PATH;

try {
  console.log("Running cronjob to send classifications to mosquitto");
  fs.readFile(LOG_PATH, "utf8", function (err, data) {
    if (err) throw err;
    const lines = data.split("\n");
    const date = lines[0];
    if (date === "DONE") {
      console.log("File already processed");
      return;
    }

    const client = mqtt.connect("mqtt://44.211.255.54");

    client.on("connect", () => {
      console.log("Connected to the broker");
      lines.shift();

      const classifications = lines.map((line, index) => {
        const classification = line.split("-")[1];
        return {
          index,
          classification,
        };
      });

      client.publish("mosqlink", JSON.stringify(classifications));
      console.log("Sent classifications to mosquitto");

      fs.writeFile(LOG_PATH, "DONE\n" + data, (err) => {
        if (err) throw err;

        console.log(`Saved`);
      });

      client.end();
    });
  });
} catch (error) {
  console.error(error)
}

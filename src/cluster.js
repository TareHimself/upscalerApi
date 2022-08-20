const cors = require("cors");
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const { getImage } = require('./api');
const probe = require('probe-image-size');

app.get('/', async (req, res) => {
  res.send("HI");
});

app.get(/(https:|http:)(\/\/|\/)(.*)/, async (req, res) => {
  try {
    const url = req.params[0] + '//' + req.params[2];
    //const result = await probe(req.params[0]);
    const image = await getImage(url);
    res.contentType('image/png');
    res.send(image);
  } catch (error) {
    console.log(error)
    res.send(error.message)
  }

});

app.listen(process.argv.includes('debug') ? 3006 : 8080, async () => {
  console.log(`http://localhost:${process.argv.includes('debug') ? 3006 : 8080}/`);
});

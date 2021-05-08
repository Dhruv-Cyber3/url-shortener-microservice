require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
  },
});

const Short = mongoose.model("Short", urlSchema);

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/shorturl/:url", async (req, res) => {
  const { url } = req.params;
  const found = await Short.findOne({ _id: url });
  res.redirect(found.longUrl);
});

app.post("/api/shorturl", async (req, res) => {
  const longUrl = req.body.url;
  const re = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  if (!re.test(longUrl)) {
    return res.json({ error: "invalid url" });
  }
  const found = await Short.findOne({ longUrl });
  if (found) {
    res.json({
      original_url: found.longUrl,
      short_url: found._id,
    });
  } else {
    const url = new Short({ longUrl });
    await url.save();
    res.json({
      original_url: longUrl,
      short_url: url._id,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

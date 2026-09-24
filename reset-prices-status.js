#!/usr/bin/env node
/*
  One-off script: resets every object's price to 0 and status to "available",
  clearing any leftover bidding placeholder data (currentBid/bidCount/hoursLeft).

  Run this once from inside your xuo-works project folder:
      node reset-prices-status.js

  After running it, you can delete this file — it's not needed again.
*/

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "src", "data", "objects.json");

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

data.forEach((obj) => {
  obj.price = 0;
  obj.status = "available";
  delete obj.currentBid;
  delete obj.bidCount;
  delete obj.hoursLeft;
});

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n");

console.log(`Done — reset ${data.length} objects to price $0 and status "available".`);

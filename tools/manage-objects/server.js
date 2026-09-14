#!/usr/bin/env node
/*
  XUO.WORKS item manager — a tiny local tool for adding/editing objects
  without hand-editing objects.json or the images folder.

  Run it from inside the xuo-works project folder:
      node tools/manage-objects/server.js
  Then open http://localhost:5757 in your browser.

  When you're done, stop this (Ctrl+C in Terminal) and run:
      git add .
      git commit -m "update objects"
      git push
  to publish your changes to the live site.
*/

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA_PATH = path.join(ROOT, "src", "data", "objects.json");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const HTML_PATH = path.join(__dirname, "index.html");
const PORT = 5757;

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n");
}

function slugify(title) {
  return (
    String(title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "object"
  );
}

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type || "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  if (typeof body === "string" || Buffer.isBuffer(body)) {
    res.end(body);
  } else {
    res.end(JSON.stringify(body));
  }
}

function collectBody(req, cb) {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => cb(Buffer.concat(chunks)));
  req.on("error", () => cb(Buffer.alloc(0)));
}

function ensureImagesDir() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "GET" && url === "/") {
    fs.readFile(HTML_PATH, (err, buf) => {
      if (err) return send(res, 500, "Could not load the tool's page.");
      send(res, 200, buf, "text/html; charset=utf-8");
    });
    return;
  }

  // Serve static files out of the project's public/ folder (e.g. /images/foo.jpg)
  if (req.method === "GET" && !url.startsWith("/api/")) {
    const safePath = path.normalize(url).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(ROOT, "public", safePath);
    if (filePath.startsWith(path.join(ROOT, "public"))) {
      fs.readFile(filePath, (err, buf) => {
        if (err) return send(res, 404, { error: "Not found." });
        const ext = path.extname(filePath).toLowerCase();
        send(res, 200, buf, MIME[ext] || "application/octet-stream");
      });
      return;
    }
  }

  if (req.method === "GET" && url === "/api/objects") {
    try {
      send(res, 200, readData());
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return;
  }

  if (req.method === "POST" && url === "/api/objects") {
    collectBody(req, (buf) => {
      try {
        const payload = JSON.parse(buf.toString("utf8"));
        const data = readData();
        ensureImagesDir();

        const base = slugify(payload.title);
        let id = base;
        let n = 2;
        while (data.some((o) => o.id === id)) {
          id = `${base}-${n}`;
          n++;
        }

        const images = [];
        (payload.images || []).forEach((img, i) => {
          const extMatch = /\.([a-zA-Z0-9]+)$/.exec(img.filename || "");
          const ext = (extMatch ? extMatch[1] : "jpg").toLowerCase();
          const fname = i === 0 ? `${id}.${ext}` : `${id}-${i + 1}.${ext}`;
          const b64 = (img.dataBase64 || "").split(",").pop();
          fs.writeFileSync(path.join(IMAGES_DIR, fname), Buffer.from(b64, "base64"));
          images.push("/images/" + fname);
        });

        const obj = {
          id,
          title: payload.title || id,
          price: Number(payload.price) || 0,
          materials: payload.materials || "",
          dimensions: payload.dimensions || "",
          weightKg: Number(payload.weightKg) || 0,
          year: Number(payload.year) || new Date().getFullYear(),
          description: payload.description || "",
          status: payload.status || "available",
          images,
        };

        if (obj.status === "in_bidding") {
          obj.currentBid = Number(payload.currentBid) || obj.price;
          obj.bidCount = Number(payload.bidCount) || 0;
          obj.hoursLeft = Number(payload.hoursLeft) || 24;
        }

        data.push(obj);
        writeData(data);
        send(res, 200, { ok: true, id });
      } catch (e) {
        send(res, 500, { error: e.message });
      }
    });
    return;
  }

  if (req.method === "PUT" && url.startsWith("/api/objects/")) {
    const id = decodeURIComponent(url.split("/").pop());
    collectBody(req, (buf) => {
      try {
        const patch = JSON.parse(buf.toString("utf8"));
        const data = readData();
        const obj = data.find((o) => o.id === id);
        if (!obj) return send(res, 404, { error: "Item not found." });

        if (patch.price !== undefined) obj.price = Number(patch.price);
        if (patch.title !== undefined) obj.title = patch.title;
        if (patch.status !== undefined) {
          obj.status = patch.status;
          if (obj.status === "in_bidding") {
            if (obj.currentBid === undefined) obj.currentBid = obj.price;
            if (obj.bidCount === undefined) obj.bidCount = 0;
            if (obj.hoursLeft === undefined) obj.hoursLeft = 24;
          } else {
            delete obj.currentBid;
            delete obj.bidCount;
            delete obj.hoursLeft;
          }
        }
        writeData(data);
        send(res, 200, { ok: true });
      } catch (e) {
        send(res, 500, { error: e.message });
      }
    });
    return;
  }

  if (req.method === "DELETE" && url.startsWith("/api/objects/")) {
    const id = decodeURIComponent(url.split("/").pop());
    try {
      let data = readData();
      const before = data.length;
      data = data.filter((o) => o.id !== id);
      if (data.length === before) return send(res, 404, { error: "Item not found." });
      writeData(data);
      send(res, 200, { ok: true });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return;
  }

  send(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(
    `\nXUO.WORKS item manager is running.\n\nOpen this in your browser:\n  http://localhost:${PORT}\n\nWhen you're done, press Ctrl+C here, then in Terminal run:\n  git add .\n  git commit -m "update objects"\n  git push\n`
  );
});

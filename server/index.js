const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Read the items from the JSON file
const itemsData = JSON.parse(fs.readFileSync("./data/items.json"));

// Create a new item
app.post("/items", (req, res) => {
  const newItem = req.body;
  newItem.id = itemsData.length + 1;
  itemsData.push(newItem);

  // Update the JSON file
  fs.writeFileSync("./data/items.json", JSON.stringify(itemsData, null, 2));

  res.status(201).json(newItem);
});

// Read all items with pagination, filtering, and sorting
app.get("/items", (req, res) => {
  let { page, limit, sort } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  sort = sort || "id";

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const sortedItems = [...itemsData].sort((a, b) =>
    a[sort] > b[sort] ? 1 : -1
  );

  const filteredItems = sortedItems.slice(startIndex, endIndex);

  res.json({
    data: filteredItems,
    totalItems: itemsData.length,
    page,
    limit,
  });
});

// Update an item by ID
app.put("/items/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const updatedItem = req.body;

  const itemIndex = itemsData.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
    itemsData[itemIndex] = { ...itemsData[itemIndex], ...updatedItem };

    // Update the JSON file
    fs.writeFileSync("./data/items.json", JSON.stringify(itemsData, null, 2));

    res.json(itemsData[itemIndex]);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// Delete an item by ID
app.delete("/items/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const itemIndex = itemsData.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
    const deletedItem = itemsData.splice(itemIndex, 1)[0];

    // Update the JSON file
    fs.writeFileSync("./data/items.json", JSON.stringify(itemsData, null, 2));

    res.json(deletedItem);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

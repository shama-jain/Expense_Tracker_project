const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let expenses = [];

app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
  const expense = req.body;
  expense.id = Date.now().toString();
  expenses.push(expense);
  res.status(201).json(expense);
});

app.put("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const index = expenses.findIndex((e) => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...req.body };
    res.json(expenses[index]);
  } else {
    res.status(404).send("Not found");
  }
});

app.delete("/api/expenses/:id", (req, res) => {
  expenses = expenses.filter((e) => e.id !== req.params.id);
  res.status(204).send();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

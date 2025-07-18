document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense-form");
  const expenseList = document
    .getElementById("expense-list")
    .querySelector("tbody");
  const summaryDiv = document.getElementById("summary");
  const filterMonth = document.getElementById("filterMonth");
  const darkToggle = document.getElementById("darkToggle");
  const currentPageEl = document.getElementById("currentPage");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");

  const apiUrl = "/api/expenses";

  let allExpenses = [];
  let filteredExpenses = [];
  let currentMonth = "";
  let monthList = [];

  darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", darkToggle.checked);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const editId = form.dataset.editId;

    if (!description || isNaN(amount) || !category || !date) {
      alert("All fields are required.");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${apiUrl}/${editId}` : apiUrl;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, category, date }),
      });

      form.reset();
      delete form.dataset.editId;
      fetchExpenses();
    } catch (err) {
      console.error("Submit error:", err);
    }
  });

  expenseList.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (target.classList.contains("delete-button")) {
      deleteExpense(id);
    } else if (target.classList.contains("edit-button")) {
      const tr = target.closest("tr");
      document.getElementById("description").value = tr.children[0].textContent;
      document.getElementById("amount").value = parseFloat(
        tr.children[1].textContent.replace("$", "")
      );
      document.getElementById("category").value = tr.children[2].textContent;
      document.getElementById("date").value = tr.children[3].textContent;
      form.dataset.editId = id;
    }
  });

  filterMonth.addEventListener("change", () => {
    currentMonth = filterMonth.value;
    filterAndRender();
  });

  prevPageBtn.addEventListener("click", () => {
    if (!currentMonth) return;
    const currentIndex = monthList.indexOf(currentMonth);
    if (currentIndex > 0) {
      currentMonth = monthList[currentIndex - 1];
      filterMonth.value = currentMonth;
      filterAndRender();
    } else {
      alert("No earlier expenses found.");
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (!currentMonth) return;
    const currentIndex = monthList.indexOf(currentMonth);
    if (currentIndex < monthList.length - 1) {
      currentMonth = monthList[currentIndex + 1];
      filterMonth.value = currentMonth;
      filterAndRender();
    } else {
      alert("No more expenses.");
    }
  });

  async function fetchExpenses() {
    const res = await fetch(apiUrl);
    allExpenses = await res.json();

    allExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));

    const months = new Set();
    allExpenses.forEach((exp) => {
      if (exp.date) months.add(exp.date.slice(0, 7));
    });

    monthList = [...months].sort();
    filterAndRender();
  }

  async function deleteExpense(id) {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    fetchExpenses();
  }

  function filterAndRender() {
    if (!currentMonth) {
      filteredExpenses = [...allExpenses];
      renderExpenses(false);
      return;
    }

    filteredExpenses = allExpenses.filter(
      (exp) => exp.date && exp.date.startsWith(currentMonth)
    );

    renderExpenses(true);
  }

  function renderExpenses(showPage) {
    if (filteredExpenses.length === 0) {
      expenseList.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color: #888;">No expenses available</td>
        </tr>
      `;
      currentPageEl.textContent = "";
      updateSummary([]);
      return;
    }

    expenseList.innerHTML = filteredExpenses
      .map(
        (exp) => `
      <tr>
        <td>${exp.description}</td>
        <td>$${exp.amount.toFixed(2)}</td>
        <td>${exp.category}</td>
        <td>${exp.date}</td>
        <td>
          <button class="delete-button" data-id="${exp.id}">Delete</button>
          <button class="edit-button" data-id="${exp.id}">Edit</button>
        </td>
      </tr>
    `
      )
      .join("");

    if (showPage) {
      const pageIndex = monthList.indexOf(currentMonth) + 1;
      currentPageEl.textContent = `Page ${pageIndex}`;
    } else {
      currentPageEl.textContent = "";
    }

    updateSummary(filteredExpenses);
  }

  function updateSummary(expenses) {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    summaryDiv.innerHTML = `<strong>Total Expenses:</strong> $${total.toFixed(
      2
    )}`;
  }

  fetchExpenses();
});

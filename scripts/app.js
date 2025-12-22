import { initDatabase, createDropdownOptions, renderTable } from "./db-utils.js";
const spinner = document.getElementById("spinner");
const filterGroup = document.getElementById("filter-container");
spinner.style.display = "block";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const db = await initDatabase();
    spinner.style.display = "none";
    filterGroup.style.display = "flex";
    const filters = [
      { id: "seriesFilter", column: "series" },
      { id: "gameFilter", column: "game" },
      { id: "categoryFilter", column: "categoryFilter" },
    ];

    filters.forEach(({id, column}) => createDropdownOptions(db, id, column, 1));

    function renderSpeedruns() {
      const whereConditions = [];
      const orderConditions = [];
      const prSort = document.getElementById("prSortFilter").value;
      const rankSort = document.getElementById("rankSortFilter").value;
      const positionSort = document.getElementById("positionSortFilter").value;

      if (prSort === "asc" || prSort === "desc") orderConditions.push(`pr_total_ms ${prSort.toUpperCase()}`);
      if (rankSort === "asc" || rankSort === "desc") orderConditions.push(`rank_weight ${rankSort.toUpperCase()}`);
      if (positionSort === "asc" || positionSort === "desc") orderConditions.push(`position ${positionSort.toUpperCase()}`);
      orderConditions.push("series");
      orderConditions.push("game");

      filters.forEach(({ id, column }) => {
        const value = document.getElementById(id).value;
        if (value !== "All") {
          whereConditions.push(`${column} = '${value}'`);
        }
      });

      const where = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";
      const orderBy = "ORDER BY " + orderConditions.join(", ");
      const query = `SELECT series AS Series, game AS Game, track AS Track, category AS Category, pr AS PR, 
      rank AS Rank, position AS Position, date AS Date, video AS Video FROM records ${where}${orderBy}`;
      const result = db.exec(query);
      renderTable(result, "output");
    }

    const allFilterIds = [
      ...filters.map(f => f.id),
      "prSortFilter",
      "rankSortFilter",
      "positionSortFilter"
    ];

    allFilterIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", renderSpeedruns);
    });

    document.getElementById("resetFilters").addEventListener("click", () => {
      filters.forEach(({ id }) => {
        document.getElementById(id).value = "All";
      });
      document.getElementById("prSortFilter").value = "default";
      document.getElementById("rankSortFilter").value = "default";
      document.getElementById("positionSortFilter").value = "default";
      renderSpeedruns();
    });

    renderSpeedruns();

  } catch(err) {
    console.error("Error loading speedruns:", err);
    document.getElementById("output").textContent = "Error loading data.";
  }
});

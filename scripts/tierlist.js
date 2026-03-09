import { initDatabase, renderTable } from "./db-utils.js";
const spinner = document.getElementById("spinner");
const filterGroup = document.getElementById("filter-container");
spinner.style.display = "block";
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const db = await initDatabase();
    spinner.style.display = "none";
    filterGroup.style.display = "flex";
    const filters = [
      { id: "replayabilityFilter", column: "replayability"},
      { id: "speedrunningnessFilter", column: "speedrunningness"},
      { id: "mechanicsFilter", column: "mechanics"},
      { id: "designFilter", column: "design"},
      { id: "musicFilter", column: "music"},
      { id: "ratingFilter", column: "rating"}
    ];

    function renderTierlist() {
      const replayabilitySort = document.getElementById("replayabilityFilter").value;
      const speedrunningnessSort = document.getElementById("speedrunningnessFilter").value;
      const mechanicsSort = document.getElementById("mechanicsFilter").value;
      const designSort = document.getElementById("designFilter").value;
      const musicSort = document.getElementById("musicFilter").value;
      const ratingSort = document.getElementById("ratingFilter").value;
      const sortConditions = [replayabilitySort, speedrunningnessSort, mechanicsSort, designSort, musicSort, ratingSort];
      const names = ["replayability", "speedrunningness", "mechanics", "design", "music", "rating"];
      let orderBy = ``;
      for(let i = 0; i < sortConditions.length; i++) {
        if(sortConditions[i] == "asc" || sortConditions[i] == "desc") {
          orderBy += `${names[i]} ${sortConditions[i].toUpperCase()},`;
        }
      }
      orderBy = orderBy.slice(0, orderBy.length - 1);
      if(orderBy.length == 0) {
        orderBy = "ORDER BY rating DESC";
      } else {
        orderBy = "ORDER BY " + orderBy;  
      }
      const query = `
        SELECT game AS Game, replayability AS Replayability, speedrunningness AS Speedrunningness, mechanics AS Mechanics, design AS Design,
          music AS Music, rating AS Rating FROM tierlist ${orderBy}`;
      const result = db.exec(query);
      renderTable(result, "tierlist-output");
    }
    filters.forEach(obj => {
      document.getElementById(obj.id).addEventListener("change", renderTierlist);
    });

    document.getElementById("resetTierlistFilters").addEventListener("click", () => {
      filters.forEach(({ id }) => {
        document.getElementById(id).value = "default";
      });
      renderTierlist();
    });

    renderTierlist();
  } catch (err) {
    console.error("Error loading tierlist:", err);
    document.getElementById("tierlist-output").textContent = "Error loading data.";
  }
});

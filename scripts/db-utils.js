export async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => "../sql-wasm/sql-wasm.wasm"
  });

  const response = await fetch("../database/Personal.db");
  const buffer = await response.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));
  return db;
}

export function createDropdownOptions(db, id, column, num) {
  let result = null;
  if(num == 1) {
    result = db.exec(`SELECT DISTINCT ${column} FROM records`);
  } else if(num == 2) {
    result = db.exec(`SELECT DISTINCT ${column} FROM achievements`);
  }
  const values = result[0].values.map(row => row[0]);
  values.sort((a, b) => a.localeCompare(b));
  const select = document.getElementById(id);
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

export function renderTable(result, outputId) {
  const output = document.getElementById(outputId);
  output.innerHTML = "";

  if (!result || result.length === 0) {
    output.textContent = "No data found.";
    return;
  }

  const { columns, values } = result[0];
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  values.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach((cell, i) => {
      const td = document.createElement("td");
      const colName = columns[i];
      if (colName === "Video") {
        if (cell && typeof cell === "string" && cell.trim().toLowerCase() !== "n/a") {
          td.innerHTML = `<a href="${cell}" class="video-link" target="_blank" rel="noopener noreferrer">🎬</a>`;
        } else {
          td.textContent = "N/A";
        }
      } else {
        td.textContent = cell;
      }         
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  output.appendChild(table);
}


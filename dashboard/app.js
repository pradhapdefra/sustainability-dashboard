
let trendChart;
let radarChart;
let currentProject = null;

/* =========================
   Project loading
========================= */

async function loadProjects() {
  return fetch("../data/index.json").then(r => r.json());
}

function populateProjectSelector(projects) {
  const select = document.getElementById("projectSelect");
  if (!select) return;

  // Populate dropdown ONLY ONCE
  if (select.options.length === 0) {
    projects.forEach(project => {
      const opt = document.createElement("option");
      opt.value = project;
      opt.textContent = project;
      select.appendChild(opt);
    });
  }

  // ✅ Set default project ONLY if not already set
  if (!currentProject) {
    currentProject = projects[0];
  }

  // ✅ Reflect currentProject in dropdown
  select.value = currentProject;

  // ✅ Handle user change
  select.onchange = () => {
    currentProject = select.value;
    console.log("Project changed to:", currentProject);
    initForProject(currentProject);
  };
}
/* =========================
   Utilities
========================= */

function scoreLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs work";
}

function formatDateTimeAmPm(isoString) {
  const date = new Date(isoString);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function metricValue(metric) {
  if (typeof metric === "number") return metric;
  if (typeof metric === "object" && metric !== null && "score" in metric) {
    return metric.score;
  }
  return 0;
}

/* =========================
   Data loading
========================= */

async function loadLatest(project) {
  return fetch(`../data/${project}/latest.json`).then(r => r.json());
}

async function loadHistory(project) {
  const idx = await fetch(`../data/${project}/index.json`).then(r => r.json());

  const snapshots = await Promise.all(
    idx.map(f =>
      fetch(`../data/${project}/${f}`).then(r => r.json())
    )
  );

  return snapshots.sort(
    (a, b) =>
      new Date(a.analysis_summary.timestamp) -
      new Date(b.analysis_summary.timestamp)
  );
}

function showTab(tabId) {
  // Hide all tabs
  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });

  // Show selected tab
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.style.display = "block";
  }

  // Update nav active state
  document.querySelectorAll(".tab-link").forEach(link => {
    link.classList.remove("active");
  });

  const activeLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}
``

/* =========================
   Overview
========================= */

function renderRadar(metrics) {
  if (radarChart) radarChart.destroy();

  const labels = [
    "Overall score",
    "Energy efficiency",
    "Resource utilisation",
    "Performance",
    "Code quality",
    "Maintainability",
    "CPU efficiency",
    "Memory efficiency",
    "Green coding"
  ];

  const currentProject = [
    metricValue(metrics.overall_score),
    metricValue(metrics.energy_efficiency),
    metricValue(metrics.resource_utilization),
    metricValue(metrics.performance_optimization),
    70,
    metricValue(metrics.sustainable_practices),
    60,
    65,
    55
  ].map(v => Number(v) || 0);

  const industryAverage = Array(labels.length).fill(75);
  const targetGoals = Array(labels.length).fill(85);

  radarChart = new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Current Project",
          data: currentProject,
          borderColor: "#2E7D32",
          backgroundColor: "rgba(46,125,50,0.18)",
          pointBackgroundColor: "#2E7D32",
          borderWidth: 2
        },
        {
          label: "Industry Average",
          data: industryAverage,
          borderColor: "#1976D2",
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        },
        {
          label: "Target Goals",
          data: targetGoals,
          borderColor: "#FBC02D",
          borderDash: [2, 2],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => {
              const value = Number(ctx.raw) || 0;
              return `${ctx.dataset.label}: ${value}/100 – ${scoreLabel(value)}`;
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20 }
        }
      }
    }
  });
}

function renderKeyFindings(latest) {
  const score = latest.sustainability_metrics.overall_score;
  const label = scoreLabel(score);

  document.getElementById("keyFindings").innerHTML = `
    <ul>
      <li><strong>Overall score:</strong> ${score}/100
        <span class="badge ${label.toLowerCase().replace(" ", "-")}">${label}</span>
      </li>
      <li><strong>Files analysed:</strong> ${latest.analysis_summary.file_count}</li>      
      <li>
        <strong>Last scan:</strong>
        ${formatDateTimeAmPm(latest.analysis_summary.timestamp)}
      </li>
    </ul>
  `;
}

/* =========================
   Trend
========================= */

function renderTrend(history) {
  if (trendChart) trendChart.destroy();

  trendChart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: history.map(h =>
        h.analysis_summary.timestamp.substring(0, 10)
      ),
      datasets: [{
        label: "Overall Sustainability Score",
        data: history.map(h =>
          h.sustainability_metrics.overall_score
        ),
        borderColor: "#1976D2",
        backgroundColor: "rgba(25,118,210,0.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: { min: 0, max: 100 }
      }
    }
  });
}

/* =========================
   File‑level Green Coding Assessment
========================= */

/* function renderFileLevelAssessment(latest) {
  const tbody = document.querySelector("#fileLevelTable tbody");
  tbody.innerHTML = "";

  if (!latest.file_scores || latest.file_scores.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">No file‑level sustainability data available.</td>
      </tr>
    `;
    return;
  }

  const topFiles = [...latest.file_scores]
    .sort((a, b) => a.green_score - b.green_score)
    .slice(0, 10);

  topFiles.forEach(file => {
    const statusClass = file.status.toLowerCase().replace(" ", "-");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${file.path}</td>
      <td><strong>${file.green_score}/100</strong></td>
      <td>${file.issues} issues</td>
      <td>${file.practices} found</td>
      <td>${file.energy_impact}</td>
      <td>
        <span class="badge ${statusClass}">
          ${file.status.toUpperCase()}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
} */


  
function renderFileLevelAssessment(latest) {
  const tbody = document.querySelector("#fileLevelTable tbody");
  tbody.innerHTML = "";

  if (!latest.file_scores || latest.file_scores.length === 0) {
    tbody.innerHTML = `
      <tr class="govuk-table__row">
        <td class="govuk-table__cell" colspan="6">
          No file‑level sustainability data available.
        </td>
      </tr>
    `;
    return;
  }

  // Sort by lowest green score (worst first) and take top 10
  const files = [...latest.file_scores]
    .sort((a, b) => a.green_score - b.green_score)
    .slice(0, 10);

  files.forEach(file => {
    const row = document.createElement("tr");
    row.className = "govuk-table__row";

    // Determine status tag colour (GDS tags)
    let statusTagClass = "govuk-tag--green";
    if (file.status === "Fair") statusTagClass = "govuk-tag--yellow";
    if (file.status === "Needs work") statusTagClass = "govuk-tag--red";

    row.innerHTML = `
      <th scope="row" class="govuk-table__header">
        ${file.path}
      </th>

      <td class="govuk-table__cell">
        <strong>${file.green_score}/100</strong>
      </td>

      <td class="govuk-table__cell">
        ${file.issues} issue${file.issues === 1 ? "" : "s"}
      </td>

      <td class="govuk-table__cell">
        ${file.practices} found
      </td>

      <td class="govuk-table__cell">
        ${file.energy_impact || "N/A (static)"}
      </td>

      <td class="govuk-table__cell">
        <strong class="govuk-tag ${statusTagClass}">
          ${file.status.toUpperCase()}
        </strong>
      </td>
    `;

    tbody.appendChild(row);
  });
}

/* =========================
   Issues, Opportunities, Practices
========================= */

function renderHighPriorityIssues(latest) {
  const list = document.getElementById("highPriorityIssues");
  list.innerHTML = "";

  if (!latest.issues || latest.issues.length === 0) {
    list.innerHTML = `<li>No high priority issues detected.</li>`;
    return;
  }

  latest.issues.forEach(issue => {
    const li = document.createElement("li");
    li.innerText = issue.message;
    list.appendChild(li);
  });
}

/* function renderOptimisationOpportunities(latest) {
  const list = document.getElementById("optimisationOpportunities");
  list.innerHTML = "";

  if (!latest.recommendations || latest.recommendations.length === 0) {
    list.innerHTML = `<li>No optimisation opportunities identified.</li>`;
    return;
  }

  latest.recommendations.forEach(rec => {
    const li = document.createElement("li");
    li.innerText = rec;
    list.appendChild(li);
  });
} */

function renderHomeSummary(latest) {
  // Files analysed
  const filesCountEl = document.getElementById("filesAnalysedCount");
  if (filesCountEl) {
    filesCountEl.innerText = latest.analysis_summary.file_count;
  }

  // Best practices detected (sum of practice_details across files)
  const bestPracticesEl = document.getElementById("bestPracticesCount");
  if (bestPracticesEl) {
    const totalPractices = latest.file_scores
      ? latest.file_scores.reduce(
        (sum, file) =>
          sum + (file.practice_details ? file.practice_details.length : 0),
        0
      )
      : 0;

    bestPracticesEl.innerText = totalPractices;
  }
}


function renderGreenPractices(latest) {
  const list = document.getElementById("greenPractices");
  list.innerHTML = "";

  if (!latest.file_scores) {
    list.innerHTML = "<li>No green coding practices detected yet.</li>";
    return;
  }

  const practices = latest.file_scores
    .filter(f => f.practice_details && f.practice_details.length > 0)
    .slice(0, 5);

  if (practices.length === 0) {
    list.innerHTML = "<li>No strong green coding practices detected yet.</li>";
    return;
  }

  practices.forEach(file => {
    file.practice_details.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${file.path}</strong><br/>
        ${p.message}
      `;
      list.appendChild(li);
    });
  });
}

/* =========================
   Penalties
========================= */

function renderPenalties(latest) {
  const list = document.getElementById("penaltyBreakdown");
  list.innerHTML = "";

  if (!latest.penalties || latest.penalties.length === 0) {
    list.innerHTML = `<li>No repository‑level penalties were applied.</li>`;
    return;
  }

  latest.penalties.forEach(p => {
    const li = document.createElement("li");

    // Clear, rule‑focused wording
    li.innerHTML = `
      <strong>${p.impact}‑point penalty</strong><br/>
      ${p.message}
    `;

    list.appendChild(li);
  });

  // ✅ Explanatory clarification (GDS‑approved pattern)
  const explanation = document.createElement("div");
  explanation.className = "govuk-inset-text brand__border-color-m ";
  explanation.innerHTML = `
    Penalties are fixed, repository‑level adjustments.
    A ${latest.penalties[0].impact}‑point penalty is applied when a
    structural risk threshold is exceeded, such as having more than
    60% of files in a single directory.
  `;

  list.after(explanation);
}

function renderPerformanceIndicators(latest, history) {
  const totalFiles = latest.analysis_summary.file_count;

  // Complexity pressure
  const complexity =
    totalFiles > 600 ? "High" :
      totalFiles > 300 ? "Moderate" : "Low";

  // Configuration footprint
  const largestDir = latest.directory_scores
    .reduce((max, d) => d.file_count > max.file_count ? d : max, { file_count: 0 });

  // API surface area
  const apiSurface =
    totalFiles > 500 ? "Large" :
      totalFiles > 250 ? "Medium" : "Small";

  // Performance trend
  let trend = "Stable";
  if (history.length >= 2) {
    const prev = history[history.length - 2]
      .sustainability_metrics.performance_optimization;
    const curr = latest.sustainability_metrics.performance_optimization;

    if (curr > prev) trend = "Improving";
    if (curr < prev) trend = "Declining";
  }

  document.getElementById("complexityPressure").innerText = complexity;
  document.getElementById("configFootprint").innerText =
    `${largestDir.path} (${largestDir.file_count})`;
  document.getElementById("apiSurface").innerText = apiSurface;
  document.getElementById("performanceTrend").innerText = trend;
}

function renderPerformanceSuggestions(latest, history) {
  const list = document.getElementById("performanceSuggestions");
  if (!list) return;

  list.innerHTML = "";

  const totalFiles = latest.analysis_summary.file_count;

  // 1. Complexity pressure
  if (totalFiles > 300) {
    addPerformanceSuggestion(
      list,
      "Reduce complexity pressure",
      "Split large directories or modules to reduce change and review cost."
    );
  }

  // 2. Configuration footprint
  if (latest.directory_scores && latest.directory_scores.length > 0) {
    const largestDir = latest.directory_scores.reduce(
      (max, d) => d.file_count > max.file_count ? d : max,
      { file_count: 0 }
    );

    if (largestDir.file_count > 200) {
      addPerformanceSuggestion(
        list,
        "Reduce configuration footprint",
        `The '${largestDir.path}' area contains many files. Review for consolidation, reuse, or removal of unused configuration.`
      );
    }
  }

  // 3. API surface area
  if (totalFiles > 500) {
    addPerformanceSuggestion(
      list,
      "Reduce API surface area",
      "Review APIs and policies to identify opportunities for deprecation or consolidation."
    );
  }

  // 4. Performance trend
  if (history.length >= 2) {
    const prev = history[history.length - 2]
      .sustainability_metrics.performance_optimization;
    const curr = latest.sustainability_metrics.performance_optimization;

    if (curr < prev) {
      addPerformanceSuggestion(
        list,
        "Address declining performance trend",
        "Recent changes indicate increasing performance risk. Review recent merges for large structural changes."
      );
    }
  }

  // Fallback – always show something
  if (list.children.length === 0) {
    list.innerHTML = `
      <li>
        ✅ No immediate performance improvements identified.
        Continue monitoring structural indicators.
      </li>
    `;
  }
}

function addPerformanceSuggestion(list, title, description) {
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${title}</strong><br/>
    <span>${description}</span>
  `;
  list.appendChild(li);
}

/* function renderOptimisationOpportunities(latest) {
  const container = document.getElementById("optimisationOpportunities");
  container.innerHTML = "";

  if (!latest.file_scores || latest.file_scores.length === 0) {
    container.innerHTML = "<p>No optimisation opportunities detected.</p>";
    return;
  }

  // Only files with issues
  const filesWithIssues = latest.file_scores.filter(
    f => f.issue_details && f.issue_details.length > 0
  );

  if (filesWithIssues.length === 0) {
    container.innerHTML = "<p>No optimisation opportunities detected.</p>";
    return;
  }

  filesWithIssues.slice(0, 5).forEach(file => {
    const block = document.createElement("div");
    block.className = "optimisation-block";

    block.innerHTML = `
      <div class="optimisation-header">
        <strong>Optimisation in ${file.path}</strong>
        <span class="badge ${file.status.toLowerCase()}">${file.status}</span>
      </div>

      <div class="optimisation-body">
        ${file.issue_details.map(issue => `
          <div class="issue-card ${issue.severity}">
            <strong>${issue.message}</strong>
            <p>
              <em>Suggestion:</em>
              ${issue.suggestion && issue.suggestion.trim()
        ? issue.suggestion
        : "No specific suggestion available yet. This rule currently reports the issue only."}
            </p>
            ${issue.example ? `<pre>${issue.example}</pre>` : ""}
          </div>
        `).join("")}
      </div>
    `;

    container.appendChild(block);
  });
} */


function renderOptimisationOpportunities(latest) {
  const container = document.getElementById("optimisationOpportunities");
  container.innerHTML = "";

  const filesWithIssues = latest.file_scores?.filter(
    file => file.issue_details && file.issue_details.length > 0
  );

  if (!filesWithIssues || filesWithIssues.length === 0) {
    container.innerHTML = `
      <p class="govuk-hint">
        No optimisation opportunities identified.
      </p>
    `;
    return;
  }

  filesWithIssues.forEach(file => {
    file.issue_details.forEach(issue => {

      const card = document.createElement("div");
      card.className = "govuk-summary-card";

      card.innerHTML = `
        <div class="govuk-summary-card__title-wrapper">
          <h3 class="govuk-summary-card__title">
            ${file.path}
          </h3>
        </div>

        <div class="govuk-summary-card__content">
          <dl class="govuk-summary-list govuk-summary-list--no-border">

            <div class="govuk-summary-list__row">
              <dt class="govuk-summary-list__key">
                Issue identified
              </dt>
              <dd class="govuk-summary-list__value">
                ${issue.message}
              </dd>
            </div>

            <div class="govuk-summary-list__row">
              <dt class="govuk-summary-list__key">
                Recommended action
              </dt>
              <dd class="govuk-summary-list__value">
                ${
                  issue.suggestion && issue.suggestion.trim()
                    ? issue.suggestion
                    : "Review this file to reduce structural and maintenance risk."
                }
              </dd>
            </div>

          </dl>

          ${
            issue.example && issue.example.trim()
              ? `
              <details class="govuk-details govuk-!-margin-top-3">
                <summary class="govuk-details__summary">
                  <span class="govuk-details__summary-text">
                    Example
                  </span>
                </summary>
                <div class="govuk-details__text">
                  ${issue.example}
                </div>
              </details>
              `
              : ""
          }
        </div>
      `;

      container.appendChild(card);
    });
  });
}

/* =========================
   Init
========================= */

async function initForProject(project) {

  console.log("Loading data for:", project);

  const latest = await loadLatest(project);
  const history = await loadHistory(project);


  document.getElementById("generatedAt").innerText =
    formatDateTimeAmPm(latest.analysis_summary.timestamp);

  renderHomeSummary(latest);
  renderRadar(latest.sustainability_metrics);
  renderKeyFindings(latest);
  renderPerformanceIndicators(latest, history);
  renderPerformanceSuggestions(latest, history);
  renderTrend(history);
  renderFileLevelAssessment(latest);
  renderHighPriorityIssues(latest);
  renderOptimisationOpportunities(latest);
  renderGreenPractices(latest);
  renderPenalties(latest);
}
async function init() {
  const projects = await loadProjects();

  populateProjectSelector(projects);

  // ✅ Home is the default view
  showTab("home");

  // ✅ Load data once for selected project
  initForProject(currentProject);
}

init();
$commits = @(
    @{ m="Initialize backend and server setup"; add="backend/package.json backend/package-lock.json backend/server.js backend/config .gitignore"; d="2026-03-01T10:00:00" },
    @{ m="Add User and QueryHistory models"; add="backend/models"; d="2026-03-02T11:30:00" },
    @{ m="Implement auth and query controllers"; add="backend/controllers"; d="2026-03-03T13:45:00" },
    @{ m="Add backend routes and LLM services"; add="backend/routes backend/services"; d="2026-03-04T15:20:00" },
    @{ m="Initialize React frontend via Vite"; add="frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/src/App.jsx"; d="2026-03-05T09:00:00" },
    @{ m="Add frontend API service and Context providers"; add="frontend/src/services frontend/src/context"; d="2026-03-06T10:15:00" },
    @{ m="Add global CSS and theme styles"; add="frontend/src/styles"; d="2026-03-07T11:45:00" },
    @{ m="Create reusable UI components"; add="frontend/src/components/ThemeToggle.jsx frontend/src/components/Sidebar.jsx frontend/src/components/QueryBox.jsx"; d="2026-03-08T14:30:00" },
    @{ m="Add ModelResponseCard and SummaryCard components"; add="frontend/src/components/ModelResponseCard.jsx frontend/src/components/SummaryCard.jsx"; d="2026-03-09T16:00:00" },
    @{ m="Implement Home, Login, and Dashboard pages"; add="."; d="2026-03-10T18:20:00" }
)

foreach ($c in $commits) {
    $env:GIT_AUTHOR_DATE = $c.d
    $env:GIT_COMMITTER_DATE = $c.d
    
    $files = $c.add -split ' '
    foreach ($f in $files) {
        git add $f
    }
    
    git commit -m $c.m
}

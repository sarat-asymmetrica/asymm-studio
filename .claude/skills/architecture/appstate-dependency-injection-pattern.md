---
name: appstate-dependency-injection-pattern
description: Unified application state pattern using Arc-wrapped AppState struct for dependency injection in Rust web servers. Provides database pools, configuration, Vedic optimizations, and shared services to all route handlers. Use in Axum/Actix-web for clean DI without globals. Thread-safe with Arc, type-safe extraction with State extractor.
category: architecture
version: 1.0.0
created: 2025-11-01
last_used: 2025-10-25
success_rate: 29/29 route modules
source_wave: Wave 2A-2C, Backend Architecture Standardization
---

# AppState Dependency Injection Pattern

**One-sentence purpose:** Use unified Arc-wrapped AppState struct to inject dependencies (database pools, config, services) into all route handlers.

**Discovered:** Waves 2A-2C (October 2025) during backend architecture standardization across 29 route modules

---

## Purpose

### What This Skill Does

Creates single AppState struct containing all shared application resources:
- Database connection pools
- Configuration (env vars, secrets)
- Vedic mathematical backend (optimizations)
- Session managers, caches, etc.

Wraps in `Arc<AppState>` for thread-safe sharing, passes to every route handler via Axum State extractor.

### Why It Exists

Without unified state:
- Route handlers use global variables (unsafe, untestable)
- Database pools created per-request (connection exhaustion)
- Configuration loaded repeatedly (slow, inconsistent)
- No dependency injection (tight coupling, hard to mock)

**With this skill:**
- Thread-safe shared state (`Arc` provides atomic reference counting)
- Type-safe dependency extraction (`State<Arc<AppState>>` in handlers)
- Easy testing (inject mock AppState)
- Single source of truth for all dependencies

---

## The Pattern

### Step 1: Define AppState Struct

```rust
pub struct AppState {
    pub db: Arc<PgPool>,              // Database connection pool
    pub config: Arc<Config>,          // Application configuration
    pub vedic: Arc<VedicBackend>,     // Vedic math optimizations
    pub session_manager: Arc<SessionManager>, // HTX sessions
}

impl AppState {
    pub async fn new(database_url: &str) -> Result<Self, Error> {
        let db = PgPoolOptions::new()
            .max_connections(10)
            .connect(database_url)
            .await?;

        let config = Config::from_env()?;
        let vedic = VedicBackend::new();
        let session_manager = SessionManager::new();

        Ok(Self {
            db: Arc::new(db),
            config: Arc::new(config),
            vedic: Arc::new(vedic),
            session_manager: Arc::new(session_manager),
        })
    }
}
```

### Step 2: Initialize in main.rs

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let state = Arc::new(AppState::new(&env::var("DATABASE_URL")?).await?);

    let app = Router::new()
        .route("/api/customers", get(list_customers))
        .with_state(state); // Pass state to all routes

    axum::Server::bind(&"0.0.0.0:8080".parse()?)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
```

### Step 3: Extract in Route Handlers

```rust
async fn list_customers(
    State(state): State<Arc<AppState>>,
) -> ApiResult<Json<AsymmSocketResponse<Vec<Customer>>>> {
    // Access database pool
    let customers = sqlx::query_as::<_, Customer>("SELECT * FROM customers")
        .fetch_all(&*state.db)  // Deref Arc to get PgPool
        .await?;

    // Access Vedic optimizations
    let batch_size = state.vedic.batch_size_for(customers.len());

    // Access configuration
    let max_results = state.config.max_results_per_page;

    Ok(Json(AsymmSocketResponse::ok(customers, "customers_LIST", start)))
}
```

---

## Why It Works

**Thread safety:**
- `Arc` = Atomic Reference Counted smart pointer
- Multiple threads can clone Arc (cheap, just increments counter)
- Inner data immutable (or uses interior mutability like RwLock)

**Type safety:**
- State extractor validates Arc<AppState> at compile time
- Can't forget to pass state (compiler error if missing)

**Performance:**
- Database pool reused across requests (no connection overhead)
- Config loaded once at startup (not per-request)

---

## Evidence

**Source:** Waves 2A-2C, 29 route modules
**Quality:** 9.3/10 (consistent state access)
**Success Rate:** 29/29 modules use pattern

---

## Example

**Before (globals, unsafe):**
```rust
static mut DB_POOL: Option<PgPool> = None;

async fn list_customers() -> Json<Vec<Customer>> {
    unsafe {
        let pool = DB_POOL.as_ref().unwrap(); // UNSAFE!
        sqlx::query_as::<_, Customer>("SELECT * FROM customers")
            .fetch_all(pool)
            .await
            .unwrap()
    }
}
```

**After (AppState, safe):**
```rust
async fn list_customers(
    State(state): State<Arc<AppState>>,
) -> ApiResult<Json<Vec<Customer>>> {
    let customers = sqlx::query_as::<_, Customer>("SELECT * FROM customers")
        .fetch_all(&*state.db)  // Safe, thread-safe
        .await?;
    Ok(Json(customers))
}
```

---

## Success Indicators

✅ All dependencies in AppState struct
✅ All route handlers extract State<Arc<AppState>>
✅ No global variables for shared resources
✅ Database pool reused (not recreated per-request)

❌ Using global static variables
❌ Creating database pools in route handlers
❌ Not using Arc (multiple ownership issues)

---

**Maintained by:** Dr. Amara Osei
**Last reviewed:** 2025-11-01

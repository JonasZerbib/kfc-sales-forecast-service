# Implement Fullstack Daily Sales Forecast Service for KFC Stores

**Type:** New Feature / Service
**Priority:** High
**Repository Name:** `kfc-sales-forecast-service`
**Deadline:** Estimated effort: 4-5 hours

***

## Project Overview & Goal

This project defines the scope for building a full-stack service to enhance **KFC's operational efficiency** by predicting daily sales for **multiple store locations**. The goal is to help cooks prepare products in advance and minimize waste.

The solution requires the creation of both a **back-end** service and a **front-end** interface.

***

## Functional Requirements (Business Logic)

The application must be architected to support a multi-store environment, with each store managing multiple products.

### Prediction Generation & Algorithm

*   Create a service that generates a forecast sales prediction **daily per store**.
*   The generator runs **once a day** and creates sales predictions for **the next day**.
*   The prediction algorithm is a simple **Average (AVG) calculation**.
*   **Prediction Granularity:** Sales prediction data must be highly detailed and include:
    *   The time **(per hour)**.
    *   The **Product**.
    *   The **Related Store**.
*   **AVG Data Scope:** The look-back period for the AVG calculation is flexible, but it can use up to the **past 14 days** of historical data.
*   **Data Source Assumption:** **Mock historical sales data** must be generated and used to feed the AVG calculation, as source data was not provided.

### Data Retrieval & UI

*   Data should be **persisted** in a database.
*   The system must allow retrieval of stored forecasts by specific criteria.
*   Expose a **UI** to display forecasts:
    *   Show a list of available stores.
    *   Allow the user to choose a specific forecast date to display (to view both future and historical forecasts).

***

## Technical Requirements

The solution must adhere to high standards of deployment, stability, and maintainability.

### Core Technicals

*   Create both **back-end & front-end** components.
*   Use stable versions of all technologies.
*   Free choice of programming language, libraries, frameworks, or infrastructure.
*   Use **known state management tools** that fit the project's business requirements.
*   Must be **Well-optimized** (*Lightweight* and *Fast*).

### Infrastructure & Deployment

*   **Database:** Use a database for data persistence (e.g., PostgreSQL).
*   **Containerization:** A working **Docker image** which includes a **fully working DB**.
    *   *Clarification:* The DB must be initialized with the necessary schema and tables upon container startup (no manual setup required).

### Configuration Management

*   **External Configuration:** Any configuration that the administrator might want to change (e.g., forecast generation interval, DB connection credentials) **must be managed by an external file** (e.g., `.env` or `docker-compose.yml`), ensuring the core application code remains static.

### Bonus

*   Well-designed UI and effective UX.

***

## Acceptance Criteria

1.  A fully functional full-stack application is committed to the Git repository (`kfc-sales-forecast-service`).
2.  The application successfully builds and runs via the single provided Docker image, with the DB starting and initializing correctly.
3.  The back-end service successfully performs a scheduled (simulated) daily prediction run for multiple mock stores.
4.  Predictions are stored in the database with hourly, product, and store granularity.
5.  The front-end allows filtering and display of predictions by both store and specific date.
6.  All configuration parameters are successfully managed via an external configuration file.
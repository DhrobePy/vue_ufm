# Fleet Module Deployment Instructions

## Step 1: Pull on server
```bash
cd ~/public_html  # or wherever the site is
git pull origin main
touch tmp/restart.txt
```

## Step 2: Run the fleet database migration
Run `server/db/fleet_migration.sql` on the cPanel MySQL database `ujjalfmc_vue_ufm`:

Option A — via cPanel phpMyAdmin:
1. Open phpMyAdmin → select `ujjalfmc_vue_ufm`
2. Click "Import" → select `server/db/fleet_migration.sql`
3. Click "Go"

Option B — via SSH:
```bash
mysql -u ujjalfmc_vue_ufm -p'327926Pass' ujjalfmc_vue_ufm < server/db/fleet_migration.sql
```

## What the migration creates:
- `fleet_vehicles` — comprehensive vehicle table
- `fleet_drivers` — comprehensive driver table
- `vehicle_documents` — expiry tracking
- `vehicle_tyre_history`, `vehicle_battery_history`
- `driver_documents`, `driver_employment_history`
- `trips` — trip management with workflow
- `trip_advances`, `trip_expenses`
- `fleet_fuel_logs` — with mileage tracking
- `maintenance_requests`, `maintenance_tasks`, `maintenance_materials`
- `preventive_maintenance_rules`
- `fleet_items`, `fleet_item_categories`
- `fleet_purchases`, `fleet_purchase_items`

All tables use `IF NOT EXISTS` — safe to run multiple times.

## New pages available after deploy:
- `/fleet` — Fleet Operations Dashboard
- `/fleet/vehicles` — Vehicle list with status filter cards
- `/fleet/vehicles/create` — Add vehicle
- `/fleet/vehicles/:id` — Vehicle detail with 6 tabs (Summary, Documents, Trips, Fuel, Maintenance, Tyres)
- `/fleet/vehicles/:id/edit` — Edit vehicle (all fields + driver assignment)
- `/fleet/drivers` — Driver list
- `/fleet/drivers/create` — Add driver with documents & employment history
- `/fleet/drivers/:id` — Driver detail with 4 tabs
- `/fleet/drivers/:id/edit` — Edit driver details
- `/fleet/trips` — Trip Console with filter tabs (All/Today/Ongoing/Unreported)
- `/fleet/trips/create` — Create trip with customer search, vehicle/driver select
- `/fleet/trips/:id` — Trip detail with Advances/Expenses/Profitability tabs + workflow buttons
- `/fleet/trips/:id/print` — Printable Trip Sheet (no layout, print-ready PDF)
- `/fleet/maintenance` — Maintenance requests list
- `/fleet/maintenance/create` — Log maintenance with tasks + materials
- `/fleet/maintenance/:id` — Maintenance detail with status workflow
- `/fleet/maintenance/rules` — Preventive Maintenance Rules CRUD
- `/fleet/fuel` — Fuel logs with mileage calculation
- `/fleet/fuel/create` — Log fuel fill-up
- `/fleet/fuel/efficiency` — Fuel Efficiency Report (per vehicle + monthly trend)
- `/fleet/purchases` — Fleet Purchase Orders list
- `/fleet/purchases/create` — Create PO with line items and auto stock receive
- `/fleet/purchases/:id` — PO detail with approve/receive workflow + payment recording
- `/fleet/items` — Fleet inventory (parts & supplies)
- `/fleet/reports` — Reports navigation hub

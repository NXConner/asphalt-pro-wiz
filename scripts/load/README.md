# Load Testing

Two options are provided:

- k6: `BASE_URL=http://localhost:8080 k6 run scripts/load/k6-estimate.js`
- Artillery: `artillery run scripts/load/artillery.yml`

These simulate users hitting the home page and verify the app renders.

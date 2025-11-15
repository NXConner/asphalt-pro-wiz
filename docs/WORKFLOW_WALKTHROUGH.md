# Complete Workflow Walkthrough

## From Area Measurement to Job Completion

This document provides a comprehensive step-by-step guide for the complete workflow in the Pavement Performance Suite, from capturing area measurements to generating final estimates and managing job status.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Step 1: Capture Area Measurements](#step-1-capture-area-measurements)
3. [Step 2: Configure Job Details](#step-2-configure-job-details)
4. [Step 3: Estimator Studio - Scope Step](#step-3-estimator-studio---scope-step)
5. [Step 4: Estimator Studio - Materials Step](#step-4-estimator-studio---materials-step)
6. [Step 5: Estimator Studio - Striping Step](#step-5-estimator-studio---striping-step)
7. [Step 6: Estimator Studio - Review Step](#step-6-estimator-studio---review-step)
8. [Step 7: Generate Estimate](#step-7-generate-estimate)
9. [Step 8: Export and Print](#step-8-export-and-print)
10. [Step 9: Job Status Management](#step-9-job-status-management)
11. [Workflow Summary](#workflow-summary)

---

## Initial Setup

Before starting a new estimate, ensure you have:

- Access to the Pavement Performance Suite application
- Job site address or location information
- Area measurements (if available) or ability to measure on-site
- Material preferences and specifications (optional, can be configured during workflow)

---

## Step 1: Capture Area Measurements

The first step in creating an estimate is capturing the total square footage of the driveway or parking lot area. You can add area measurements using multiple methods:

### Method 1: Quick Manual Entry (Fastest)

1. **Navigate to Estimator Studio**
   - The Estimator Studio panel is located in the main Operations Canvas
   - Click on the "Scope" tab (first tab in the Estimator Studio)

2. **Enter Square Footage Directly**
   - Locate the "Quick Manual Area (sq ft)" input field
   - Enter the total square footage (e.g., `1450` for 1,450 square feet)
   - Click the "Add Segment" button
   - The area is immediately added to your total

**Example:** If you measured a parking lot and it's 2,500 sq ft, simply type `2500` and click "Add Segment".

### Method 2: Shape-Based Calculation

1. **Select Shape Type**
   - In the Scope step, use the dropdown to select a shape:
     - **Rectangle**: For rectangular areas (length × width)
     - **Triangle**: For triangular areas (base × height ÷ 2)
     - **Circle**: For circular areas (π × radius²)

2. **Add Shape**
   - Click the "Add Shape" button
   - A new area section appears with input fields

3. **Enter Dimensions**
   - **For Rectangle**: Enter length (ft) and width (ft)
   - **For Triangle**: Enter base (ft) and height (ft)
   - **For Circle**: Enter radius (ft)
   - The area is automatically calculated and added to your total

**Example:** For a rectangular parking lot that is 50 ft × 30 ft:

- Select "Rectangle" from dropdown
- Click "Add Shape"
- Enter `50` for length and `30` for width
- System calculates: 50 × 30 = 1,500 sq ft

### Method 3: Map Drawing (Interactive)

1. **Access Mission Control Map**
   - Navigate to the Mission Control panel
   - The map interface displays the job location

2. **Draw Area on Map**
   - Use the drawing tools to trace the area directly on the map
   - Click points to create a polygon around the area
   - The system automatically calculates the square footage based on the drawn shape
   - The area is added to your segments list

**Note:** This method requires the job address to be set first (see Step 2).

### Method 4: Image Analysis (If Feature Enabled)

1. **Enable Image Analyzer Feature**
   - Ensure the "Image Analyzer" feature flag is enabled (Owner Mode)

2. **Upload Image**
   - In the Scope step, locate the Image Area Analyzer section
   - Upload a photo of the parking lot or driveway
   - The AI analyzes the image and detects the area
   - The detected area is automatically added to your segments

**Note:** This feature uses AI to estimate area from photos and may require calibration.

### Adding Multiple Segments

You can combine multiple methods to capture complex areas:

**Example Workflow:**

1. Add main parking lot: 2,500 sq ft (manual entry)
2. Add driveway: 30 ft × 12 ft rectangle = 360 sq ft
3. Add circular turnaround: radius 15 ft = 706.86 sq ft
4. **Total Area: 3,566.86 sq ft**

- Each segment appears in a list with its calculated area
- You can edit or remove individual segments using the X button
- The total area updates automatically as you add/remove segments

**Important:** You must have at least one area segment with a value greater than 0 before you can generate an estimate.

---

## Step 2: Configure Job Details

Before proceeding through the Estimator Studio steps, configure basic job information:

### Set Job Name

1. **Locate Job Name Field**
   - In the Mission Control panel, find the "Job Name" input
   - Enter a descriptive name (e.g., "First Baptist Church - Main Lot")

### Set Customer Address

1. **Enter Address**
   - In the Mission Control panel, find the "Customer Address" input
   - Enter the full address (e.g., "123 Main St, City, State ZIP")
   - The system automatically geocodes the address

2. **Verify Location**
   - The map updates to show the job location
   - Travel distance is automatically calculated from your business address
   - Coordinates are stored for future reference

**Note:** The address is used for:

- Calculating travel distance (affects material costs)
- Displaying job location on map
- Generating invoices and proposals
- Job persistence and retrieval

---

## Step 3: Estimator Studio - Scope Step

The Scope step is where you define which services are included and capture area measurements.

### Configure Service Categories

1. **Select Service Pillars**
   - **Cleaning & Repair**: Includes crack filling, oil spot treatment, debris removal
   - **Sealcoating**: Includes sealcoat application with specified coats
   - **Striping**: Includes parking lot striping and markings

2. **Toggle Services**
   - Use the toggle switches to enable/disable each service category
   - Services can be enabled or disabled at any time before calculation
   - Disabled services are excluded from cost calculations

**Example:** For a sealcoating-only job:

- ✅ Sealcoating: ON
- ❌ Cleaning & Repair: OFF
- ❌ Striping: OFF

### Capture Area Measurements

Follow the methods described in Step 1 to add area segments. The Scope step displays:

- **Total Segments**: Count of area segments added
- **Total Square Feet**: Sum of all area segments
- **Segment List**: Individual segments with their areas

### Optional: Layout Optimizer

If the Optimizer feature is enabled and you have area measurements:

- The Layout Optimizer appears automatically
- It provides recommendations for material usage and efficiency
- Review suggestions but they are not required

### Continue to Materials

Once you have:

- ✅ At least one area segment with area > 0
- ✅ Service categories configured (at least one enabled)
- ✅ Job name and address set (recommended)

Click **"Continue to Materials"** to proceed to the next step.

---

## Step 4: Estimator Studio - Materials Step

The Materials step configures sealcoating specifications, crack filling details, and logistics.

### Sealcoating Blend Configuration

1. **Number of Coats**
   - Select from dropdown: 1, 2, or 3 coats
   - Default: 2 coats
   - More coats = more material and labor costs

2. **Sand Additive**
   - Select "Yes" or "No"
   - Sand adds texture and durability
   - Affects material costs

3. **Fast-Dry Polymer**
   - Select "Yes" or "No"
   - Polymer reduces drying time
   - Adds to material costs

4. **Water Percentage**
   - Enter percentage (0-50%)
   - Used for material dilution
   - Affects material quantity calculations

### Material Preferences

1. **Sealer Type**
   - Select from dropdown:
     - Acrylic
     - Asphalt Emulsion
     - Coal Tar
     - PMM (Petroleum Modified Material) - **Default**
     - Other
   - Different types have different costs

2. **Sand Type**
   - Select from dropdown:
     - Black Beauty - **Default**
     - Black Diamond
     - Other
   - Only relevant if Sand Additive is enabled

### Crack Filling Profile (If Cleaning & Repair Enabled)

If "Cleaning & Repair" is enabled in Scope:

1. **Crack Length**
   - Enter total linear feet of cracks to fill
   - Can be measured on-site or estimated
   - Example: `150` for 150 feet of cracks

2. **Crack Width**
   - Enter average width in inches (e.g., `0.5` for half-inch)
   - Used to calculate filler material needed

3. **Crack Depth**
   - Enter average depth in inches (e.g., `0.5` for half-inch)
   - Used to calculate filler material needed

**Material Specification:** The system uses "CrackMaster Parking Lot LP hot pour (30 lb box)" for crack filling calculations.

### Logistics Configuration

1. **Prep Hours**
   - Enter estimated preparation hours
   - Default: 1 hour
   - Includes time for cleaning, setup, etc.
   - Affects labor costs

2. **Propane Tanks**
   - Enter number of propane tanks needed
   - Default: 1 tank
   - Used for crack filling equipment
   - Affects material costs

3. **Oil Spots**
   - Enter number of oil spots to treat
   - Default: 0
   - Each spot requires special treatment
   - Affects material and labor costs

### Continue to Striping

Click **"Continue to Striping"** to proceed, or **"Back to Scope"** to return and make changes.

---

## Step 5: Estimator Studio - Striping Step

The Striping step configures parking lot striping details and premium enhancements. This step is only relevant if "Striping" is enabled in Scope.

### Striping Quantities

Enter the quantities for each striping element:

1. **Lines**
   - Number of parking space lines
   - Example: `50` for 50 parking spaces

2. **Handicap**
   - Number of handicap-accessible parking stalls
   - Example: `4` for 4 handicap spaces

3. **Large Arrows**
   - Number of large directional arrows
   - Example: `2` for 2 large arrows

4. **Small Arrows**
   - Number of small directional arrows
   - Example: `8` for 8 small arrows

5. **Lettering**
   - Number of text/lettering markings
   - Example: `10` for 10 text markings (e.g., "RESERVED", "VISITOR")

6. **Curb Feet**
   - Linear feet of curb striping
   - Example: `200` for 200 feet of curb painting

### Color Palette Selection

1. **Select Colors**
   - Click color buttons to toggle selection:
     - **White** (most common)
     - **Yellow**
     - **Blue**
     - **Red**
     - **Green**
   - Multiple colors can be selected
   - Selected colors are highlighted

2. **Color Usage**
   - Colors are used for cost estimation
   - Different colors may have different material costs
   - Useful for matching branding or ministry zones

**Tip:** Select colors that match your customer's branding or specific parking zone requirements.

### Premium Enhancements

These are optional add-on services that increase the estimate:

1. **Edge Pushing**
   - Paired for sidewalk control near sanctuary entrances
   - Toggle ON/OFF
   - Adds to labor and material costs

2. **Weed Killer**
   - Perimeter pre-treatment for gravel and island edges
   - Toggle ON/OFF
   - Adds to material costs

3. **Crack Cleaning**
   - Heat-lance cleaning for maximum crack sealing bond
   - Toggle ON/OFF
   - Adds to labor and equipment costs

4. **Power Washing**
   - Sanctuary-facing facades and guest drop-offs
   - Toggle ON/OFF
   - Adds to labor and equipment costs

5. **Debris Removal**
   - Parking islands and curbs cleared before seal
   - Toggle ON/OFF
   - Adds to labor costs

**Note:** Premium enhancements are upsell opportunities and increase profit margins.

### Continue to Review

Click **"Continue to Review"** to proceed, or **"Back to Materials"** to return and make changes.

---

## Step 6: Estimator Studio - Review Step

The Review step is your final opportunity to add custom services, review all inputs, and generate the estimate.

### Custom Services & Final Checks

1. **Add Custom Services** (Optional)
   - Use the Custom Services section to add line items not covered by standard services
   - Enter service name, type (per unit or per sq ft), unit price, and quantity
   - Custom services are added to the cost breakdown

**Example Custom Services:**

- Speed bump installation: $150 per unit, quantity 2
- Signage installation: $75 per unit, quantity 4
- Drainage work: $5 per sq ft, quantity 500 sq ft

### Readiness Summary

The Review step displays a summary of all configured inputs:

**Area Summary:**

- Total square feet across all segments
- Number of area segments

**Striping Summary** (if enabled):

- Total lines, handicap stalls, arrow markings

**Materials Summary:**

- Number of coats
- Sand additive status
- Fast-dry polymer status

**Estimated Total:**

- Displays the calculated total cost (if calculation has been run)
- Shows "Pending" if calculation hasn't been run yet

### Generate Estimate

1. **Click "Generate Estimate" Button**
   - Located in the "Generate Mission Estimate" section
   - This triggers the calculation process

2. **Calculation Process**
   - System validates all inputs
   - Calculates material costs based on:
     - Total area and number of coats
     - Sealer type and additives
     - Crack filling requirements
     - Striping quantities
     - Premium services
     - Custom services
   - Calculates labor costs based on:
     - Area and coats
     - Prep hours
     - Striping work
     - Premium services
   - Applies overhead percentage
   - Applies profit margin
   - Calculates travel costs

3. **Results Display**
   After calculation, the following is displayed:
   - **Material & Labor Subtotal**: Base costs before overhead/profit
   - **Overhead**: Calculated overhead amount
   - **Profit**: Calculated profit amount
   - **Total Quote**: Final estimate total

4. **Job Status Update**
   - Job status automatically changes to "estimated"
   - Job is saved to IndexedDB
   - If Supabase is configured, estimate is synced to database

### Print Proposal Snapshot

After generating the estimate:

1. **Click "Print Proposal Snapshot"**
   - Opens browser print dialog
   - Generates a printable version of the estimate
   - Includes all cost breakdown details

**Note:** You can also use the browser's print function (Ctrl+P / Cmd+P) to print the entire page.

---

## Step 7: Generate Estimate

This step is performed within the Review step (Step 6), but is detailed here for clarity.

### What Happens During Calculation

When you click "Generate Estimate", the system:

1. **Validates Inputs**
   - Ensures total area > 0
   - Validates all numeric inputs
   - Checks that at least one service is enabled

2. **Calculates Material Costs**
   - Sealcoating materials based on area, coats, and sealer type
   - Sand additive (if enabled)
   - Fast-dry polymer (if enabled)
   - Crack filler based on length, width, and depth
   - Striping paint based on quantities and colors
   - Premium service materials
   - Custom service costs

3. **Calculates Labor Costs**
   - Sealcoating labor based on area and coats
   - Crack filling labor based on length
   - Striping labor based on quantities
   - Prep hours
   - Premium service labor
   - Travel time based on distance

4. **Applies Business Rules**
   - Overhead percentage (configurable in business settings)
   - Profit margin (configurable in business settings)
   - Material markup
   - Labor rates

5. **Generates Cost Breakdown**
   - Detailed line items for each cost component
   - Subtotal before overhead/profit
   - Overhead amount
   - Profit amount
   - Final total

6. **Saves Estimate**
   - Stores estimate in browser IndexedDB
   - If Supabase is configured, syncs to cloud database
   - Updates job status to "estimated"
   - Logs calculation event for analytics

### Understanding the Results

**Material & Labor Subtotal:**

- Sum of all material and labor costs
- Does not include overhead or profit

**Overhead:**

- Calculated as a percentage of subtotal
- Covers business expenses (insurance, equipment, etc.)
- Default: Configurable in business settings

**Profit:**

- Calculated as a percentage of (subtotal + overhead)
- Your profit margin on the job
- Default: Configurable in business settings

**Total Quote:**

- Final amount to quote to customer
- Subtotal + Overhead + Profit
- This is the number you present to the customer

---

## Step 8: Export and Print

After generating an estimate, you can export and print the proposal.

### Print Proposal Snapshot

1. **Click "Print Proposal Snapshot" Button**
   - Located in the Review step after calculation
   - Opens browser print dialog

2. **Print Options**
   - Select printer or "Save as PDF"
   - Adjust print settings (margins, headers, etc.)
   - Print or save

**What's Included:**

- Job name and address
- Total area and scope summary
- Detailed cost breakdown
- Material specifications
- Service details

### Export PDF Report (Advanced)

If using the advanced estimator with scenario management:

1. **Locate Export PDF Button**
   - In the Review step, find the PDF export option
   - May be in a dropdown menu or separate button

2. **Generate PDF**
   - Click to generate PDF report
   - PDF includes:
     - Estimate summary
     - Cost components table
     - Compliance readiness checklist
     - Business overhead and profit settings
     - Generation timestamp

3. **Download PDF**
   - PDF downloads automatically
   - Filename format: `pavement-estimate-[scenario-name].pdf`
   - Can be emailed or shared with customer

### Customer Invoice Component

The Customer Invoice component (if displayed separately) provides:

- Customer-friendly line items
- Grouped services (Sealcoating, Additives, Cleaning & Repair, etc.)
- Tax and discount fields (if applicable)
- Print and download options

---

## Step 9: Job Status Management

After generating an estimate, you can manage the job status throughout its lifecycle.

### Job Status Options

Jobs can have the following statuses:

1. **need_estimate** (Default)
   - Initial status when job is created
   - No estimate has been generated yet

2. **estimated**
   - Estimate has been generated
   - Ready to present to customer
   - Set automatically after calculation

3. **active**
   - Job has been accepted by customer
   - Work is in progress or scheduled
   - Manually set by user

4. **completed**
   - Job has been finished
   - Work is complete
   - Manually set by user

5. **lost**
   - Job was not won
   - Customer chose another contractor
   - Manually set by user

### Updating Job Status

1. **Locate Status Control**
   - In Mission Control panel or job management interface
   - Status dropdown or buttons

2. **Select New Status**
   - Choose appropriate status from dropdown
   - Status updates immediately
   - Job is saved with new status

3. **Status Persistence**
   - Status is saved to IndexedDB
   - If Supabase is configured, status syncs to database
   - Status persists across browser sessions

### Status-Based Workflow

**Typical Workflow:**

1. Create job → **need_estimate**
2. Generate estimate → **estimated** (automatic)
3. Present to customer → **estimated**
4. Customer accepts → **active** (manual)
5. Complete work → **completed** (manual)

**Alternative Workflow:**

1. Create job → **need_estimate**
2. Generate estimate → **estimated** (automatic)
3. Customer declines → **lost** (manual)

### Mission Phase Display

The HUD overlay displays mission phases based on status:

- **need_estimate** → "Reconnaissance"
- **estimated** → "Proposal Ready"
- **active** → "Deployment Prep"
- **completed** → "Mission Complete"
- **lost** → "After Action"

---

## Workflow Summary

### Quick Reference Checklist

**Before Starting:**

- [ ] Have job site address ready
- [ ] Have area measurements (or ability to measure)
- [ ] Know service requirements (sealcoating, striping, etc.)

**Step 1: Capture Measurements**

- [ ] Add area segments (manual, shapes, map, or image)
- [ ] Verify total square footage is correct
- [ ] Review segment list

**Step 2: Configure Job**

- [ ] Enter job name
- [ ] Enter customer address
- [ ] Verify location on map

**Step 3: Scope**

- [ ] Enable/disable service categories
- [ ] Add/verify area measurements
- [ ] Review total area

**Step 4: Materials**

- [ ] Configure sealcoating blend (coats, additives)
- [ ] Set material preferences (sealer type, sand type)
- [ ] Enter crack filling details (if applicable)
- [ ] Set logistics (prep hours, propane, oil spots)

**Step 5: Striping**

- [ ] Enter striping quantities (lines, handicap, arrows, etc.)
- [ ] Select color palette
- [ ] Configure premium enhancements (if applicable)

**Step 6: Review**

- [ ] Add custom services (if needed)
- [ ] Review readiness summary
- [ ] Click "Generate Estimate"

**Step 7: Results**

- [ ] Review cost breakdown
- [ ] Verify total quote amount
- [ ] Check material and labor subtotals

**Step 8: Export**

- [ ] Print proposal snapshot (if needed)
- [ ] Export PDF report (if available)
- [ ] Share with customer

**Step 9: Status**

- [ ] Update job status as workflow progresses
- [ ] Track job through completion

### Common Workflow Patterns

**Pattern 1: Quick Estimate (Manual Entry)**

1. Enter area manually → Add segment
2. Set job name and address
3. Configure scope (enable services)
4. Skip to Review (uses defaults for materials/striping)
5. Generate estimate
6. Print and share

**Pattern 2: Detailed Estimate (Full Configuration)**

1. Add multiple area segments (combine methods)
2. Set job details
3. Configure all scope options
4. Configure materials (custom blend)
5. Configure striping (detailed quantities)
6. Add custom services
7. Review and generate
8. Export PDF and print

**Pattern 3: On-Site Estimate (Mobile)**

1. Use map drawing to trace area
2. Take photos for image analysis
3. Enter measurements on mobile device
4. Configure services
5. Generate estimate on-site
6. Present to customer immediately

### Tips for Efficiency

1. **Use Manual Entry for Speed**
   - Fastest method for known measurements
   - No calculations needed

2. **Combine Methods for Accuracy**
   - Use shapes for regular areas
   - Use manual entry for irregular areas
   - Use map drawing for visual reference

3. **Save Time with Defaults**
   - System uses sensible defaults
   - Only change what's necessary

4. **Review Before Generating**
   - Double-check area totals
   - Verify service selections
   - Confirm material preferences

5. **Use Premium Services Strategically**
   - Add premium services for upsell
   - Increases profit margins
   - Provides value to customer

---

## Troubleshooting

### Common Issues

**Issue: "Please add an area measurement" Error**

- **Solution:** Ensure at least one area segment has a value > 0
- Add a segment using any method (manual, shape, map, or image)

**Issue: Total Area Shows 0**

- **Solution:** Check that area segments have been entered correctly
- For shapes, ensure length/width/radius values are entered
- For manual entry, ensure value is entered before clicking "Add Segment"

**Issue: Estimate Not Calculating**

- **Solution:** Verify at least one service category is enabled
- Check that total area > 0
- Ensure all required fields are filled

**Issue: Job Not Saving**

- **Solution:** Check browser IndexedDB support
- Verify browser storage is not full
- Check browser console for errors

**Issue: Map Not Loading**

- **Solution:** Ensure customer address is entered
- Check internet connection (for geocoding)
- Verify map API key is configured (if using external service)

---

## Next Steps After Estimate

Once you've generated an estimate:

1. **Present to Customer**
   - Share printed proposal or PDF
   - Explain cost breakdown
   - Highlight value-added services

2. **Follow Up**
   - Track customer response
   - Update job status accordingly
   - Schedule work if accepted

3. **Manage Job**
   - Update status as work progresses
   - Add notes or additional details
   - Complete job when finished

4. **Analyze Results**
   - Review profit margins
   - Compare estimates vs. actuals
   - Use insights for future estimates

---

## Additional Resources

- **User Guide**: See `docs/USER_GUIDE.md` for feature details
- **Division UI Guide**: See `docs/QUICK_START_DIVISION_UI.md` for UI customization
- **Compliance Resources**: Access ADA, VDOT, and NC DOT resources from the Engagement Hub

---

**Last Updated:** 2024
**Version:** 1.0

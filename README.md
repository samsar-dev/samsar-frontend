# Best Website Frontend

A modern web application for creating and managing vehicle and real estate listings.

## Features

### Vehicle Listings

- Support for multiple vehicle types:
  - Cars
  - Motorcycles
  - Trucks
  - Vans
  - Buses
  - Tractors
  - Construction Equipment
- Detailed vehicle information input:
  - Make and model
  - Year
  - Fuel type
  - Transmission
  - Price
  - Location
  - Description
  - Multiple image upload

### Real Estate Listings

- Property types:
  - Houses
  - Apartments
  - Buildings
  - Land
- Listing types:
  - For Sale
  - For Rent
- Detailed property information:
  - Size (m²)
  - Bedrooms
  - Bathrooms
  - Floor (for apartments)
  - Price (sale) or Monthly Rent
  - Lease Duration (for rentals)
  - Location
  - Description
  - Multiple image upload

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Icons for icon components

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── listings/
│   │       └── create/
│   │           ├── CreateListing.tsx     # Main listing creation component
│   │           ├── FormField.tsx         # Reusable form field component
│   │           ├── types.ts              # TypeScript type definitions
│   │           └── steps/
│   │               ├── BasicDetailsForm.tsx  # Initial form with category selection
│   │               ├── VehicleForm.tsx      # Vehicle-specific form fields
│   │               └── RealEstateForm.tsx   # Real estate-specific form fields
│   └── ...
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Form Components

The form system is built with reusability and type safety in mind:

1. `FormField`: A reusable component that handles different types of inputs:
   - Text input
   - Number input
   - Select dropdown
   - Multi-select
   - Textarea
   - File upload

2. `BasicDetailsForm`: Handles the initial category selection and basic details
   - Progressive disclosure of form fields
   - Smooth animations for transitions
   - Responsive grid layout

3. `VehicleForm` and `RealEstateForm`: Category-specific forms with:
   - Proper type validation
   - Conditional fields based on selection
   - Comprehensive error handling

### Styling

The UI is built with Tailwind CSS, featuring:

- Responsive design
- Dark mode support
- Consistent spacing and typography
- Smooth animations and transitions

### Type Safety

TypeScript is used throughout the project to ensure:

- Type-safe form handling
- Proper prop validation
- Clear interface definitions
- Better development experience with autocomplete

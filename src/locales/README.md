# Localization Structure

This directory contains the localization files for the Best Website application. The localization system has been restructured to follow a modular approach, making it easier to maintain and scale.

## Structure

The localization files are organized by language code and then by functional area:

```
locales/
├── en/                 # English translations
│   ├── common.json     # General app text
│   ├── auth.json       # Authentication related
│   ├── profile.json    # User profile related
│   ├── listings.json   # Listings related
│   ├── filters.json    # Search and filters
│   ├── features.json   # Vehicle/property features
│   ├── options.json    # Dropdown/select values
│   ├── form.json       # Form fields and validation
│   ├── errors.json     # Error messages
│   ├── home.json       # Home screen content
│   ├── footer.json     # Footer content
│   ├── categories.json # Categories and subcategories
│   ├── enums.json      # Enum translations
│   ├── settings.json   # Settings related
│   └── index.ts        # Exports all translations
├── ar/                 # Arabic translations
│   ├── common.json     # General app text
│   └── index.ts        # Exports all translations
├── en.json             # Legacy English translations (to be deprecated)
└── ar.json             # Legacy Arabic translations (to be deprecated)
```

## Usage

### In Components

To use translations in your components, import the `useTranslation` hook from `react-i18next` and specify the namespace:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  // Use a specific namespace
  const { t } = useTranslation("listings");

  // Or use multiple namespaces
  const { t: tCommon } = useTranslation("common");
  const { t: tFeatures } = useTranslation("features");

  return (
    <div>
      <h1>{tCommon("appName")}</h1>
      <p>{t("vehicleDetails")}</p>
      <ul>
        <li>{tFeatures("safety.blindSpotMonitor")}</li>
      </ul>
    </div>
  );
}
```

### Adding New Translations

1. Identify the appropriate namespace for your new translation
2. Add the key-value pair to the corresponding JSON file
3. Use the same key structure in all language files

## Namespaces

| Namespace  | Purpose                                              |
| ---------- | ---------------------------------------------------- |
| common     | General app text, buttons, UI elements               |
| auth       | Login, register, password reset, verification        |
| profile    | User profile, settings, security, privacy            |
| listings   | Creating, editing, and displaying listings           |
| filters    | Search and filter labels, options, sorting           |
| features   | Vehicle/property features (organized by categories)  |
| options    | Dropdown values: fuel type, transmission, etc.       |
| form       | Form field labels, placeholders, validation messages |
| errors     | Generic error messages and API feedback              |
| home       | Home screen banners, titles, marketing text          |
| footer     | Footer content like privacy, terms, about, contact   |
| categories | Listing categories and subcategories                 |
| enums      | Enum translations (transmission, fuelType, etc.)     |
| settings   | Settings tabs, 2FA, theme, notifications             |

## Migration

The application is currently transitioning from a single-file approach to this modular structure. During this transition:

1. New translations should be added to the appropriate namespace file
2. Existing code will continue to work with both old and new structures
3. Legacy files (en.json, ar.json) will be gradually phased out

## Adding a New Language

To add a new language:

1. Create a new directory with the language code (e.g., `fr/` for French)
2. Copy the structure from the `en/` directory
3. Translate the content of each file
4. Create an `index.ts` file that exports all translations
5. Update the i18n configuration in `src/config/i18n.ts` to include the new language

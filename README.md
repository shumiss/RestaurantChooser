# RestaurantChooser

RestaurantChooser is a React Native / Expo mobile app for managing dinner participants, managing restaurant choices, and randomly choosing where to eat. The app now uses `expo-sqlite` for local persistent storage.

Public repository: https://github.com/shumiss/RestaurantChooser

## Features

- Add, edit, delete, and clear restaurants.
- Store restaurant cuisine, price level, rating, and delivery support.
- Add, edit, delete, and clear people.
- Prevent duplicate restaurant and person names.
- Select which people are participating in the meal.
- Filter restaurants by cuisine, max price, minimum rating, and delivery.
- Randomly choose a restaurant.
- Randomly choose a payer from the people list.
- Accept a recommendation or let participants use vetoes.
- Store the last 20 decision records.
- Persist restaurants, people, and decision history in SQLite.
- Migrate older AsyncStorage data into SQLite on first launch.

## Tech Stack

- Expo SDK 54
- React Native
- React Navigation
- `expo-sqlite`
- AsyncStorage, used only for migration from the previous version

## How to Run

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Run the web preview:

```bash
npx expo start --web --port 8081
```

Open:

```text
http://127.0.0.1:8081
```

Run Android or iOS from Expo:

```bash
npm run android
npm run ios
```

## Build and Expo Account

Expo build setup requires logging in to an Expo account before using EAS Build. The official setup guide is here:

https://docs.expo.dev/build/setup/#log-in-to-your-expo-account

The project contains `eas.json`. Keep this file in the repository because EAS uses it for build profiles.

Expo EAS Android preview build:

https://expo.dev/accounts/leishu/projects/RestaurantChooser/builds/e6705be3-2eb0-4626-8675-c7d22d4e28f5

Build status: completed.

## SQLite Notes

SQLite was installed with:

```bash
npx expo install expo-sqlite
```

Official installation reference:

https://docs.expo.dev/versions/latest/sdk/sqlite/#installation

The database implementation is in:

```text
src/storage/database.js
```

The app creates three tables:

- `restaurants`
- `people`
- `decision_history`

The `restaurants` table stores `name`, `cuisine`, `price`, `rating`, and `delivery`, so the Decision screen can pre-filter restaurants before random selection.

For web builds, `expo-sqlite` needs WebAssembly support. This is configured in:

```text
metro.config.js
```

## Verification

The following checks were completed:

```bash
node --check App.js
node --check src/storage/database.js
node --check src/screens/restaurants/RestaurantsScreen.js
node --check src/screens/decision/DecisionScreen.js
npx expo export --platform web
```

Manual test flow:

1. Opened the app in the browser.
2. Verified old data migrated into SQLite.
3. Added a restaurant with cuisine, price, rating, and delivery values.
4. Added a person.
5. Selected participating people.
6. Filtered restaurants and randomly selected a restaurant.
7. Verified payer selection, veto controls, and decision history updates.

## Attribution

This project is based on the Codementor DevProjects Restaurant Chooser concept and was modified for the course assignment.

https://www.codementor.io/

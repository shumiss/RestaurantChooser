# RestaurantChooser Final Report

## 1. Project Summary

RestaurantChooser is an Expo React Native application that helps a group decide where to eat. The user can maintain a restaurant list, maintain a people list, and let the application randomly select a restaurant and a payer. The final version focuses on persistence, reliability, and clear project documentation.

Repository: https://github.com/shumiss/RestaurantChooser

## 2. Assignment Goal

The Week 10-15 requirement asks for analysis, repair, and improvement of a React Native application that uses `expo-sqlite` for persistent storage. The work also requires documentation, testing, and preparation for public repository submission.

The original project used AsyncStorage. That worked for simple key-value storage, but it did not satisfy the final requirement for SQLite persistence. The main technical goal was therefore to replace passive JSON persistence with a structured local database.

## 3. Initial Code Review

The reviewed application already had three main screens:

- Restaurants screen
- People screen
- Decision screen

The main issues found were:

- Data was stored with AsyncStorage instead of SQLite.
- State changes were saved through `useEffect`, which can overwrite stored data if initialization and saving happen in the wrong order.
- The app had limited data operations: early versions only supported basic adding and deleting.
- Restaurant records did not include decision attributes such as cuisine, price, rating, and delivery support.
- The Decision screen did not yet implement the full flow: selecting participants, pre-filtering, random choice, accepting, and vetoing.
- Decision history was not stored in a structured database table.
- Web export failed after adding `expo-sqlite` until WebAssembly assets were added to Metro configuration.

## 4. Implemented Fixes

### SQLite Storage Layer

A new storage module was created:

```text
src/storage/database.js
```

It initializes a SQLite database named:

```text
restaurant_chooser.db
```

The database contains three tables:

```sql
restaurants(id, name, cuisine, price, rating, delivery, created_at)
people(id, name, created_at)
decision_history(id, restaurant, person, created_at)
```

The app now loads data from SQLite at startup and writes each create, update, delete, and clear operation directly to SQLite.

### Data Migration

Because previous versions used AsyncStorage, a migration step was added. On first launch after the update, old values from these keys are copied into SQLite:

- `restaurants`
- `people`
- `history`

A migration flag prevents repeated migration.

### Restaurant and People Management

Both list screens now support:

- Add
- Edit
- Delete
- Clear all
- Duplicate-name prevention
- Save failure message handling

Restaurant entries now include cuisine, price level, rating, and delivery support. These values are stored in SQLite and used by the Decision screen for filtering.

### Decision Flow

The Decision screen now supports the core Restaurant Chooser workflow:

- Select participating people.
- Apply pre-filters for cuisine, max price, minimum rating, and delivery.
- Randomly choose from the filtered restaurant list.
- Randomly assign a payer from the selected participants.
- Accept a result as final.
- Let selected participants use vetoes and then choose again.

### Decision History

The Decision screen records selections in SQLite. It stores:

- Selected restaurant
- Selected payer, if people exist
- Selection time

The app keeps the latest 20 records.

### Web SQLite Support

`expo-sqlite` uses a WebAssembly SQLite implementation on web. The first web export failed because Metro did not recognize `.wasm` files. This was fixed by adding:

```text
metro.config.js
```

The config adds `wasm` to Metro asset extensions.

## 5. Dependencies Added or Updated

SQLite was installed with:

```bash
npx expo install expo-sqlite
```

The Expo SQLite documentation used for this change:

https://docs.expo.dev/versions/latest/sdk/sqlite/#installation

Expo build setup and account login documentation:

https://docs.expo.dev/build/setup/#log-in-to-your-expo-account

The project keeps `eas.json` because EAS Build uses it for build profiles.

## 6. Testing

Static JavaScript checks were run:

```bash
node --check App.js
node --check src/storage/database.js
node --check src/screens/restaurants/RestaurantsScreen.js
node --check src/screens/decision/DecisionScreen.js
```

Expo web export was run:

```bash
npx expo export --platform web
```

Result: passed.

Manual testing was completed in the browser:

1. Opened the app at `http://127.0.0.1:8081`.
2. Confirmed the app loaded existing data after migration.
3. Added a new restaurant with cuisine, price, rating, and delivery values.
4. Added a new person.
5. Selected participating people.
6. Applied restaurant filters.
7. Ran random restaurant selection.
8. Confirmed payer selection, veto controls, and the history list.

## 7. Remaining Notes

`npm audit` reports moderate PostCSS warnings from the Expo dependency chain. The automatic forced fix would downgrade Expo to an older major version, so it was not applied. This avoids a breaking change to the SDK 54 project.

## 8. Attribution

The project concept comes from Codementor DevProjects and was modified to satisfy the course requirements.

https://www.codementor.io/

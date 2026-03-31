# Calorie Counter

A small, modern calorie tracking web app built with **HTML5**, **Tailwind CSS**, and **JavaScript**. It lets you add edit and remove food items, tracks your daily total, and persists data using **localStorage** and **cookies**. A simple **Fetch API** demo is included to simulate retrieving calorie estimates from an API.

## Features

- **Add food items** with a name and calorie value.
- **View all items** added for the current day.
- **Edit and remove** individual items.
- **Reset** the day (clear all items).
- **Total calories** and **progress bar** toward a configurable daily goal.
- **Persistent storage** using:
  - `localStorage` for items and goal.
  - A **cookie** storing the last-added food name.
- **Fetch API demo** that loads in-script example calorie data and suggests calories for common foods.
- **Responsive UI** using Tailwind CSS with a dark, glassmorphism-style card.

## Project Structure

- `index.html` – main page layout and Tailwind setup.
- `styles.css` – small custom styles to complement Tailwind.
- `script.js` – core app logic and event handlers.
- `README.md` – this documentation.

## Getting Started

1. 
2. Open `index.html` in your browser (double-click or drag into the browser).
3. Start adding food items using the form.

### Usage

1. Type a **food name** and **calorie value**, then click **Add**.
2. Your items appear in the **Today's Foods** list with their calories and time.
3. Use **Edit** to adjust a food's name or calories.
4. Use **Remove** to delete a single item.
5. Use **Reset Day** to clear all items and start fresh.
6. Click **Set Goal** to change your daily calorie goal (default is 2000 kcal).
7. Type a common food name (e.g. `apple`, `pizza`) and click **Suggest calories** to see the **Fetch API** demo in action.

Data is saved automatically in your browser, so a page refresh will not clear your items or goal.

## Implementation Notes

- **DOM Manipulation**: JavaScript dynamically updates the list, total calories, summary text, and the progress bar.
- **Event Handling**:
  - `submit` event on the form to add items.
  - `click` events for reset, set-goal, edit, remove, and Fetch API demo buttons.
- **localStorage**:
  - Items are saved under `calorieCounter:items`.
  - The goal is saved under `calorieCounter:goal`.
- **Cookies**:
  - The last added food name is stored in a cookie named `calorieCounterLastFood`.
  - When you reload, if the name field is empty, it is prefilled with this value.
- **Fetch API**:
  - `script.js` uses `fetch()` with simulated in-script data and tries to find a matching food by name.
  - If found, it auto-fills the calories input and shows a helpful message.


This project is intended for educational use. 

# Calorie-Counter

<img width="1240" height="580" alt="image" src="https://github.com/user-attachments/assets/69f76321-6af2-4958-b165-4945226adeba" />


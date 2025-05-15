### Daily Calorie & Nutrient Tracker App

This is a simple web application built with React, TypeScript, and Vite for tracking daily calorie and nutrient intake. It allows users to log food items for different meals, view daily totals, navigate through past days (up to 7 days history), and add custom food items.

## Features
- Daily Tracking: Log food items for Breakfast, Lunch, Snacks, and Dinner.

- Nutrient Breakdown: Tracks Calories, Protein, Carbohydrates, Fat, and Fibre for each logged item and provides daily totals.

- Date Navigation: Easily navigate between days to view past logs (up to the last 7 days).

- Food Database & Search: Search for food items from a pre-defined database.

- Custom Food Items: Add your own food items with custom nutrient information.

- Edit & Delete Entries: Modify or remove logged food entries.

- Copy Entries: Quickly copy existing logged food items to add them again.

- Local Storage: Saves your logged data directly in your browser's local storage.

## Technologies Used
- React: A JavaScript library for building user interfaces.

- TypeScript: Adds static typing to JavaScript for improved code quality and maintainability.

- Vite: A fast frontend build tool that provides a great development experience.

- Tailwind CSS: A utility-first CSS framework for rapid styling.

## Setup and Local Development
To get the project running on your local machine:

1. Clone the repository: 
   
 ` git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
  cd YOUR_REPO_NAME`

(Replace YOUR_USERNAME and YOUR_REPO_NAME with your GitHub username and repository name)

2. Install dependencies:
`npm install # or yarn install`

3. Run the development server:

`npm run dev # or yarn dev`

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production and Deployment
To create a production build of the app and deploy it (e.g., to GitHub Pages):

1. Build the application:

  `npm run build`

  This will create a dist folder containing the optimized production files.

2. Deploy using the gh-pages script:
(Assuming you have followed the steps to install gh-pages and added the deploy script to your package.json)

`npm run deploy`

This command builds the app and pushes the dist folder to the gh-pages branch of your GitHub repository.

3. Configure GitHub Pages:
Go to your GitHub repository's Settings -> Pages and set the source to the gh-pages branch and the / (root) folder. Your app will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Usage
- Use the date navigation arrows to select the day you want to view or log food for.

- Click the "+" button next to each meal type (Breakfast, Lunch, Snacks, Dinner) to log a new food item for that meal (only available for today's date).

- In the modal, search for a food item from the database or enter details for a custom food.

- Enter the quantity and save the entry.

- Click the edit or copy icons next to a logged food item to modify or duplicate it (only available for today's date).

- Click the trash icon to delete a logged food item (only available for today's date).

- Daily totals for calories, protein, carbs, fat, and fibre are displayed at the top.

Disclaimer
The nutrient data provided in the built-in database is for demonstration purposes only and may not be completely accurate. Always consult official nutrition sources or a registered dietitian for precise dietary information.
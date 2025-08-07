# Portfolio

This is the portfolio website of Oussama Hattan, a backend developer specializing in scalable server-side applications. The portfolio showcases projects, skills, and contact information.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

## Demo

You can view the live demo of the portfolio [here](https://yourwebsite.com).

## Features

- Responsive design
- Interactive animations
- Contact form with backend integration
- Project showcase
- Education and skills sections
- Theme toggle (dark/light mode)

## Technologies Used

- Frontend:
  - HTML
  - CSS
  - JavaScript
  - AOS (Animate On Scroll)
  - Font Awesome

- Backend:
  - Node.js
  - Express.js
  - CORS
  - Helmet

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/H-Ossama/portfolio.git
   cd portfolio
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Usage

To build and start the application in production mode:

1. Build the application:
   ```sh
   npm run build
   ```

2. Start the application:
   ```sh
   npm start
   ```

## Project Structure

```
portfolio/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── App.js
│   └── ...
├── .env
├── package.json
└── ...
```

## License

This project is licensed under the MIT License.
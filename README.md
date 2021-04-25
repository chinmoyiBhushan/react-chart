# react-chart
> This project is a Django / React based server that highlights statistics on MLB teams and players by season and teams.

## Running
- For Server
  - Make sure you have virtualenv installed
  - Activate your venv environment
  - Install requisite dependencies
    ```bash
    python install -r requirements.txt
    ```
  - Run the server
    ```bash
    python manage.py runserver
    ```

- For front-end
    - Navigate to `frontend` (`cd ./frontend`)
    - Run the react server using
      ```npm
      npm start
      ```
- Now open your browser and navigate to http://localhost:3000.

## App Highlights
- Selection of MLB Seasons (in 5 year increments to see more team diversity)
- Empty state UX
- Flags shown for the home state of each team
- Animation of flags on interaction, while maintaining readability
- Clicking open any card to see a team page (with backward navigation using breadcrumbs)
- Scatter plot that highlights weight vs height diversity in the team along with player names in the tooltip!

---
Author: Chinmoyi Bhushan Verma
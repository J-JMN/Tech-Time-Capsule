# Tech Time Capsule

<p align="center">
  <img alt="Project Status" src="https://img.shields.io/badge/status-complete-green?style=for-the-badge">
  <img alt="Maintained" src="https://img.shields.io/badge/maintained-yes-blue?style=for-the-badge">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-purple?style=for-the-badge">
</p>

<p align="center">
  An interactive, community-driven museum of technological history, built with a powerful Python/Flask backend and a dynamic React frontend.
</p>

---

> The story of technology is the story of us—a narrative of innovation, disruption, and human ingenuity. Yet, this history is scattered across countless sources. The Tech Time Capsule is a single, living platform where the pivotal moments of tech history can be discovered, contextualized, and preserved by a community of enthusiasts. It's not just a timeline; it's a collaborative encyclopedia of innovation.

<br>


## ✨ Core Features

* **Dynamic Timeline Exploration:** Browse a rich history of pivotal tech moments. Sort the timeline chronologically by **Historical Date** or see what's new by sorting by **Recently Added** events.
* **Precision Filtering:** Instantly filter the entire timeline by a specific category, date, month, or a single/multiple years.
* **Community-Driven Content & Curation:** A secure user account system allows contributors to submit, update, and delete their own events and custom categories.
* **Deep Contextual Links:** Link events to multiple categories with unique "relationship descriptions" that explain the event's specific impact (e.g., "iPhone" -> "Product Launch" -> "Revolutionized the industry").
* **Full Content Details:** Click on any event to see its dedicated detail page, including the contributor, a larger image, and all its assigned categories.
* **Interactive Trivia:** Test your knowledge with a fun trivia game featuring a persistent score saved in your browser.

## 🛠️ Technology Stack

| Frontend                               | Backend                                                | Deployment & Database                      |
| -------------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| **React** (UI Library)                 | **Python 3.11** (Programming Language)                 | **Render** (Cloud Platform)                |
| **React Router** (Client-Side Routing) | **Flask** (Web Framework)                              | **PostgreSQL** (Production Database)       |
| **Axios** (HTTP Client)                | **SQLAlchemy** (ORM)                                   | **Gunicorn** (WSGI Server)                 |
| **Formik & Yup** (Form Management)     | **Flask-Migrate** (Database Migrations)                | **SQLite** (Development Database)          |
| **Context API** (State Management)     | **Flask-Bcrypt** (Password Hashing)                    |                                            |

## 🚀 Live Demo

The application is live at the following URL:

**[➡️ Live Application Link](https://tech-time-capsule-client.onrender.com/)**

## ⚙️ Getting Started: Local Setup

To get a local copy up and running, follow these simple steps.

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/J-JMN/tech-time-capsule.git](https://github.com/J-JMN/tech-time-capsule.git)
    cd tech-time-capsule
    ```

2.  **Backend Setup**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Install Python dependencies
    pipenv install

    # Activate the virtual environment
    pipenv shell

    # Create the database tables from the latest models
    flask db upgrade

    # Seed the database with high-quality sample data
    flask seed_db

    # Run the backend server (it will run on [http://127.0.0.1:5555](http://127.0.0.1:5555))
    flask run -p 5555
    ```

3.  **Frontend Setup**
    *Open a new, separate terminal window.*
    ```bash
    # Navigate to the frontend directory from the project root
    cd frontend

    # Install Node.js dependencies
    npm install

    # Run the frontend development server
    npm start
    ```
Your application should now be running locally!

## 🤝 Author & Contact

This project was crafted with ❤️ by **Joseph Mburu**.

* **GitHub:** [@J-JMN](https://github.com/J-JMN)
* **Email:** [j.mburu.pro@gmail.com](mailto:j.mburu.pro@gmail.com)
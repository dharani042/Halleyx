#Demo Video
https://youtu.be/EvJ90GyVCrI?si=_MAsZ6LbQnmpJxJP

# CustDash Pro - Full Stack Dashboard Builder

A premium full-stack application built with **React (Tailwind 4 / Redux)** and **Spring Boot (MySQL)**.

## Project Structure

- `frontend/`: React application using Vite, Tailwind CSS 4.2.1, and Redux Toolkit.
- `backend/`: Spring Boot application using Java 17, Hibernate, and MySQL.

## Prerequisites

- **Java 17+**
- **Maven**
- **Node.js 18+**
- **MySQL Server** (Ensure it's running on port 3306)

## Setup and Running

### 1. Database Setup
Ensure you have a MySQL database named `cust_dash`. You don't need to create the tables; Hibernate will auto-generate them on the first run.
- **Username**: `root`
- **Password**: `Dharu1724**` (Configured in `backend/src/main/resources/application.properties`)

### 2. Start Backend
```bash
cd backend
mvn spring-boot:run
```
The API will be available at `http://localhost:8080`.

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## Key Features

- **Dynamic Dashboard Builder**: Drag components from the sidebar onto a 12-column grid.
- **Real-time Aggregation**: Widgets calculate SUM, AVG, and COUNT based on live Customer Orders.
- **Customizable Widgets**: Configure titles, sizes, and data metrics via a dedicated settings side-panel/modal.
- **Responsive Layout**: Designed for Desktop (12 cols), Tablet (8 cols), and Mobile (4 cols).
- **Customer Order Management**: Full CRUD interface for managing order data.

## Technologies Used

- **Frontend**: React 19, Tailwind CSS 4.2.1, Redux Toolkit, Lucide Icons, Recharts (Placeholders).
- **Backend**: Spring Boot 3.2.4, Spring Data JPA, MySQL Connector, Lombok.

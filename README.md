# Loan Management System

The Loan Management System is a comprehensive solution for managing loans, including creating loans, tracking installment payments, and monitoring loan statuses. Built using Node.js, Express, and MongoDB, this system provides a robust backend for handling loan-related operations efficiently.

## Features

- **Create Loans:** Add new loans with specified amounts and users, calculating total amounts including interest.
- **Track Installments:** Automatically generate and manage monthly installments with due dates and statuses.
- **Payment Handling:** Mark installments as paid and handle overdue payments by rolling them into future installments.
- **Loan Status:** Maintain and update the overall status of loans (paid/unpaid) based on installment payments.
- **Pagination Support:** Efficiently fetch and display loans with pagination for better data management and user experience.

## Technologies Used

- **Node.js:** A JavaScript runtime for building fast and scalable server-side applications.
- **Express:** A minimal and flexible Node.js web application framework for creating APIs.
- **MongoDB:** A NoSQL database for storing loan and user data.
- **Mongoose:** An ODM library for MongoDB, providing schema-based solutions for managing data.

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/osamullah420/LoanApp-Backend-Nodesjs.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd LoanApp-Backend-Nodesjs
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    MONGO_URI=your_mongo_database_uri
    JWT_SECRET = your_jwt_secret
    PORT=8080
    ```

5. **Start the server:**

    ```bash
    npm run server
    ```

## Usage

Once the server is running, you can use an API client (such as Postman) or a front-end application to interact with the loan management system. The system allows you to create loans, view all loans, and manage installment payments.

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please fork the repository and submit a pull request. For major changes, it's recommended to open an issue first to discuss your proposed changes.


## Acknowledgements

- Thanks to the open-source community for providing the tools and libraries used in this project.

## Contact

For any questions or suggestions, please feel free to open an issue or contact the repository owner.

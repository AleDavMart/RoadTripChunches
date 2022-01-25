CREATE DATABASE onlineshop;

CREATE TABLE products(
    id SERIAL PRIMARY KEY NOT NULL, --- SERIAL increase the PM key to ensure uniqueness
    name VARCHAR(50) NOT NULL, 
    price INT NOT NULL,
    inventory INT NOT NULL, 
    image VARCHAR
);

CREATE TABLE payments(
    PSPReference SERIAL PRIMARY KEY NOT NULL, 
    product_ID INT , ---- possibly need to change to a foreign key
    Total INT NOT NULL,
    Customer_Name VARCHAR NOT NULL,
    Payment_Type VARCHAR NOT NULL, 
    Succesful VARCHAR NOT NULL
);


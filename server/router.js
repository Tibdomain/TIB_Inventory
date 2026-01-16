require("dotenv").config();
const express = require("express");
const sqlDBConnect = require("./dbConnect");
const router = express.Router();
const nodemailer = require("nodemailer");
const axios = require("axios");
const crypto = require("crypto");

const verificationTokens = new Map(); // Store tokens temporarily

router.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// // Middleware to validate table name
// const validateTableName = (req, res, next) => {
//     const validTableNames = ['Mosfet', 'Capacitor', 'Diode', 'Microcontroller', 'Power_IC'];
//     const tableName = req.params.tableName;

//     if (!validTableNames.includes(tableName)) {
//         return res.status(400).json({ error: 'Invalid table name' });
//     }
//     next();
// };

//fetch component types

router.get("/api/componentTypes", (req, res) => {
  const fetchTablesQuery = "SHOW TABLES";

  sqlDBConnect.query(fetchTablesQuery, (err, results) => {
    if (err) {
      console.error("Error fetching table names:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Define the tables to exclude
    const notAllowedTables = [
      "vendor_data",
      "assembly_master",
      "Fixed_Asset",
      "verification_tokens",
      "loginsystem",
    ];

    // Extract and filter table names
    const componentTypes = results
      .map((row) => Object.values(row)[0]) // Extract table names
      .filter((tableName) => !notAllowedTables.includes(tableName)) // Remove restricted tables
      .map((tableName) => ({
        value: tableName,
        label: tableName.replace(/_/g, " "), // Format label
      }));

    res.json(componentTypes);
  });
});

//Querry to fetch data from the database
router.get("/api/query", async (req, res) => {
  try {
    const { component, ...filters } = req.query;

    // Default to some table if no component selected
    const tableName = component;

    // // Sanitize the table name to prevent SQL injection
    // const notAllowedTables = ['vendor_data', 'assembly_master', 'Fixed_Asset', 'vendor_data'];
    // if (notAllowedTables.includes(tableName)) {
    //     //remove that table from the list
    // }

    // Modified query with JOIN
    let sql = `
            SELECT ${tableName}.*, vendor_data.Vendor_Name
            FROM ${tableName} 
            LEFT JOIN vendor_data ON ${tableName}.vendor_id = vendor_data.Vendor_Id  WHERE  1=1
            
        `;
    const values = [];

    // Add filter conditions
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        sql += ` AND ${tableName}.${key} LIKE ?`;
        values.push(`%${value}%`);
      }
    });

    sqlDBConnect.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        res.json(result.rows || result);
      }
    });
  } catch (error) {
    console.error("Error fetching filtered data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new data route

router.post("/api/addData/:tableName", (req, res) => {
  const tableName = req.params.tableName;
  const {
    ID,
    IPN,
    Description,
    Mfg,
    MFG_part_no,
    Package,
    Vendor_Id,
    Quantity,
    Avg_Price,
    Location,
    Status,
    token,
  } = req.body;

  console.log("Received data:", req.body);

  // Verify token exists in database
  const verifyTokenQuery = "SELECT * FROM verification_tokens WHERE token = ?";
  sqlDBConnect.query(verifyTokenQuery, [token], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // First check if ID exists
    const checkQuery = `SELECT ID FROM ${tableName} WHERE ID = ?`;
    sqlDBConnect.query(checkQuery, [ID], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("Error checking ID:", checkErr);
        return res
          .status(500)
          .json({ error: "Database error while checking ID" });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({ error: "ID already exists" });
      }

      // Verify if Vendor_id exists in vendor_data table
      const checkVendorQuery =
        "SELECT Vendor_id FROM vendor_data WHERE Vendor_Id = ?";
      sqlDBConnect.query(
        checkVendorQuery,
        [Vendor_Id],
        (vendorErr, vendorResults) => {
          if (vendorErr || vendorResults.length === 0) {
            return res.status(400).json({ error: "Invalid Vendor_id" });
          }
        }
      );

      // If ID doesn't exist and Vendor_id is valid, proceed with insertion
      const insertQuery = `
                INSERT INTO ${tableName} 
                (ID, IPN, Description, Mfg, MFG_part_no, Package, Vendor_id, Quantity, Avg_Price, Location, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

      const values = [
        ID,
        IPN,
        Description,
        Mfg,
        MFG_part_no,
        Package,
        Vendor_Id,
        Quantity,
        Avg_Price,
        Location,
        Status,
      ];

      sqlDBConnect.query(insertQuery, values, (insertErr, result) => {
        if (insertErr) {
          console.error("Error inserting data:", insertErr);
          return res.status(500).json({ error: "Failed to add data" });
        }

        // Delete token after use (to prevent reuse)
        sqlDBConnect.query("DELETE FROM verification_tokens WHERE token = ?", [
          token,
        ]);

        res.status(200).json({
          message: "Data added successfully",
          insertId: result.insertId,
        });
      });
    });
  });
});

// Add this new route to fetch vendors

router.get("/api/vendors", (req, res) => {
  const query = "SELECT * FROM vendor_data";
  sqlDBConnect.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching vendors:", err);
      res.status(500).json({ error: "Failed to fetch vendors" });
    } else {
      res.json(result);
    }
  });
});

// 📩 Send verification email for Component parts

router.post("/api/sendVerificationEmailforPart", (req, res) => {
  const { email, tableName, formData, emailSubjectPart, emailHTMLPart } =
    req.body;

  if (!email || !tableName || !formData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate unique token
  const token = crypto.randomBytes(32).toString("hex");

  // Store token in database
  const insertTokenQuery =
    "INSERT INTO verification_tokens (token, table_name, formData) VALUES (?, ?, ?)";
  sqlDBConnect.query(
    insertTokenQuery,
    [token, tableName, JSON.stringify(formData)],
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to store verification token" });
      }

      // Email verification link
      const verificationLinkPart = `http://localhost:5000/api/verifyAddData?token=${token}`;

      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.SERVER_EMAIL,
          pass: process.env.SERVER_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: emailSubjectPart,
        html:
          emailHTMLPart +
          `<a href="${verificationLinkPart}"><button className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700">Update Inventory</button></a>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ error: "Error sending email" });
        }

        res
          .status(200)
          .json({ message: "Verification email sent successfully" });
      });
    }
  );
});

// 📩 Verify Component data
router.get("/api/verifyAddData", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Fetch stored data
  const getTokenQuery = "SELECT * FROM verification_tokens WHERE token = ?";
  sqlDBConnect.query(getTokenQuery, [token], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const { table_name, formData } = results[0];
    console.log("Result[0]: ", results[0]);
    const parsedData = JSON.parse(formData);

    // Automatically trigger addData route
    axios
      .post(`http://localhost:5000/api/addData/${table_name}`, {
        ...parsedData,
        token,
      })
      .then((response) => {
        res.send(`<h2>Data added successfully! You can close this page.</h2>`);
      })
      .catch((error) => {
        res.status(500).send("<h2>Failed to add data.</h2>");
      });
  });
});

// 📩 Send verification email for Component
router.post("/api/sendVerificationEmail", async (req, res) => {
  try {
    const { email, formData, emailSubjectComponent, emailHTMLComponent } =
      req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log("Sending email to:", email);

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    verificationTokens.set(token, formData); // Store form data temporarily

    // Construct verification link
    const verificationLinkComponent = `http://localhost:5000/api/verifyComponent?token=${token}`;

    // Nodemailer transport configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.SERVER_EMAIL, // Replace with your email
        pass: process.env.SERVER_PASSWORD, // Replace with your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.SERVER_EMAIL,
      to: email,
      subject: emailSubjectComponent,
      html:
        emailHTMLComponent +
        `<a href="${verificationLinkComponent}">${verificationLinkComponent}</a>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    res.status(200).json({ message: "Verification email sent!" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Verify Token & Create Table in Database
router.get("/api/verifyComponent", async (req, res) => {
  const { token } = req.query;

  // Simulating token validation (Replace with real logic)
  console.log("Verification token received:", token);

  if (!verificationTokens.has(token)) {
    return res.status(400).send("Invalid or expired verification link.");
  }

  const formData = verificationTokens.get(token);
  verificationTokens.delete(token); // Remove token after use

  // const { label, name, description, type } = formData;
  const { name } = formData;

  // if (!label || !name || !description || !type) {
  //   return res.status(400).json({ error: "All fields are required" });
  // }

  const tableName = `${name.toUpperCase().replace(/\s+/g, "_")}`;

  // Create table SQL query
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        IPN VARCHAR(50) NOT NULL,
        Description TEXT NOT NULL,
        Mfg VARCHAR(100),
        MFG_part_no VARCHAR(100),
        Package VARCHAR(50),
        Vendor_Id INT,
        Quantity INT DEFAULT 0,
        Avg_Price DECIMAL(10,2),
        Location VARCHAR(100),
        Status VARCHAR(20) DEFAULT 'Active'
      );
    `;

  // Execute query to create table
  sqlDBConnect.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating table:", err);
      return res.status(500).send("Internal Server Error");
    }

    res.send(`Table '${tableName}' created successfully!`);
  });
});

// Add a new vendor
router.post("/api/vendors", (req, res) => {
  const { vendor_id, vendor_code, vendor_name } = req.body;

  // Check if vendor with same ID or code already exists
  sqlDBConnect.query(
    "SELECT * FROM vendor_data WHERE vendor_id = ? OR vendor_code = ?",
    [vendor_id, vendor_code],
    (err, existingVendors) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Server error while adding vendor" });
      }

      if (existingVendors.length > 0) {
        return res.status(409).json({
          message: "Vendor with this ID or code already exists",
        });
      }

      // Current timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Insert new vendor
      sqlDBConnect.query(
        "INSERT INTO vendor_data (vendor_id, vendor_code, vendor_name, flag, timestamp) VALUES (?, ?, ?, 0, ?)",
        [vendor_id, vendor_code, vendor_name, timestamp],
        (insertErr, result) => {
          if (insertErr) {
            console.error("Database error:", insertErr);
            return res
              .status(500)
              .json({ message: "Server error while adding vendor" });
          }

          return res.status(201).json({
            message: "Vendor added successfully",
            vendor: { vendor_id, vendor_code, vendor_name },
          });
        }
      );
    }
  );
});

// Update an existing vendor
router.put("/api/vendors/:id", (req, res) => {
  const { id } = req.params;
  const { vendor_code, vendor_name } = req.body;

  // Check if vendor exists
  sqlDBConnect.query(
    "SELECT * FROM vendor_data WHERE vendor_id = ?",
    [id],
    (err, existingVendor) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Server error while updating vendor" });
      }

      if (existingVendor.length === 0) {
        return res.status(404).json({
          message: "Vendor not found",
        });
      }

      // Check if vendor code is already used by another vendor
      if (vendor_code) {
        sqlDBConnect.query(
          "SELECT * FROM vendor_data WHERE vendor_code = ? AND vendor_id != ?",
          [vendor_code, id],
          (codeErr, codeExists) => {
            if (codeErr) {
              console.error("Database error:", codeErr);
              return res
                .status(500)
                .json({ message: "Server error while updating vendor" });
            }

            if (codeExists.length > 0) {
              return res.status(409).json({
                message: "Vendor code is already in use by another vendor",
              });
            }

            // Update vendor
            sqlDBConnect.query(
              "UPDATE vendor_data SET vendor_code = ?, vendor_name = ? WHERE vendor_id = ?",
              [vendor_code, vendor_name, id],
              (updateErr, updateResult) => {
                if (updateErr) {
                  console.error("Database error:", updateErr);
                  return res
                    .status(500)
                    .json({ message: "Server error while updating vendor" });
                }

                return res.status(200).json({
                  message: "Vendor updated successfully",
                  vendor: { vendor_id: id, vendor_code, vendor_name },
                });
              }
            );
          }
        );
      } else {
        // Update vendor without checking code (since no code was provided)
        sqlDBConnect.query(
          "UPDATE vendor_data SET vendor_name = ? WHERE vendor_id = ?",
          [vendor_name, id],
          (updateErr, updateResult) => {
            if (updateErr) {
              console.error("Database error:", updateErr);
              return res
                .status(500)
                .json({ message: "Server error while updating vendor" });
            }

            return res.status(200).json({
              message: "Vendor updated successfully",
              vendor: { vendor_id: id, vendor_name },
            });
          }
        );
      }
    }
  );
});

// Delete a vendor
router.delete("/api/vendors/:id", (req, res) => {
  const { id } = req.params;

  // Check if vendor exists
  sqlDBConnect.query(
    "SELECT * FROM vendor_data WHERE vendor_id = ?",
    [id],
    (err, existingVendor) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Server error while deleting vendor" });
      }

      if (existingVendor.length === 0) {
        return res.status(404).json({
          message: "Vendor not found",
        });
      }

      // Delete vendor
      sqlDBConnect.query(
        "DELETE FROM vendor_data WHERE vendor_id = ?",
        [id],
        (deleteErr, deleteResult) => {
          if (deleteErr) {
            console.error("Database error:", deleteErr);
            return res
              .status(500)
              .json({ message: "Server error while deleting vendor" });
          }

          return res.status(200).json({
            message: "Vendor deleted successfully",
          });
        }
      );
    }
  );
});

module.exports = router;

const express = require('express');
const sqlDBConnect = require('./dbConnect');
const e = require('express');
const router = express.Router();

router.put('/api/assembly/:name/status', async (req, res) => {
    const { name } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'IN_ASSEMBLY', 'ASSEMBLED', 'SHIPPED_TO_EMS', 'COMPLETED'];
    
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const updateQuery = `
            UPDATE assembly_master 
            SET assembly_status = ?
            WHERE assembly_name = ?
        `;

        await new Promise((resolve, reject) => {
            sqlDBConnect.query(updateQuery, [status, name], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Fetch updated status dates
        const getStatusQuery = `
            SELECT 
                assembly_status,
                pending_date,
                in_assembly_date,
                assembled_date,
                shipped_to_ems_date,
                completed_date
            FROM assembly_master
            WHERE assembly_name = ?
        `;

        const [statusData] = await new Promise((resolve, reject) => {
            sqlDBConnect.query(getStatusQuery, [name], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        res.json({
            message: 'Status updated successfully',
            currentStatus: status,
            statusDates: {
                PENDING: statusData.pending_date,
                IN_ASSEMBLY: statusData.in_assembly_date,
                ASSEMBLED: statusData.assembled_date,
                SHIPPED_TO_EMS: statusData.shipped_to_ems_date,
                COMPLETED: statusData.completed_date
            }
        });
    } catch (error) {
        console.error('Error updating assembly status:', error);
        res.status(500).json({ error: 'Failed to update assembly status' });
    }
});
// Add new routes to assembly.js
router.get('/api/assembly/stock-status/:name', async (req, res) => {

    
    const { name } = req.params;
    
    try {
        // Get assembly components
        const componentsQuery = `SELECT * FROM ${name}`;
        const components = await new Promise((resolve, reject) => {
            sqlDBConnect.query(componentsQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Check inventory levels for each component
        const stockStatus = await Promise.all(components.map(async (comp) => {
            const query = `
                SELECT Quantity as available
                FROM ${comp.component}
                WHERE LOWER(TRIM(Description)) = LOWER(TRIM(?))
            `;
            
            const [inventory] = await new Promise((resolve, reject) => {
                sqlDBConnect.query(query, [comp.description], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return {
                component: comp.component,
                description: comp.description,
                required: comp.quantity,
                available: inventory ? inventory.available : 0
            };
        }));

        // Calculate maximum possible assemblies
        const maxAssemblies = Math.min(
            ...stockStatus.map(item => Math.floor(item.available / item.required))
        );

        // Determine overall status
        let status = 'IN_STOCK';
        if (maxAssemblies === 0) {
            status = 'OUT_OF_STOCK';
        } else if (stockStatus.some(item => item.available < item.required * 2)) {
            status = 'LOW_STOCK';
        }

        // Update assembly_master
        const updateQuery = `
            UPDATE assembly_master 
            SET quantity_pcs = ?,
                total_components = ?,
                status = ?
            WHERE assembly_name = ?
        `;

        await new Promise((resolve, reject) => {
            sqlDBConnect.query(updateQuery, [
                maxAssemblies,
                components.length,
                status,
                name
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            maxAssemblies,
            status,
            components: stockStatus
        });
    } catch (error) {
        console.error('Error checking stock status:', error);
        res.status(500).json({ error: 'Failed to check stock status' });
    }
});




router.post('/api/assembly/manage-quantities', (req, res) => {
    const { assemblyName, components } = req.body;
    console.log('Updating quantities for assembly:', assemblyName);
    console.log('Components:', components);

});



// Create a new assembly table when CSV is uploaded
router.post('/api/assembly/create-and-manage', async (req, res) => {
    const { assemblyName, deviceQuantity, components } = req.body;
    
    sqlDBConnect.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get database connection' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Failed to start transaction' });
            }

            try {
                // Create assembly table
                const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS ${assemblyName} (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        component VARCHAR(255) NOT NULL,
                        description TEXT,
                        quantity_required INT NOT NULL,
                        quantity_per_device INT NOT NULL,
                        fetch_stock INT NOT NULL DEFAULT 0,
                        leftover_stock INT NOT NULL DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `;

                // Create master table if not exists
                const createMasterTableQuery = 
            `
    CREATE TABLE IF NOT EXISTS assembly_master (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assembly_name VARCHAR(255) UNIQUE NOT NULL,
        quantity_pcs INT DEFAULT 0,
        total_components INT DEFAULT 0,
        status ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK') DEFAULT 'IN_STOCK',
        assembly_status ENUM('PENDING', 'IN_ASSEMBLY', 'ASSEMBLED', 'SHIPPED_TO_EMS', 'COMPLETED') DEFAULT 'PENDING',
        pending_date TIMESTAMP NULL,
        in_assembly_date TIMESTAMP NULL,
        assembled_date TIMESTAMP NULL,
        shipped_to_ems_date TIMESTAMP NULL,
        completed_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;



                // Execute table creation
                await new Promise((resolve, reject) => {
                    connection.query(createMasterTableQuery, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    connection.query(createTableQuery, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Insert into master table
                await new Promise((resolve, reject) => {
                    connection.query(
                        'INSERT INTO assembly_master (assembly_name, quantity_pcs, total_components) VALUES (?, ?, ?)',
                        [assemblyName, deviceQuantity, components.length],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });

                // Process components
                for (const comp of components) {
                    // Insert component into assembly table
                    await new Promise((resolve, reject) => {
                        const insertQuery = `
                            INSERT INTO ${assemblyName}
                            (component, description, quantity_required, quantity_per_device, fetch_stock, leftover_stock)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        
                        connection.query(insertQuery, [
                            comp.component,
                            comp.description,
                            comp.requiredTotal,
                            comp.requiredPerDevice,
                            comp.fetchStock,
                            comp.leftover
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });

                    // Update inventory
                    await new Promise((resolve, reject) => {
                        const updateQuery = `
                            UPDATE ${comp.component}
                            SET Quantity = Quantity - ?
                            WHERE Description = ?
                        `;
                        
                        connection.query(updateQuery, [
                            comp.fetchStock,
                            comp.description
                        ], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                // Commit transaction
                connection.commit((err) => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Failed to commit transaction' });
                        });
                        return;
                    }
                    
                    connection.release();
                    res.json({
                        success: true,
                        message: 'Assembly created and quantities managed successfully',
                        assemblyName,
                        componentCount: components.length
                    });
                });

            } catch (error) {
                connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                        error: 'Failed to create assembly and manage quantities',
                        details: error.message
                    });
                });
            }
        });
    });
});

// Modify the existing assemblies endpoint to include stock information
router.get('/api/assemblies', async (req, res) => {
    try {
        const query = `
            SELECT 
                am.*,
                (
                    SELECT COUNT(*)
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                    AND table_name = am.assembly_name
                ) as table_exists
            FROM assembly_master am
            ORDER BY created_at DESC
        `;
        
        const assemblies = await new Promise((resolve, reject) => {
            sqlDBConnect.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        res.json(assemblies);
    } catch (error) {
        console.error('Error fetching assemblies:', error);
        res.status(500).json({ error: 'Failed to fetch assemblies' });
    }
});

// Add components to assembly and update inventory
router.post('/api/assembly/add-components', async (req, res) => {
    const { assemblyName, components } = req.body;
    // components should be an array of { componentId, quantity, description }

    try {
        // Start transaction
        await sqlDBConnect.beginTransaction();

        for (const comp of components) {
            // Insert into assembly table
            const insertQuery = `
                INSERT INTO ${assemblyName} 
                (component, description, quantity) 
                VALUES (?, ?, ?)
            `;

            await sqlDBConnect.query(insertQuery, [
                comp.componentId,
                comp.description,
                comp.quantity
            ]);

            // Update inventory (reduce quantity)
            const updateQuery = `
                UPDATE components 
                SET quantity = quantity - ? 
                WHERE id = ?
            `;

            await sqlDBConnect.query(updateQuery, [
                comp.quantity,
                comp.componentId
            ]);
        }

        // Commit transaction
        await sqlDBConnect.commit();
        res.json({ message: 'Components added successfully' });

    } catch (error) {
        // Rollback on error
        await sqlDBConnect.rollback();
        console.error('Error adding components:', error);
        res.status(500).json({ error: 'Failed to add components' });
    }
});

// Get assembly details
router.get('/api/assembly/:name', (req, res) => {
    const { name } = req.params;
    const query = `SELECT * FROM ${name} ORDER BY created_at DESC`;
    
    sqlDBConnect.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching assembly details:', err);
            return res.status(500).json({ error: 'Failed to fetch assembly details' });
        }
        res.json(result);
    });
});

// Process CSV upload for assembly




// Get critical inventory levels (components < 10)
router.get('/api/critical-inventory', async (req, res) => {
    try {
        const CRITICAL_THRESHOLD = 10;
        const tables = ['Mosfet', 'Capacitor', 'Diode', 'Microcontroller', 'Power_IC'];
        let criticalComponents = [];

        for (const table of tables) {
            const query = `
                SELECT 
                    '${table}' as component_type,
                    ID,
                    Description,
                    Quantity,
                    Location,
                    Status
                FROM ${table}
                WHERE Quantity < ?
                ORDER BY Quantity ASC
            `;

            const results = await new Promise((resolve, reject) => {
                sqlDBConnect.query(query, [CRITICAL_THRESHOLD], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            criticalComponents = [...criticalComponents, ...results];
        }

        res.json(criticalComponents);
    } catch (error) {
        console.error('Error fetching critical inventory:', error);
        res.status(500).json({ error: 'Failed to fetch critical inventory levels' });
    }
});

// Enhanced inventory check
// Backend: Modified inventory check endpoint
// Enhanced inventory check endpoint
router.post('/api/assembly/check-inventory', async (req, res) => {
    const { components, deviceQuantity = 1 } = req.body;
    const shortages = [];
    const CRITICAL_THRESHOLD = 10;

    try {
        for (const component of components) {
            const query = `
                SELECT 
                    COALESCE(Quantity, 0) as available,
                    ? as required,
                    CASE 
                        WHEN Quantity < ? THEN 'CRITICAL'
                        WHEN Quantity < (? * 2) THEN 'LOW'
                        ELSE 'ADEQUATE'
                    END as status,
                    FLOOR(Quantity / ?) as possible_assemblies
                FROM ${component.component} 
                WHERE LOWER(TRIM(Description)) = LOWER(TRIM(?))
                LIMIT 1
            `;

            const totalRequired = component.quantity * deviceQuantity;
            const results = await new Promise((resolve, reject) => {
                sqlDBConnect.query(
                    query,
                    [
                        totalRequired,
                        CRITICAL_THRESHOLD,
                        totalRequired,
                        component.quantity,
                        component.description
                    ],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });

            if (results.length && results[0].available < totalRequired) {
                shortages.push({
                    component: component.component,
                    description: component.description,
                    required: totalRequired,
                    available: results[0].available,
                    status: results[0].status,
                    possible_assemblies: results[0].possible_assemblies
                });
            }
        }

        res.json({
            shortages,
            hasCritical: shortages.some(s => s.status === 'CRITICAL'),
            minPossibleAssemblies: Math.min(
                ...shortages.map(s => s.possible_assemblies)
            )
        });
    } catch (error) {
        console.error('Error checking inventory:', error);
        res.status(500).json({ error: 'Failed to check inventory levels' });
    }
});


router.post('/api/assembly/delete', async (req, res) => {
    const { assemblyName } = req.body;

    sqlDBConnect.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to get database connection' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Failed to start transaction' });
            }

            try {
                // First, get all components from the assembly to be deleted
                const assemblyComponents = await new Promise((resolve, reject) => {
                    connection.query(
                        `SELECT * FROM ${assemblyName}`,
                        (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        }
                    );
                });

                // Restock components to their respective tables
                for (const component of assemblyComponents) {
                    await new Promise((resolve, reject) => {
                        const updateQuery = `
                            UPDATE ${component.component}
                            SET Quantity = Quantity + ?
                            WHERE Description = ?
                        `;
                        
                        connection.query(
                            updateQuery,
                            [component.fetch_stock, component.description], // Using fetch_stock instead of quantity
                            (err) => {
                                if (err) {
                                    console.error('Error restocking component:', err);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            }
                        );
                    });
                }

                // Delete from assembly_master
                await new Promise((resolve, reject) => {
                    connection.query(
                        'DELETE FROM assembly_master WHERE assembly_name = ?',
                        [assemblyName],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });

                // Drop the assembly table
                await new Promise((resolve, reject) => {
                    connection.query(
                        `DROP TABLE IF EXISTS ${assemblyName}`,
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });

                // Commit the transaction
                connection.commit((err) => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Failed to commit transaction' });
                        });
                        return;
                    }
                    
                    connection.release();
                    res.json({
                        message: 'Assembly deleted and components restocked successfully',
                        restoredComponents: assemblyComponents.map(comp => ({
                            component: comp.component,
                            description: comp.description,
                            quantityRestored: comp.fetch_stock
                        }))
                    });
                });

            } catch (error) {
                connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                        error: 'Failed to delete assembly and restock components',
                        details: error.message
                    });
                });
            }
        });
    });
});



module.exports = router;
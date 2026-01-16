const sqlDBConnect = require('./dbConnect');

// First, let's create a function to insert vendor data
async function insertVendorData() {
    const vendors = [
        { Vendor_Id: 1, Vendor_Name: 'Mouser Electronics', Vendor_Code: 'MOU' },
        { Vendor_Id: 2, Vendor_Name: 'Digi-Key', Vendor_Code: 'DK' },
        { Vendor_Id: 3, Vendor_Name: 'Arrow Electronics', Vendor_Code: 'ARW' },
        { Vendor_Id: 4, Vendor_Name: 'Newark', Vendor_Code: 'NWK' },
        { Vendor_Id: 5, Vendor_Name: 'Avnet', Vendor_Code: 'AVN' }
    ];

    
    for (const vendor of vendors) {
        await new Promise((resolve, reject) => {
            const query = 'INSERT INTO vendor_data (Vendor_Id, Vendor_Name, Vendor_Code) VALUES (?, ?, ?)';
            sqlDBConnect.query(query, [vendor.Vendor_Id, vendor.Vendor_Name, vendor.Vendor_Code], (err, result) => {
                if (err) {
                    // If error is duplicate entry, just resolve
                    if (err.code === 'ER_DUP_ENTRY') {
                        resolve();
                    } else {
                        reject(err);
                    }
                } else {
                    console.log(`Inserted vendor: ${vendor.Vendor_Name}`);
                    resolve(result);
                }
            });
        });
    }
    return vendors.map(v => v.Vendor_Id);
}


const tables = ['Mosfet', 'Capacitor', 'Diode', 'Microcontroller', 'Power_IC', 'Resistor'];

const manufacturers = {
    Mosfet: ['Infineon', 'Texas Instruments', 'ON Semi', 'Vishay', 'STMicro'],
    Capacitor: ['Murata', 'TDK', 'Samsung', 'Yageo', 'Kemet'],
    Diode: ['ON Semi', 'Vishay', 'Diodes Inc', 'Nexperia', 'Rohm'],
    Microcontroller: ['STMicro', 'Microchip', 'NXP', 'Texas Instruments', 'Renesas'],
    Power_IC: ['Texas Instruments', 'Analog Devices', 'Maxim', 'ON Semi', 'Linear Tech'],
    Resistor: ['Yageo', 'Vishay', 'Panasonic', 'TE Connectivity', 'Bourns']
};

const packages = {
    Mosfet: ['SOT-23', 'TO-220', 'DPAK', 'SO-8', 'QFN', 'SOIC'],
    Capacitor: ['0402', '0603', '0805', '1206'],
    Diode: ['SOD-123', 'DO-214AC', 'SOT-23', 'DO-35'],
    Microcontroller: ['LQFP', 'QFN', 'TQFP', 'BGA', 'SOIC'],
    Power_IC: ['SOIC', 'QFN', 'TSSOP', 'DFN', 'TO-263'],
    Resistor: ['0402', '0603', '0805', '1206']
};

function generateDescription(table, index) {
    switch(table) {
        case 'Mosfet':
            return `N-Channel Mosfet ${30 + index}V ${2 + index % 5}A`;
        case 'Capacitor':
            return `${index * 10}uF ${16 + index % 5 * 10}V Ceramic`;
        case 'Diode':
            return `Schottky ${40 + index}V ${1 + index % 3}A`;
        case 'Microcontroller':
            return `32-bit MCU ${80 + index}MHz ${32 + index * 8}KB Flash`;
        case 'Power_IC':
            return `DC-DC Conv ${3.3 + index % 5}V ${1 + index % 3}A`;
        case 'Resistor':
            return `${index * 100}Ω ${1/4}W ${1}%`;
    }
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function insertComponentData(validVendorIds) {
    for (const table of tables) {
        for (let i = 0; i < 100; i++) {
            const ipn = `IPN${String(i + Date.now()).padStart(6, '0')}`;  // Make IPN unique by adding timestamp
            const id = `${table.substring(0, 3).toUpperCase()}${String(i + Date.now()).padStart(5, '0')}`; // Make ID unique

            const data = {
                ID: id,
                IPN: ipn,
                Description: generateDescription(table, i),
                Mfg: getRandomElement(manufacturers[table]),
                MFG_part_no: `MFG${String(Date.now() + i).padStart(7, '0')}`,
                Package: getRandomElement(packages[table]),
                Vendor_id: getRandomElement(validVendorIds),
                Quantity: Math.floor(50 + Math.random() * 200),
                Avg_Price: Number((0.5 + Math.random() * 10).toFixed(2)),
                Location: `Shelf-${String.fromCharCode(65 + i % 8)}${i % 10}`,
                Status: getRandomElement(['Active', 'Low Stock', 'Discontinued'])
            };

            try {
                // Check if record exists
                const checkQuery = `SELECT ID FROM ${table} WHERE ID = ? OR IPN = ?`;
                const exists = await new Promise((resolve, reject) => {
                    sqlDBConnect.query(checkQuery, [data.ID, data.IPN], (err, result) => {
                        if (err) reject(err);
                        resolve(result.length > 0);
                    });
                });

                if (!exists) {
                    const insertQuery = `
                        INSERT INTO ${table} 
                        (ID, IPN, Description, Mfg, MFG_part_no, Package, Vendor_id, Quantity, Avg_Price, Location, Status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    await new Promise((resolve, reject) => {
                        sqlDBConnect.query(insertQuery, Object.values(data), (err, result) => {
                            if (err) reject(err);
                            console.log(`Inserted row ${i + 1} into ${table}`);
                            resolve(result);
                        });
                    });
                } else {
                    console.log(`Skipping duplicate entry for ${table} with ID: ${data.ID}`);
                    continue;
                }
            } catch (err) {
                console.log(`Skipping entry due to error: ${err.message}`);
                continue;
            }
        }
        console.log(`Completed inserting rows into ${table}`);
    }
}

const specificComponents = [
    {
        table: 'Capacitor',
        components: [
            { desc: 'CAP CER 0.1UF 50V X7R 1206', package: '1206', mfg: 'Murata', status: 'Active' },
            { desc: 'CAP CER 2.2UF 50V X7R 1206', package: '1206', mfg: 'TDK', status: 'Active' },
            { desc: 'CAP CER 4.7UF 50V X5R 1206', package: '1206', mfg: 'Samsung', status: 'Active' },
            { desc: '47uF/50V Electrolytic capacitor ,5000H,2.75mm pin distance, 6.68mm dia', package: 'RADIAL', mfg: 'Yageo', status: 'Active' },
            { desc: '100uF/16V ,Electrolytic Capacitor 5000h, 2.54mm pin distance , 5.5 mm dia', package: 'RADIAL', mfg: 'Kemet', status: 'Active' },
            { desc: 'CAP CER 0.1UF 6.3V X7R 0603', package: '0603', mfg: 'Murata', status: 'Active' },
            { desc: 'CAP CER 1UF 10V 10% X7R 1206', package: '1206', mfg: 'TDK', status: 'Active' },
            { desc: 'CAP CER 10UF 10V Y5V 1206', package: '1206', mfg: 'Samsung', status: 'Active' },
            { desc: 'CAP ALUM 22UF 20% 10V RADIAL', package: 'RADIAL', mfg: 'Kemet', status: 'Active' }
        ]
    },
    {
        table: 'Diode',
        components: [
            { desc: 'DIODE GEN PURP 75V 200MA DO213AA', package: 'DO213AA', mfg: 'ON Semi', status: 'Active' },
            { desc: 'DIODE ZENER 18V 500MW SOD80C', package: 'SOD80C', mfg: 'Vishay', status: 'Active' },
            { desc: 'DIODE ZENER 5.1V 500MW SOD80C', package: 'SOD80C', mfg: 'Diodes Inc', status: 'Active' },
            { desc: 'DIODE SCHOTTKY 60V 3A SMAF', package: 'SMAF', mfg: 'Nexperia', status: 'Active' },
            { desc: 'DIODE SWITCH 100V 0.15A SOD123', package: 'SOD123', mfg: 'Rohm', status: 'Active' }
        ]
    },
    {
        table: 'Mosfet',
        components: [
            { desc: 'MOSFET P-CH 40V 40A TO252-3', package: 'TO252-3', mfg: 'Infineon', status: 'Active' },
            { desc: 'MOSFET N-CH 60V 200MA SOT23-3', package: 'SOT23-3', mfg: 'Texas Instruments', status: 'Active' },
            { desc: 'TRANS NPN 45V 100MA TO236AB', package: 'TO236AB', mfg: 'ON Semi', status: 'Active' },
            { desc: 'TRANS PNP 45V 100MA TO236AB', package: 'TO236AB', mfg: 'STMicro', status: 'Active' },
            { desc: 'MOSFET P-CH 50V 130MA SOT23-3', package: 'SOT23-3', mfg: 'Vishay', status: 'Active' }
        ]
    },
    
    {
        table: 'Power_IC',
        components: [
            { desc: 'IC REG LINEAR 5.0V 200MA SOT23-5', package: 'SOT23-5', mfg: 'Texas Instruments', status: 'Active' },
            { desc: 'IC REG LINEAR 5V 1A SOT223', package: 'SOT223', mfg: 'Analog Devices', status: 'Active' },
            { desc: 'IC REG LDO 3.3V 1A SC73', package: 'SC73', mfg: 'ON Semi', status: 'Active' }
        ]
    },
    {
        table: 'Microcontroller',
        components: [
            { desc: 'IC MCU 8BIT 16KB FLASH 20TSSOP', package: 'TSSOP20', mfg: 'Microchip', status: 'Active' },
            { desc: 'HC05 Bluetooth Module', package: 'MODULE', mfg: 'STMicro', status: 'Active' },
            { desc: 'IC REG LINEAR 5V 1A SOT223', package: 'MODULE', mfg: 'STMicro', status: 'Active' },
            { desc: 'IC REG LDO 3.3V 1A SC73', package: 'MODULE', mfg: 'STMicro', status: 'Active' },
            
        ]
    },
    
    {
        table: 'Resistor',
        components: [
            { desc: 'RES 10.00K OHM 1/10W 1% SMD 1206', package: '1206', mfg: 'Yageo', status: 'Active' },
            { desc: 'RES 1.00K OHM 1/10W 1% 1206 SMD', package: '1206', mfg: 'Vishay', status: 'Active' },
            { desc: 'RES SMD 470 OHM 1% 1/8W 1206', package: '1206', mfg: 'Panasonic', status: 'Active' },
            { desc: 'RES 100K OHM 1/10W 1% 1206 SMD', package: '1206', mfg: 'Bourns', status: 'Active' },
            { desc: 'RES SMD 0 OHM 1% 1/8W 1206', package: '1206', mfg: 'Yageo', status: 'Active' },
            { desc: 'RES 0.01 OHM 1% 2W 2512', package: '2512', mfg: 'Vishay', status: 'Active' },
            { desc: 'RES 0.1 OHM 1% 2W 2512', package: '2512', mfg: 'Panasonic', status: 'Active' },
            { desc: 'RES SMD 10 OHM 1% 1/8W 1206', package: '1206', mfg: 'TE Connectivity', status: 'Active' }
        ]
    }
];

async function insertSpecificComponents(validVendorIds) {
    for (const category of specificComponents) {
        for (const component of category.components) {
            const data = {
                ID: `${category.table.substring(0, 3).toUpperCase()}${String(Date.now()).padStart(5, '0')}`,
                IPN: `IPN${String(Date.now()).padStart(6, '0')}`,
                Description: component.desc,
                Mfg: getRandomElement(manufacturers[category.table]),
                MFG_part_no: `MFG${String(Date.now()).padStart(7, '0')}`,
                Package: component.package,
                Vendor_id: getRandomElement(validVendorIds),
                Quantity: Math.floor(50 + Math.random() * 200),
                Avg_Price: Number((0.5 + Math.random() * 10).toFixed(2)),
                Location: `Shelf-${String.fromCharCode(65 + Math.floor(Math.random() * 8))}${Math.floor(Math.random() * 10)}`,
                Status: getRandomElement(['Active', 'Low Stock', 'Discontinued'])
            };

            const insertQuery = `
                INSERT INTO ${category.table} 
                (ID, IPN, Description, Mfg, MFG_part_no, Package, Vendor_id, Quantity, Avg_Price, Location, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            try {
                await new Promise((resolve, reject) => {
                    sqlDBConnect.query(insertQuery, Object.values(data), (err, result) => {
                        if (err) reject(err);
                        console.log(`Inserted ${component.desc}`);
                        resolve(result);
                    });
                });
            } catch (err) {
                console.log(`Error inserting ${component.desc}: ${err.message}`);
            }
        }
    }
}


async function main() {
    try {
        console.log('Starting data insertion...');
        const validVendorIds = await insertVendorData();
        await insertSpecificComponents(validVendorIds);
        console.log('All specific components inserted successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error in main execution:', err);
        process.exit(1);
    }
}

main();
// Add packages
require("dotenv").config();
// Add database package and connection string
const {
    Pool
} = require('pg');
const pool = new Pool({
    // connectionString: process.env.DATABASE_URL,
    connectionString: "postgres://xzwofreoevhfja:b44a76b3a1645a7f0c7b9c334a5145b5e2783fbc781c995ca4c2a91e326ab6f8@ec2-54-243-92-68.compute-1.amazonaws.com:5432/d9gjsbe12hjkeh",
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM product";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

//Module exports are the instruction that tells Node. js which bits of code (functions, objects, strings, etc.) 
//to “export” from a given file so other files are allowed to access the exported code.
module.exports.getTotalRecords = getTotalRecords;


const insertProduct = (product) => {
    // Will accept either a product array or product object
    if (product instanceof Array) {
        params = product;
    } else {
        params = Object.values(product);
    };

    const sql = `INSERT INTO product (prod_id, prod_name, prod_desc, prod_price)
                 VALUES ($1, $2, $3, $4)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success",
                msg: `Product id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail",
                msg: `Error on insert of product id ${params[0]}.  ${err.message}`
            };
        });
};

// Add this at the bottom
module.exports.insertProduct = insertProduct;

const findProducts = (product) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM product WHERE true";

    // Check data provided and build query as necessary
    if (product.prod_id !== "") {
        params.push(parseInt(product.prod_id));
        sql += ` AND prod_id = $${i}`;
        i++;
    };
    if (product.prod_name !== "") {
        params.push(`${product.prod_name}%`);
        sql += ` AND UPPER(prod_name) LIKE UPPER($${i})`;
        i++;
    };
    if (product.prod_desc !== "") {
        params.push(`${product.prod_desc}%`);
        sql += ` AND UPPER(prod_desc) LIKE UPPER($${i})`;
        i++;
    };
    if (product.prod_price !== "") {
        params.push(parseFloat(product.prod_price));
        sql += ` AND prod_price >= $${i}`;
        i++;
    };

    sql += ` ORDER BY prod_id`;
    // for debugging
    console.log("sql: " + sql);
    console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return {
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

// Add towards the bottom of the page
module.exports.findProducts = findProducts;
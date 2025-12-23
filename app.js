// mysql::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// conexion
import mysql from 'mysql2';

let conexion = mysql.createConnection({
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306  
})

// // prueba de agregar materiales
// const test = `INSERT INTO materiales 
// (material_type, material_name, material_value, meter, material_id)
// VALUES ('miyuki', 'miyuki rojo', 0.5, 'no',0);`

// conexion.query(test, (error, results)=>{
//     if(error){
//         console.log(error);

//     }else{
//         console.log('funciono')
//     }
// })

// EXPRESS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

import express from 'express';
import path from 'path';
import { error } from 'console';

let app = express();

app.use(express.urlencoded({ extended: true })); 

app.use(express.json());

app.use(express.static(path.join('public')));

app.set('view engine', 'ejs')

//RENDER LINKS:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

app.get('/', (req, res)=>{
    res.render('index')

});

app.get('/createMat.ejs', (req,res) =>{
    res.render('createMat')
})

app.get('/deleteMat.ejs', (req,res) =>{
    res.render('deleteMat')
})
app.get('/editarMat.ejs', (req,res) =>{
    res.render('editarMat')
})

app.get('/calcular.ejs', (req,res) =>{
    res.render('calcular')
})


//INSERTAR MATERIAL:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.post('/api/insert-materials', (req,res) =>{
    const { material_type, material_name, material_value, meter, material_id } = req.body
    
    const insertData = `
        INSERT INTO materiales 
        (material_type, material_name, material_value, meter, material_id)
        VALUES (?, ?, ?, ?, ?)
    `
    conexion.query(insertData, [`${material_type}`, `${material_name}`, Number(material_value), `${meter}`, Number(material_id)], (error, result) =>{
        if(error){
            console.log(error);

        }else{
            res.json({ exito: true });
        console.log(result)
        }
    })
})

//BUSCAR MATERIALES::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.get("/api/search-materials", (req, res) =>{
    const query = req.query.q;

    const sqlQuery = `SELECT * FROM materiales WHERE material_name LIKE ?`
    conexion.query(sqlQuery, [`%${query}%`], (error, results) =>{
        if(error){
            console.log(error);
            
        }else{
            res.json(results);
            console.log(results);
        }
    })
})


// EDITAR MATERIAL SELECCIONADO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.post("/api/edit-materials", (req, res) =>{
    
    const { id, materialName, materialType, materialValue } = req.body;

    const editRow = `
        UPDATE materiales
        SET material_name = ?,
            material_type = ?,
            material_value= ?
        WHERE material_id = ?
    `
    conexion.query(editRow,[materialName, materialType, materialValue, Number(id)] , (error, result) =>{
        if (error) {
           
            console.error("Error GRAVE en SQL:", error); 
            return res.status(500).json({ error: "Falló la base de datos" });
        }
        res.json({ exito: true });
        console.log(result)
    });
});
  

// ELIMINAR MATERIAL SELECCIONADO:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.post("/api/delete-materials", (req,res) =>{
    const {id} = req.body;
    const deleteRow = `
    DELETE FROM materiales
    WHERE material_id = ?;
    `

    conexion.query(deleteRow, [id], (error, result)=>{
        if(error){
            console.log('Error: ', error);
            return res.status(500).json({ error: "Falló la base de datos" });
        }   
        res.json({ exito: true });
        console.log(result)
    })

})
app.post("/api/delete-calc", (req,res) =>{
    const {id} = req.body;
    const deleteRow = `
    DELETE FROM calculos_guardados
    WHERE id = ?;
    `

    conexion.query(deleteRow, [id], (error, result)=>{
        if(error){
            console.log('Error: ', error);
            return res.status(500).json({ error: "Falló la base de datos" });
        }   
        res.json({ exito: true });
        console.log(result)
    })

})


// GUARDAR CALCULO :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.post('/api/save-calc', (req,res) =>{
    let { nombre, contenido, id } = req.body;
    
    const saveCalcQuery = `
        INSERT INTO calculos_guardados
        (nombre, contenido, id)
        VALUES (?, ?, ?)
    `
    
    conexion.query(saveCalcQuery, [nombre, contenido, id], (error, result) =>{
        if(error){

            console.error('Error GRAVE en SQL: ',error);
            return res.status(500).json({ error: 'Fallo en la base de datos'});
        }
        res.json({ exito:true });
        console.log('EXITO: ',result)
    })
})


app.get('/api/load-calc-saved', (req,res) => {
    
    
    let calc_content = `
    SELECT * FROM calculos_guardados; 
`
conexion.query(calc_content, (error, result) =>{
    if(error){
        console.log("ERROR: ",error)
        return res.status(500).json({error:'Fallo en la base de datos'})
    }else{
        res.json(result);
        console.log(result);
    }
})
})

app.get('/api/search-calc', (req, res) =>{
    let query = req.query.q;
    let sqlQuery = `
        SELECT * FROM calculos_guardados WHERE nombre LIKE ?
        ;
    `   
    conexion.query(sqlQuery, [`%${query}%`], (error, result) =>{
        if(error){
            console.log(error);
        }else{
            res.json(result)
            console.log(result)
        }
    })
})  

// Mensaje al iniciar

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`Servidor creado con exito, para acceder a la página, por favor coloque en el navegador el siguiente link: ${PORT}`)
})



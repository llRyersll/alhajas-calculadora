const table_calc = document.getElementById('tabla-calculo');

const material_list = document.getElementById('mat-list-div');

const searchBar = document.getElementById('searchbar');

const filter = document.getElementById('filter');

const result_list = document.getElementById('result-list');

const save_calc_btn = document.getElementById('save-calc');
const load_calc = document.getElementById('load-calc');

let nombreCalculo = document.getElementById('name-calc');

let currentName = nombreCalculo.value;
nombreCalculo.addEventListener('input', setName);


let totalSpan = document.getElementById('total-precio');

let total_bolivar_Span = document.getElementById('total-precio-bs');

let mano_de_obra = document.getElementById('mano_de_obra');
let papeleria = document.getElementById('papeleria');
let transporte = document.getElementById('transporte');
let dolar_precio = document.getElementById('dolar_precio');
let porcentaje_ganancia  = document.getElementById('porcentaje_ganancia');


let save = []

let totalGlobal = 0
getDolarPrice();
async function getDolarPrice(){
    let respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    let materiales = await respuesta.json();
    

    let promedioBCV = materiales.promedio;

    dolar_precio.value = promedioBCV
    console.log(materiales);
}

searchBar.addEventListener('input', async (e) =>{
    const text = e.target.value;
    
    if(text.length < 2){
        result_list.innerHTML = '';
        return
    }
    
    let respuesta = await fetch(`/api/search-materials?q=${text}`)
    let materiales = await respuesta.json();
    result_list.innerHTML = '';
    if(materiales.length == 0){
        result_list.innerHTML = `
        <h4>No se encontraron Materiales de "${text}"</h4>
        `;
    }
    console.log(materiales);
    
    
    materiales.forEach(material => {
        
        const td = document.createElement('td');
        td.textContent = `${material.material_name} - Precio: $${parseFloat(material.material_value)}`
        
        const tr = document.createElement('tr');
        
        tr.onclick = () => AddCalc(material)
        
        tr.appendChild(td)
        result_list.appendChild(tr)
    });
});



function AddCalc(material){
    const row = document.createElement('tr');
    
    let precioUnitario = parseFloat(material.material_value);
    
    let subtotalFila = precioUnitario * 1;
    
    totalGlobal += subtotalFila;
    
    row.innerHTML = `
    <td>${material.material_name}</td>
    <td>${parseFloat(material.material_value).toFixed(3)}</td>
    <td><button class="delete-btn"> X </button></td>
    <td>
    <input type="number" value="1" min="1" class="input-cantidad"> 
    </td>
    `
    let data = {
        nombre: material.material_name,
        valor:material.material_value,
        cantidad: 1,
        id:Date.now()
    }

    save.push(data)
    console.log('datos almacenados: ',save);

    updateTotalDisplay()
    
    
    row.querySelector('.delete-btn').onclick = () =>{
        totalGlobal -= subtotalFila;
        
        let indice = save.indexOf(data);

        if(indice > -1){
            save.splice(indice, 1);
        }

        console.log("Array actualizado (borrado):", save);
        updateTotalDisplay();
        row.remove();
    }
    
    
    
    //LOGICA  DE CANTIDADES Y SUMAS Y RESTA DE VALORES
    let inputCantidad = row.querySelector('.input-cantidad');
    inputCantidad.addEventListener('input', () => {
        let nuevaCantidad = parseFloat(inputCantidad.value);
        
        if(isNaN(nuevaCantidad) || nuevaCantidad < 0) nuevaCantidad = 0;
        
        totalGlobal -= subtotalFila;
        
        subtotalFila = precioUnitario * nuevaCantidad;
        
        totalGlobal += subtotalFila;
        
        data.cantidad = nuevaCantidad;

        updateTotalDisplay()
        console.log('datos almacenados: ',save)

        
        
    })
    
    
    table_calc.appendChild(row)
    
    
    
    
    
    mano_de_obra.addEventListener('input', updateTotalDisplay);
    papeleria.addEventListener('input', updateTotalDisplay);
    transporte.addEventListener('input', updateTotalDisplay);
    porcentaje_ganancia.addEventListener('input', updateTotalDisplay);
    dolar_precio.addEventListener('input', updateTotalDisplay);
    mano_de_obra.addEventListener('input', updateTotalDisplay);
    
    
}
function updateTotalDisplay(){
        console.log('Nuevo total: ', totalGlobal);
        
        
        let porcentaje_extra = (porcentaje_ganancia.value / 100) + 1;
        montoTotal = (Number(totalGlobal.toFixed(3)) + Number(transporte.value) + Number(papeleria.value) + Number(mano_de_obra.value)) * porcentaje_extra;
        console.log('porcentaje_extra = ',porcentaje_extra) 
        
        
        total_bolivar_Span.textContent = (montoTotal * dolar_precio.value).toFixed(3) ;
        totalSpan.textContent = (montoTotal).toFixed(3);
        
        console.log(montoTotal)
    }

let dataLoaded = false;

save_calc_btn.addEventListener('click', async () =>{
    
    

    let saving = {
        nombre: currentName,
        contenido:JSON.stringify(save),
        id: null
    };
    

    try{
        const respuesta = await fetch('/api/save-calc', {
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(saving)
        });
        const resultado = await respuesta.json();
        if(resultado.exito){
            alert('MATERIAL GUARDADO CON EXITO!')

        }else{
            alert('Ocurrio un error')
        }
    }catch(error){
        console.log("Error: ", error)
    }

})

load_calc.addEventListener('click', async () => {

    if(dataLoaded) return;

    try{
        load_calc.innerHTML = `<option value="" disabled selected>Selecciona una opción</option>`;
        let load = await fetch('/api/load-calc-saved');

        let saved_data = await load.json();
        saved_data.forEach(data => {
            let option = document.createElement('option');
            dataLoaded = true;
            option.value = JSON.stringify(data);  
            option.textContent = data.nombre; 
            load_calc.appendChild(option);
            
})}catch (error){
    console.error(error)
}})
    
 load_calc.addEventListener('change', (e) => {
    
    table_calc.innerHTML = '';
    totalGlobal = 0;
    updateTotalDisplay()
    const stringData = e.target.value;
    
    if (!stringData) return;

    
    const data = JSON.parse(stringData);
    const productos = JSON.parse(data.contenido);

    let row = document.createElement('tr');
    

    productos.forEach(producto => {
        let precioUnitario = parseFloat(producto.valor); 
        let subtotalFila = precioUnitario * parseFloat(producto.cantidad);
        totalGlobal += subtotalFila;
        updateTotalDisplay();
        row.innerHTML = `
        <td>${producto.nombre}</td>    
        <td>${producto.valor}</td>    
        <td><button class="delete-btn">X</button></td>    
        <td><input value="${Number(producto.cantidad)}" type="number" class="input-cantidad" /></td>    
       `
        let inputCantidad = row.querySelector('.input-cantidad');
        
        inputCantidad.addEventListener('input', () => {
            let nuevaCantidad = parseFloat(inputCantidad.value);
            if(isNaN(nuevaCantidad) || nuevaCantidad < 0) nuevaCantidad = 0;    
            totalGlobal -= subtotalFila;       

            subtotalFila = precioUnitario * nuevaCantidad;    

            totalGlobal += subtotalFila;     

            data.cantidad = nuevaCantidad;    
            updateTotalDisplay();

        
        
    })
    row.querySelector('.delete-btn').onclick = () =>{
        totalGlobal -= subtotalFila;
        
        let indice = save.indexOf(data);

        if(indice > -1){
            save.splice(indice, 1);
        }

        console.log("Array actualizado (borrado):", save);
        updateTotalDisplay();
        row.remove();
    }
    });


    table_calc.appendChild(row);
});





function setName(){
    currentName = nombreCalculo.value;

}
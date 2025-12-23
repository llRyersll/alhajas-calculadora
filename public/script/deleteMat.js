console.log('CONEXION');

const material_select = document.getElementById('material-seleccionado');
const result_list = document.getElementById('result-list');
const searchBar = document.getElementById('searchbar');

const buscarCalculo = document.getElementById('buscarCalculo');
const listaCalculo = document.getElementById('calc-list');

let currentId = null
let calcId = null;
let calcIdSelected = {
    id:""
}
let id = {
    id:""
}
searchBar.addEventListener('input', async (e) =>{
    const text = e.target.value;

    
    if(text.length < 2){
        result_list.innerHTML = '';
        return
    }

    let respuesta = await fetch(`/api/search-materials?q=${text}`)
    let materiales = await respuesta.json();
    result_list.innerHTML = ''
    if(materiales.length == 0){
        result_list.innerHTML = `
        <h4>No se encontraron Materiales de "${text}"</h4>
        `;
    }
    console.log(materiales)


    materiales.forEach(material => {
        
        const td = document.createElement('td');
        td.textContent = `${material.material_name} - Precio: $${parseFloat(material.material_value)}`
        
        const tr = document.createElement('tr');

        tr.onclick = () => seleccionar(material);

        tr.appendChild(td)
        result_list.appendChild(tr)
    });
});

function seleccionar(material){
    
    currentId = material.material_id 
    console.log(Number(material.material_value))
    material_select.innerHTML =
    `   
    <h1 style="color:red;">ADVERTENCIA: <br>Al clickear ENVIAR se ELIMINARA el material. Comprueba que el material seleccionado.</h1>
    <h3>Nombre: </h3>
    <p>${material.material_name}</p>
    <h3>Tipo de material: </h3>    
    <p>${material.material_type}</p>
    <h3>Precio:</h3>    
    <p>$${Number(Number(material.material_value))}</p>
    <input type="submit" class="submit"/>
    `
    

    
    

    let submit = material_select.querySelector('.submit');

    submit.addEventListener('click', async () =>{

        id = {
            id: currentId,  
        }
        try{
            await fetch("/api/delete-materials",{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(id)
            });
            alert('Material Eliminado');
        } 

        catch(error){
            console.log('Error:', error)
        }
    })

}


buscarCalculo.addEventListener('input', async function(e){
    const textQuery = e.target.value;

    
    let respuesta = await fetch(`/api/search-calc?q=${textQuery}`);
    let calculos =  await respuesta.json();
    console.log(calculos)
    if(calculos.length == 0){
        listaCalculo.innerHTML = `
        <h4>No se encontraron Materiales de "${textQuery}"</h4>
        `;
    }
    listaCalculo.innerHTML = '';
     
    calculos.forEach(calculo => {
        let tr = document.createElement('tr')
        let td = document.createElement('td');
        td.textContent = `${calculo.nombre}`;
        tr.appendChild(td);
        listaCalculo.appendChild(tr);
        tr.addEventListener('click', () =>{
            calcId = calculo.id;
            console.log(calcId);
    
            material_select.innerHTML = '';
            let contenido = JSON.parse(calculo.contenido);

            let div = document.createElement('div');
            div.classList.add('text-align')
            div.innerHTML= `
            <h3>Nombre: </h3>
            <p>${calculo.nombre}</p>
            <h3>Contenido:</h3>
            ${contenido.map(content => `
                <p>${content.nombre}</p>
            `).join('')}
            <input type="submit" class="text-align"/>
            `
            material_select.appendChild(div)

            let borrarCalculo = div.querySelector('.text-align');
    
            borrarCalculo.addEventListener('click',async () =>{
                calcIdSelected.id = calcId;
            try{
            
                await fetch("/api/delete-calc",{
            
                    method: 'POST',
            
                    headers:{
            
                        'Content-Type': 'application/json'
           
                    },
           
                    body: JSON.stringify(calcIdSelected)
           
                });
           
                alert('Material Eliminado');
                location.reload()
       
            } 

        
            catch(error){
        
                console.log('Error:', error)
        
            }
    
        })
        
    })
        
})

    
});
    
    




console.log('CONEXION');

const material_select = document.getElementById('material-seleccionado')
const result_list = document.getElementById('result-list')
const searchBar = document.getElementById('searchbar')

let currentId = null

let new_values = {
    name:"",
    type:"",
    value:"",
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
    console.log(materiales)

    result_list.innerHTML = '';
    if(materiales.length == 0){
        result_list.innerHTML = `
        <h4>No se encontraron Materiales de "${text}"</h4>
        `;
    }

    materiales.forEach(material => {
        
        const td = document.createElement('td');
        td.textContent = `${material.material_type} - ${material.material_name} - Precio: $${parseFloat(material.material_value)}`
        
        const tr = document.createElement('tr');

        tr.onclick = () => seleccionar(material );

        tr.appendChild(td)
        result_list.appendChild(tr)
    });
});

function seleccionar(material){
    
    currentId = material.material_id 
    
    material_select.innerHTML =
    `   
    <h3>Nombre: </h3>
    <input type="text" value='${material.material_name}' class="name"/>
    <h3>Tipo de material: </h3>
    <input type="text" value='${material.material_type}' class="type"/>
    <h3>Precio:</h3>    
    <input type="number" value='${material.material_value}' class="value"/>
    <input type="submit" class="submit"/>
    `
    

    
    

    let submit = material_select.querySelector('.submit');

    submit.addEventListener('click', async () =>{


    
        let name = material_select.querySelector('.name').value;
        let type = material_select.querySelector('.type').value;
        let value = material_select.querySelector(".value").value;

        new_values = {
            id: currentId,
            materialName: name,
            materialType: type,
            materialValue: value
        }


        try {
            const respuesta = await fetch('/api/edit-materials',{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(new_values)
            });

            const resultado = await respuesta.json();

            if (resultado.exito){
                alert('MATERIAL EDITADO CON EXITO!');
                location.reload();
            } else {
                alert('Hubo un error al editar. Intenta de nuevo');
            }

        } catch (error){
            console.log('Error:', error)
        }
    })











}

// UPDATE table_name
// SET column1 = value1, column2 = value2, ...
// WHERE condition;
let material_type = document.getElementById('material_type');

let meter = document.getElementById('meter');

let material_name = document.getElementById('material_name');

let material_value = document.getElementById('material_value');

let insert_btn = document.getElementById('insert');

insert_btn.addEventListener('click', async ()=>{
    
    data = {
        material_type:material_type.value,
        material_name:material_name.value,
        meter:meter.value,
        material_value:material_value.value,
        material_id: 0
    }
    
    
    
   try { const respuesta = await fetch('/api/insert-materials', {
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    const resultado = await respuesta.json();

    if (resultado.exito){
        alert('MATERIAL AÑADIDO CON EXITO');
        location.reload();
    }else{
        alert('Funcionó');
    }}
    catch (error){
        console.log('Error:', error)
    }
}) 




console.log('conexion');
function alerta(titulo,mensaje,tipo){
    $("#modal_title").text(titulo);
    if(tipo === 'e'){
      $("#modal_msge").html("<p class='text-danger'>"+mensaje+"</p>");      
    }else{
      $("#modal_msge").html("<p class='text-info'>"+mensaje+"</p>");      
    }
    $("#modal").modal("show");
}
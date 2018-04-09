
	var registro;
        var anterior = "";

$(document).ready(function()
    {
		
		$('#txtCodigo').on('keypress', function (e) {
			if(e.which === 13){
				consultar();
			}
		});
	
        $("#btnConsultar").click(function(){
            
            consultar();
            
        });
		
		$("#btnEmail").click(function(){
            
            enviarCorreo();
            
        });
		
		$("#btnConsultarTodo").click(function(){
            
                $("#loading").show("fade");
                $("#items").empty();
                
                $.ajax({
                type: "GET",
                dataType:"Json",
                url: "/consulta_proveedores/public/procesos/consultartodos"}).done(function(msg){
                    
                    $("#loading").hide();
                    if(msg.codigo == '000'){
                       $(msg.data).each(function(k,v){
                            agregarInfo(v);
                        });
					    
                    }else{
                       alerta("Respuesta","No hay datos para mostrar","m"); 
                    }
                    
                
              }).error(function(e){
                  $("#loading").hide();
                  alerta("Error","Ocurrio un error al realizar la consulta","e");
              });
                
                
           
            
        });
		
		
		
		$("#btnEmail").click(function(){
		
			
		
		});
		
		
    });


function consultar(){
	if($("#txtCodigo").val() === ''){
                alerta("Error","Ingrese un codigo para buscar","e");
            }else{
                var codigo = $("#txtCodigo").val();
                $("#loading").show("fade");
                $("#items").empty();
                
                $.ajax({
                type: "POST",
                dataType:"Json",
                url: "/consulta_proveedores/public/procesos/consultar",
                data: {codigo: codigo}}).done(function(msg){
                    
                    console.log(msg);
                    $("#loading").hide();
                    if(msg.codigo == '000'){
                       agregarInfo(msg.data[0]) 
                    }else{
                       alerta("Respuesta","No hay datos para mostrar","m"); 
                    }
                    
                
              }).error(function(e){
                  $("#loading").hide();
                  alerta("Error","Ocurrio un error al realizar la consulta","e");
              });
                
                
            }
}	


function enviarCorreo(){
	if($("#txtEmail").val() === ''){
                alerta("Error","Ingrese mensaje a enviar","e");
            }else{
                registro.mensaje = $("#txtEmail").val();
                console.log(registro);
                $.ajax({
                type: "POST",
				dataType:"Json",
                url: "/consulta_proveedores/public/procesos/enviarcorreo",
                data: {mensaje: registro}}).done(function(msg){
                    
                    console.log(msg);
					$("#modalEmail").modal("hide");
					$("#txtEmail").val("");
					if(msg.codigo == '000'){
                       alerta("Respuesta","Correo ha sido enviado correctamente","m"); 
                    }else{
                       alerta("Respuesta","No se puedo enviar el correo en este momento, intente otra vez","e"); 
                    }
                
              }).error(function(e){
                  $("#loading").hide();
                  alerta("Error","Ocurrio un error al realizar la consulta","e");
              });
                
                
            }
}


	
	

function agregarInfo(data){
    
        var proceso_a = [ {fase:"PULL FINANCIERO",nombre:"Solicitud de pago"}, {fase:"PRESUPUESTO",nombre:"Solicitud de pago"}, {fase:"GESTION DE PROVEEDORES",nombre:"Revisión de documentación y registro contable"},{fase:"TESORERIA",nombre:"Generación de pagos"},{fase:"CIERRE DE PAGOS",nombre:"Pagado"}];
	var proceso_b = [ {fase:"PULL FINANCIERO",nombre:"Solicitud de pago"}, {fase:"PRESUPUESTO",nombre:"Solicitud de pago"}, {fase:"GESTION DE PROVEEDORES",nombre:"Revisión de documentación y registro contable"},{fase:"AUTORIZADO",nombre:"Generación de pagos"},{fase:"TESORERIA",nombre:"Generación de pagos"}];
    
    var contactar='';    
    if(data.des_estado === 'RETORNADO'){
        contactar = '<p class="text-danger pull-left">*El trámite ha sido retornado, por favor comuníquese con el Administrador del Contrato</p>';
    }
    
    var block =$('<div class="col-md-8 col-md-offset-2 col-sm-12 col-xs-12"><div class="x_panel"><div class="x_title"><h2 class="text-primary">Trámite # <b>'+data.id_transaccion+'</b> - UN '+data.und_descripcion+'</h2><h2 class="text-success pull-right">Área Actual: <b>'+data.alias+'</b></h2><div class="clearfix"></div></div><div class="x_content"><table class="table table-striped"><tbody></tbody></table></div><div class="ln_solid"></div>'+contactar+'<h2 class="text-info pull-right">Estado del trámite: '+data.des_estado+'</h2></div></div>');
    var item;
    var check;
    var tipo;
    var tiempo;
    var ultimoEstado;
    anterior = "";
    $(data.historial).each(function(i,v){ 
        
        if(i === 0){
            check = '<i class="fa fa-arrow-right"></i>';
            tipo = 'text-success';
            ultimoEstado = v.bit_area_asignada;
            if(v.estado_atencion === 'A TIEMPO'){
                tiempo = '<span class="label label-success">'+v.estado_atencion+'</span>';
                
            }else{
                if(data.des_estado !== "CERRADO"){
                    tiempo = '<span class="label label-danger">'+v.estado_atencion+'</span><button style="margin-left:5px" class="btn btn-danger btn-xs"><i class="fa fa-envelope"></i> Enviar reclamo</button>';
                }else{
                    tiempo = '<span class="label label-danger">'+v.estado_atencion+'</span>';
                }
                
            }
            
            
            var fechaFin = (v.bit_fecha_cierre === null) ? "En proceso de atención":v.bit_fecha_cierre.substring(0,10);
        item = $('<tr><td class="col-md-4"><a style="font-size:12px" href="javascript:void(0)" class="'+tipo+'">'+check+'<span>'+v.alias+'</span></a></td><td><h2 style="font-size:12px" class="title"><a href="javascript:void(0)">Finalizado al:'+ fechaFin +'</a></h2>'+tiempo+'<br /></td></tr>');
		
		item.find("button").click(function(){
			
				$("#modalEmail").modal("show");
				registro = v;
		});
                
	
        
        if(v.alias !== anterior){
            block.find("tbody").append(item);
        }        
        anterior = v.alias;
        
            
        }else{
            check = '<i class="fa fa-check"></i>';
            tipo = 'text-info';
            tiempo = '';
        }
       
		
    });
	
	$("#items").append(block);
	
        if(data.des_estado !== "CERRADO"){
        
                    
                var secuencia;
	
                if(data.tipo_proceso_documental === 1){
                    secuencia = proceso_a;
                }else{
                    secuencia = proceso_b;
                }


                var j = 0;
                var desde=0;
                var i=0;

                for(i==0;i<secuencia.length;i++){
                    if(ultimoEstado === secuencia[i].fase){
                        desde++;
                        break;
                    }
                    desde++;
                }

                if(desde<secuencia.length){
                    
                    for (j=desde; j < secuencia.length; j++) {
                                if(secuencia[j].nombre !== anterior){
                                    item = $('<tr><td class="col-md-4"><a style="font-size:12px" href="javascript:void(0)" class="text-muted"><span>'+secuencia[j].nombre+'</span></a></td><td><h2 class="title"></h2><br /></td></tr>');
                                    block.find("tbody").prepend(item);
                                }
                                anterior = secuencia[j].nombre;
                        }

                }
        
        }
        
 
}





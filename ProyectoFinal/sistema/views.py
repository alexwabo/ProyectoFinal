from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
 
#importing loading from django template 
from django.template import loader
from sistema.db.DbConx import Conexion
from django.http.response import JsonResponse
from django.http.response import HttpResponseRedirect
from bson import json_util 
import bson
import json
from sistema.obj.Object import Object
from django.template.context import Context

#our view which is a function named index

def dashboard(request):
    
    #getting our template 
    #template = loader.get_template('dashboard.html')
    try:
        u = request.session['usuario']
    except KeyError:
        pass
        return HttpResponseRedirect('/sistema/login')
    
    conx = Conexion()
    db = conx.conectar()
    proc = db.sucursales.find()
    
    context = {
        'sucursales':proc,
        'usuario':u
    }
    
    #rendering the template in HttpResponse
    return render(request, 'dashboard.html', context)



def svc_inventario(request):
    
    if request.method == "POST":
        idSucursal = int(request.POST.get('sucursal'))
        conx = Conexion()
        db = conx.conectar()
        sucursales = db.inventario.find({"idSucursal":idSucursal})
    
    return HttpResponse(bson.json_util.dumps(sucursales), content_type='application/json')
    
def svc_datos(request):
        
    if request.method == "POST":
        
        idSucursal = int(request.POST.get('sucursal'))
        
        conx = Conexion()
        db = conx.conectar()
        #total = db.personal.aggregate([{"$match": {"idSucursal": {"$eq": 5}}},{"$count": "total_personal"}])
        
        listaPersonal = db.personal.find({"idSucursal":idSucursal})
        
        lista= []
        totalPersonal = 0
        
        for p in listaPersonal:
            lista.append(p)
            totalPersonal += 1
    
        
        data = {}
        data["totalPersonal"] = totalPersonal
        data["listaPersonal"] = lista
        
        listaArticulos = db.inventario.find({"idSucursal":idSucursal}).sort([('stock', -1)])
        totalArticulos = 0
        totalInventario = 0
        listaInventario= []
        for p in listaArticulos:
            listaInventario.append(p)
            totalArticulos+= p["stock"]
            totalInventario += p["pvp"]*p["stock"]
            
        data["totalArticulos"] = totalArticulos
        data["totalInventario"] = round(totalInventario,2)
        data["listaInventario"] = listaInventario    
        
        
        listaVentas = db.ventas.find({"idSucursal":idSucursal})
        totalVentas = 0
        totalVentasMes = 0
        
        for v in listaVentas:
            totalVentas += v["total"]
            if (v["fechaVenta"].year == 2018) and (v["fechaVenta"].month == 3) : 
                totalVentasMes  += v["total"]
            
            
        data["totalVentas"] = round(totalVentas,2)
        data["totalVentasMes"] = round(totalVentasMes,2)
        
        
        ventasMes = db.ventas.aggregate([{'$match':{ 'idSucursal' : idSucursal}},{'$group':{'_id':{'month': { '$month': '$fechaVenta' },'year': { '$year': '$fechaVenta' }},'totalVentas': { '$sum': '$total'  }}},{ '$sort': {'_id.year':1,'_id.month':1}}])
        listaVentasMes= []
        
        for vm in ventasMes:
            listaVentasMes.append(vm) 
        
        data["listaVentasMes"] = listaVentasMes
        
        
        ventasxVendedor = db.ventas.aggregate([{'$match' : {'idSucursal' : idSucursal}},{'$group' : {'_id':'$idPersonal','totalVenta': { '$sum': '$total' }}}])
        listaVentasxVendedor = []
        for vv in ventasxVendedor: 
            vv["vendedor"] = db.personal.find({'idPersonal':vv['_id']})
            listaVentasxVendedor.append(vv)
            
        data["listaVentasxVendedor"] = listaVentasxVendedor
        
        ## 
        
        ventasxArticulos = db.ventas.aggregate([ { '$unwind': '$detalleFactura' },{'$match' : {'idSucursal' : idSucursal}},{'$group': {'_id':{'idArticulo':'$detalleFactura.idArticulo','articulo':'$detalleFactura.descripcion','modelo':'$detalleFactura.modelo'},'totalVenta': { '$sum': '$detalleFactura.total' }}}])
        listaVentasxArticulos = []
        for va in ventasxArticulos:
            listaVentasxArticulos.append(va)
        
        data["listaVentasxArticulos"] = listaVentasxArticulos
        
        
        
        #total = db.personal.aggregate([{"$match": {"idSucursal": {"$eq": 5}}},{"$count": "total_personal"}])
       
    return HttpResponse(bson.json_util.dumps(data), content_type='application/json')

def logout(request):
    try:
        del request.session['usuario']
        request.session.modified = True
        print(request.session['usuario'])
    except KeyError:
        pass
    return HttpResponseRedirect('/sistema/login')
    
    
var Conceptos = new Meteor.Collection("conceptos");

if (Meteor.isClient) {
  Session.setDefault('filtroConcepto', null);
  Session.setDefault('idArticulo', null);
  Session.setDefault('filtroArticulo', null);
  
////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
};

var activateInput = function (input) {
  input.focus(); 
  //input.select(); //queda todo seleccionado
};

//¿Como editar un textarea?
var activateTxtArea = function (input) {
  input.focus(); 
  //textarea.select();
};

  Template.titulo.numConceptos = function () {
   var cantidadConceptos = Conceptos.find().count();
   return cantidadConceptos;
  };
  
   Template.titulo.events({
  	'click .numConceptos': function (e) {
  		e.preventDefault();
  		Session.set('filtroConcepto', null );
		Session.set('filtroArticulo', null );
  	}
  })
  
  Template.listaConceptos.selected = function () {
    return Session.equals("filtroArticulo", this.concepto) ? "selected" : '';
  };

  Template.fConceptos.events({
   //var vnConcepto = $('#nConcepto').val();
    'click button.btn-success' : function (e) {
    var vnConcepto = $('#nConcepto').val();
    e.preventDefault();
    if (!vnConcepto) {
        Session.set('filtroConcepto',null);
		      alert(" Introduce un concepto \n para añadir información ");
	     }
		    else if (Conceptos.find({concepto: vnConcepto}).count()>0) {
			    alert("Ya existe,\n cambia el nombre del concepto,\n o actualizalo, gracias")
		     Session.set('filtroConcepto', vnConcepto );
		    }
	     else{
	 	     Conceptos.insert({concepto: vnConcepto, articulo: "Click para editar"})
		     Session.set('filtroConcepto', vnConcepto );
		     Session.set('filtroArticulo', vnConcepto );
	     }
     },
	    'click button.btn-info' : function (e) {
     	  var vnConcepto = $('#nConcepto').val();
        e.preventDefault();
     	  if (!vnConcepto) {
         Session.set('filtroConcepto',null);
	     }
	      Session.set('filtroConcepto', vnConcepto );
        }
    });

	Template.fConceptos.events(okCancelEvents(
    '#nConcepto',
     {
      ok: function (value) {
    		var vnConcepto = $('#nConcepto').val();
       //Conceptos.update(this._id, {$set: {articulo: value}});
       Session.set('filtroConcepto', vnConcepto);
      },
      cancel: function () {
       Session.set('filtroConcepto', null);
      }
  }));

	Template.listaConceptos.events({
  	  'click button': function () { 
		var klausk=prompt("¿ Password ? \n  para borrar" );
      if (klausk === "loQueQuieras")  //debo pasar la password al servidor
       {
        Conceptos.remove(this._id);
       }  	  
	  },
	  'click': function () {
	   Session.set('filtroArticulo',this.concepto);//filtroConcepto
	  } 
	});

	Template.lConceptos.tConceptos = function () { //lista de conceptos
	 var fc = Session.get('filtroConcepto');
	 if (fc === null){
    return Conceptos.find({}, {sort: { concepto: 1}});
  } 
  else {
  	//$regex: coincide con el registro que contenga el concepto tecleado en el formulario  
  	//'i' es para que no distinga entre mayúsculas y minúsculas
   return Conceptos.find({concepto: {$regex: fc, $options: 'i' }});  	
  	} 
 };
   
	Template.articulos.articulos = function () { 
	 var vArticulo = Session.get('filtroArticulo');  //filtroConcepto
	 if(!vArticulo){ Session.set('filtroConcepto', null);
  	}
	 return Conceptos.find({concepto: vArticulo})	 
 };
   
   Template.articulos.events({
  /*'click .articulo': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },*/
  'click .articulo': function (evt, tmpl) { // era dblclick
    Session.set('idArticulo', this._id);
    Deps.flush(); // force DOM redraw, so we can focus the edit field
    activateTxtArea(tmpl.find("#articulo-input"));
  },
  'click button' : function (evt, tmpl) {
  	Session.set('idArticulo', this._id);
   Deps.flush(); // force DOM redraw, so we can focus the edit field
   activateInput(tmpl.find("#articulo-input")); 
  }
});

Template.articulos.events(okCancelEvents(
  '#articulo-input',
  {
    ok: function (value) {
      Conceptos.update(this._id, {$set: {articulo: value}});
      Session.set('idArticulo', null);
    },
    cancel: function () {
      Session.set('idArticulo', null);
    }
  }));

Template.articulos.articulo_class = function () {
  return this.articulo ? '' : 'empty';
};

Template.articulos.editing = function () {
  return Session.equals('idArticulo', this._id);
};

}//fin de isClient

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  if (Conceptos.find().count() === 0 ) {    //<= 10
      var conceptos = ["MeteorJs","Handlebars","MongoDb","CSS3 Responsivo","HTML5","JavaScript","NodeJs"
                   ];
      for (var i = 0; i < conceptos.length; i++)
        Conceptos.insert({concepto: conceptos[i] });
    }
  
  });
}

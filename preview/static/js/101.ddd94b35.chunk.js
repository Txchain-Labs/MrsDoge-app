(window["webpackJsonpcorona-react"]=window["webpackJsonpcorona-react"]||[]).push([[101],{1146:function(e,a,t){"use strict";t.r(a),t.d(a,"DataTables",(function(){return T}));var s=t(6),r=t(7),c=t(8),i=t(9),n=t(10),d=t(0),o=t.n(d),l=t(429),u=t.n(l),p=t(438),m=t.n(p),h=t(448),b=t.n(h),P=h.Search.SearchBar,N=[{id:"XN-1",purchasedOn:"25/09/2019",customer:"Edinburgh",shipTo:"New York",basePrice:"$1500",purchasedPrice:"$3200",status:"Open",action:""},{id:"XN-2",purchasedOn:"26/09/2019",customer:"Doe",shipTo:"Brazil",basePrice:"$4500",purchasedPrice:"$7500",status:"Pending",action:""},{id:"XN-3",purchasedOn:"26/09/2019",customer:"Sam",shipTo:"Tokyo",basePrice:"$2100",purchasedPrice:"6300",status:"Closed",action:""},{id:"XN-4",purchasedOn:"27/09/2019",customer:"Joe",shipTo:"Netherland",basePrice:"$1100",purchasedPrice:"$7300",status:"Open",action:""},{id:"XN-5",purchasedOn:"28/09/2019",customer:"Edward",shipTo:"Indonesia",basePrice:"$3600",purchasedPrice:"$4800",status:"Closed",action:""},{id:"XN-6",purchasedOn:"28/09/2019",customer:"Stella",shipTo:"Japan",basePrice:"$5600",purchasedPrice:"$3600",status:"On hold",action:""},{id:"XN-7",purchasedOn:"28/09/2019",customer:"Jaqueline",shipTo:"Germany",basePrice:"$1100",purchasedPrice:"$6300",status:"Closed",action:""},{id:"XN-8",purchasedOn:"29/09/2019",customer:"Tim",shipTo:"Italy",basePrice:"$6300",purchasedPrice:"$2100",status:"Open",action:""},{id:"XN-9",purchasedOn:"29/09/2019",customer:"John",shipTo:"Tokyo",basePrice:"$2100",purchasedPrice:"$6300",status:"Closed",action:""},{id:"XN-10",purchasedOn:"29/09/2019",customer:"Tom",shipTo:"Germany",basePrice:"$1100",purchasedPrice:"$2300",status:"Closed",action:""},{id:"XN-11",purchasedOn:"30/09/2019",customer:"Aleena",shipTo:"New York",basePrice:"$1600",purchasedPrice:"$3500",status:"Pending",action:""},{id:"XN-12",purchasedOn:"01/10/2019",customer:"Alphy",shipTo:"Brazil",basePrice:"$5500",purchasedPrice:"$7200",status:"Open",action:""},{id:"XN-13",purchasedOn:"02/10/2019",customer:"Twinkle",shipTo:"Italy",basePrice:"$1560",purchasedPrice:"$2530",status:"Open",action:""},{id:"XN-14",purchasedOn:"02/10/2019",customer:"Catherine",shipTo:"Brazil",basePrice:"$1600",purchasedPrice:"$5600",status:"Closed",action:""},{id:"XN-15",purchasedOn:"05/10/2019",customer:"Daniel",shipTo:"Singapore",basePrice:"$6800",purchasedPrice:"$9800",status:"Pending",action:""},{id:"XN-16",purchasedOn:"07/10/2019",customer:"Tom",shipTo:"Tokyo",basePrice:"$1600",purchasedPrice:"$6500",status:"On hold",action:""},{id:"XN-17",purchasedOn:"07/10/2019",customer:"Cris",shipTo:"Tokyo",basePrice:"$2100",purchasedPrice:"$6300",status:"Open",action:""},{id:"XN-18",purchasedOn:"09/10/2019",customer:"Tim",shipTo:"Italy",basePrice:"$6300",purchasedPrice:"$2100",status:"Closed",action:""},{id:"XN-19",purchasedOn:"11/10/2019",customer:"Jack",shipTo:"Tokyo",basePrice:"$3100",purchasedPrice:"$7300",status:"Pending",action:""},{id:"XN-20",purchasedOn:"14/10/2019",customer:"Tony",shipTo:"Germany",basePrice:"$1100",purchasedPrice:"$2300",status:"On hold",action:""}],O=[{dataField:"id",text:"Order #",sort:!0},{dataField:"purchasedOn",text:"Purchased On",sort:!0},{dataField:"customer",text:"Customer",sort:!0},{dataField:"shipTo",text:"Ship to",sort:!0},{dataField:"basePrice",text:"Base Price",sort:!0},{dataField:"purchasedPrice",text:"Purchased Price",sort:!0},{dataField:"status",text:"Status",sort:!0,formatter:function(e,a){return"On hold"===e?o.a.createElement("label",{className:"badge badge-info"},"On hold"):"Pending"===e?o.a.createElement("label",{className:"badge badge-danger"},"Pending"):"Closed"===e?o.a.createElement("label",{className:"badge badge-success"},"Closed"):"Open"===e?o.a.createElement("label",{className:"badge badge-warning"},"Open"):void 0}},{dataField:"action",text:"Action",sort:!1,formatter:function(){return o.a.createElement("div",null,o.a.createElement("button",{className:"btn btn-dark"},o.a.createElement("i",{className:"mdi mdi-eye-outline text-primary"}),"View"))}}],$=[{dataField:"id",order:"desc"}],T=function(e){function a(){return Object(s.a)(this,a),Object(c.a)(this,Object(i.a)(a).apply(this,arguments))}return Object(n.a)(a,e),Object(r.a)(a,[{key:"render",value:function(){return o.a.createElement("div",null,o.a.createElement("div",{className:"page-header"},o.a.createElement("h3",{className:"page-title"},"Data table"),o.a.createElement("nav",{"aria-label":"breadcrumb"},o.a.createElement("ol",{className:"breadcrumb"},o.a.createElement("li",{className:"breadcrumb-item"},o.a.createElement("a",{href:"!#",onClick:function(e){return e.preventDefault()}},"Tables")),o.a.createElement("li",{className:"breadcrumb-item active","aria-current":"page"},"Data Tables")))),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"col-12"},o.a.createElement("div",{className:"card"},o.a.createElement("div",{className:"card-body"},o.a.createElement("h4",{className:"card-title"},"Data Table"),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"col-12"},o.a.createElement(b.a,{keyField:"id",bootstrap4:!0,data:N,columns:O,search:!0},(function(e){return o.a.createElement("div",null,o.a.createElement("div",{className:"d-flex align-items-center"},o.a.createElement("p",{className:"mb-2 mr-2"},"Search in table:"),o.a.createElement(P,e.searchProps)),o.a.createElement(u.a,Object.assign({defaultSorted:$,pagination:m()()},e.baseProps,{wrapperClasses:"table-responsive"})))})))))))))}}]),a}(d.Component);a.default=T}}]);
//# sourceMappingURL=101.ddd94b35.chunk.js.map